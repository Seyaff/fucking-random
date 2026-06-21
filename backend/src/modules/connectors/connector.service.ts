import axios from "axios";
import { Types } from "mongoose";
import ConnectorModel from "./connector.model";
import { BadRequestError, NotFoundError } from "../../utils/appError";
import { Env } from "../../config/app.config";

const oauthStateMap = new Map<string, { userId: string; provider: string }>();

const GMAIL_SCOPES = "https://www.googleapis.com/auth/gmail.readonly";
const SLACK_SCOPES = "channels:history,channels:read,users:read";

export class ConnectorService {
    generateState(userId: string, provider: string): string {
        const state = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        oauthStateMap.set(state, { userId, provider });
        setTimeout(() => oauthStateMap.delete(state), 10 * 60 * 1000);
        return state;
    }

    consumeState(state: string): { userId: string; provider: string } | null {
        const data = oauthStateMap.get(state);
        if (data) oauthStateMap.delete(state);
        return data ?? null;
    }

    getGmailAuthUrl(userId: string): string {
        const state = this.generateState(userId, "gmail");
        const params = new URLSearchParams({
            client_id: Env.GOOGLE_CLIENT_ID,
            redirect_uri: Env.GMAIL_REDIRECT_URI,
            response_type: "code",
            scope: GMAIL_SCOPES,
            access_type: "offline",
            prompt: "consent",
            state,
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    getSlackAuthUrl(userId: string): string {
        const state = this.generateState(userId, "slack");
        const params = new URLSearchParams({
            client_id: Env.SLACK_CLIENT_ID,
            redirect_uri: Env.SLACK_REDIRECT_URI,
            scope: SLACK_SCOPES,
            user_scope: "channels:history,channels:read",
            state,
        });
        return `https://slack.com/oauth/v2/authorize?${params}`;
    }

    async handleGmailCallback(code: string, state: string) {
        const data = this.consumeState(state);
        if (!data) throw new BadRequestError("Invalid or expired OAuth state");

        let tokenRes;
        try {
            tokenRes = await axios.post(
                "https://oauth2.googleapis.com/token",
                new URLSearchParams({
                    client_id: Env.GOOGLE_CLIENT_ID,
                    client_secret: Env.GOOGLE_CLIENT_SECRET,
                    code,
                    redirect_uri: Env.GMAIL_REDIRECT_URI,
                    grant_type: "authorization_code",
                }),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );
        } catch (err: any) {
            const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            console.error("[gmail] Token exchange failed:", detail);
            throw new BadRequestError(`Gmail token exchange failed: ${detail}`);
        }

        const { access_token, refresh_token, expires_in, scope } = tokenRes.data;

        const profileRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const email = profileRes.data.email;

        await ConnectorModel.findOneAndUpdate(
            { userId: new Types.ObjectId(data.userId), provider: "gmail" },
            {
                $set: {
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    tokenExpiry: new Date(Date.now() + expires_in * 1000),
                    isConnected: true,
                    email,
                    scope,
                },
            },
            { upsert: true }
        );
    }

    async handleSlackCallback(code: string, state: string) {
        const data = this.consumeState(state);
        if (!data) throw new BadRequestError("Invalid or expired OAuth state");

        const tokenRes = await axios.post("https://slack.com/api/oauth.v2.access", null, {
            params: {
                client_id: Env.SLACK_CLIENT_ID,
                client_secret: Env.SLACK_CLIENT_SECRET,
                code,
                redirect_uri: Env.SLACK_REDIRECT_URI,
            },
        });

        if (!tokenRes.data.ok) {
            throw new BadRequestError(tokenRes.data.error || "Slack OAuth failed");
        }

        const { access_token, refresh_token, expires_in, scope, team, authed_user } = tokenRes.data;

        const userToken = authed_user?.access_token || access_token;

        await ConnectorModel.findOneAndUpdate(
            { userId: new Types.ObjectId(data.userId), provider: "slack" },
            {
                $set: {
                    accessToken: userToken,
                    refreshToken: refresh_token || "",
                    tokenExpiry: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
                    isConnected: true,
                    teamName: team?.name || "",
                    metadata: { teamId: team?.id, authedUserId: authed_user?.id },
                    scope,
                },
            },
            { upsert: true }
        );
    }

    async refreshGmailToken(connector: any) {
        try {
            const tokenRes = await axios.post(
                "https://oauth2.googleapis.com/token",
                new URLSearchParams({
                    client_id: Env.GOOGLE_CLIENT_ID,
                    client_secret: Env.GOOGLE_CLIENT_SECRET,
                    refresh_token: connector.refreshToken,
                    grant_type: "refresh_token",
                }),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            const { access_token, expires_in } = tokenRes.data;

            await ConnectorModel.findByIdAndUpdate(connector._id, {
                $set: {
                    accessToken: access_token,
                    tokenExpiry: new Date(Date.now() + expires_in * 1000),
                },
            });

            return access_token;
        } catch {
            await ConnectorModel.findByIdAndUpdate(connector._id, { $set: { isConnected: false } });
            throw new BadRequestError("Gmail token expired. Please reconnect.");
        }
    }

    async getValidAccessToken(provider: "gmail" | "slack", userId: string): Promise<string> {
        const connector = await ConnectorModel.findOne({
            userId: new Types.ObjectId(userId),
            provider,
            isConnected: true,
        });
        if (!connector) throw new NotFoundError(`${provider} is not connected`);

        if (provider === "gmail") {
            if (connector.tokenExpiry && connector.tokenExpiry > new Date()) {
                return connector.accessToken;
            }
            if (connector.refreshToken) {
                return this.refreshGmailToken(connector);
            }
            throw new BadRequestError("Gmail token expired. Please reconnect.");
        }

        return connector.accessToken;
    }

    async fetchGmailEmails(userId: string, maxResults = 20) {
        const accessToken = await this.getValidAccessToken("gmail", userId);

        const listRes = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/messages", {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { maxResults, q: "in:inbox" },
        });

        const messages = listRes.data.messages || [];
        if (messages.length === 0) return [];

        const emails = await Promise.all(
            messages.map(async (msg: any) => {
                try {
                    const detail = await axios.get(
                        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
                        {
                            headers: { Authorization: `Bearer ${accessToken}` },
                            params: { format: "metadata", metadataHeaders: ["From", "Subject", "Date"] },
                        }
                    );

                    const headers = detail.data.payload?.headers || [];
                    const getHeader = (name: string) =>
                        headers.find((h: any) => h.name === name)?.value || "";

                    return {
                        id: detail.data.id,
                        threadId: detail.data.threadId,
                        from: getHeader("From"),
                        subject: getHeader("Subject"),
                        date: getHeader("Date"),
                        snippet: detail.data.snippet || "",
                        labelIds: detail.data.labelIds || [],
                    };
                } catch {
                    return null;
                }
            })
        );

        return emails.filter(Boolean);
    }

    async fetchGmailEmailDetail(userId: string, emailId: string) {
        const accessToken = await this.getValidAccessToken("gmail", userId);

        const detail = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { format: "full" },
            }
        );

        const payload = detail.data.payload || {};
        const headers = payload.headers || [];
        const getHeader = (name: string) =>
            headers.find((h: any) => h.name === name)?.value || "";

        const parts: any[] = [];
        const extractParts = (p: any) => {
            if (p.body?.data) {
                parts.push({
                    mimeType: p.mimeType,
                    data: p.body.data,
                });
            }
            if (p.parts) p.parts.forEach(extractParts);
        };
        extractParts(payload);

        const decodeBase64 = (data: string) => {
            try {
                return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
            } catch {
                return data;
            }
        };

        const body =
            parts
                .filter((p) => p.mimeType === "text/plain")
                .map((p) => decodeBase64(p.data))
                .join("\n") ||
            parts
                .filter((p) => p.mimeType === "text/html")
                .map((p) => decodeBase64(p.data))
                .join("\n") ||
            "";

        return {
            id: detail.data.id,
            threadId: detail.data.threadId,
            from: getHeader("From"),
            to: getHeader("To"),
            cc: getHeader("Cc"),
            subject: getHeader("Subject"),
            date: getHeader("Date"),
            body,
            labelIds: detail.data.labelIds || [],
        };
    }

    async fetchSlackMessages(userId: string, limit = 10) {
        const accessToken = await this.getValidAccessToken("slack", userId);

        const channelsRes = await axios.get("https://slack.com/api/conversations.list", {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { types: "public_channel", exclude_archived: true, limit: 20 },
        });

        if (!channelsRes.data.ok) {
            console.error("[slack] conversations.list error:", channelsRes.data.error);
            return [];
        }

        const channels = channelsRes.data.channels || [];
        if (channels.length === 0) return [];

        const results: any[] = [];

        for (const channel of channels.slice(0, 5)) {
            try {
                const histRes = await axios.get("https://slack.com/api/conversations.history", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: { channel: channel.id, limit: Math.ceil(limit / 5) },
                });

                if (!histRes.data.ok) {
                    console.error(`[slack] conversations.history for #${channel.name}:`, histRes.data.error);
                    continue;
                }

                const messages = histRes.data.messages || [];
                for (const msg of messages.slice(0, 3)) {
                    results.push({
                        channelId: channel.id,
                        channelName: channel.name,
                        user: msg.user || "unknown",
                        text: msg.text || "",
                        timestamp: msg.ts,
                        threadTs: msg.thread_ts || null,
                    });
                }
            } catch {
                continue;
            }
        }

        return results.sort((a, b) => parseFloat(b.timestamp) - parseFloat(a.timestamp)).slice(0, limit);
    }

    async disconnect(provider: "gmail" | "slack", userId: string) {
        const result = await ConnectorModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), provider },
            {
                $set: {
                    isConnected: false,
                    accessToken: "",
                    refreshToken: "",
                    tokenExpiry: undefined,
                },
            }
        );
        if (!result) throw new NotFoundError(`${provider} connection not found`);
        return { message: `${provider} disconnected successfully` };
    }

    async getStatus(provider: "gmail" | "slack", userId: string) {
        const connector = await ConnectorModel.findOne({
            userId: new Types.ObjectId(userId),
            provider,
        }).lean();
        if (!connector) {
            return { provider, isConnected: false, email: null, teamName: null };
        }
        return {
            provider: connector.provider,
            isConnected: connector.isConnected,
            email: connector.email || null,
            teamName: connector.teamName || null,
        };
    }

    async listAllStatuses(userId: string) {
        const connectors = await ConnectorModel.find({
            userId: new Types.ObjectId(userId),
        }).lean();

        const gmailStatus =
            connectors.find((c) => c.provider === "gmail") || null;
        const slackStatus =
            connectors.find((c) => c.provider === "slack") || null;

        return {
            gmail: gmailStatus
                ? { provider: "gmail", isConnected: gmailStatus.isConnected, email: gmailStatus.email }
                : { provider: "gmail", isConnected: false, email: null },
            slack: slackStatus
                ? { provider: "slack", isConnected: slackStatus.isConnected, teamName: slackStatus.teamName }
                : { provider: "slack", isConnected: false, teamName: null },
        };
    }
}
