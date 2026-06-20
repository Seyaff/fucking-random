import axios from "axios";
import { NotFoundError, BadRequestError } from "../../utils/appError";
import WhatsAppAccountModel from "./whatsapp-account.model";

const WHATSAPP_API_BASE = "https://graph.facebook.com/v22.0";

export class WhatsAppService {
    async verifyCredentials(accessToken: string, phoneNumberId: string) {
        try {
            const { data } = await axios.get(
                `${WHATSAPP_API_BASE}/${phoneNumberId}`,
                {
                    params: {
                        access_token: accessToken,
                        fields: "id,display_phone_number,verified_name",
                    },
                }
            );
            return { valid: true, phoneNumber: data.display_phone_number as string };
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.error?.message || err.message;
                throw new BadRequestError(`Meta verification failed: ${msg}`);
            }
            throw new BadRequestError("Failed to verify WhatsApp credentials");
        }
    }

    async connectAccount(
        userId: string,
        data: {
            businessAccountId: string;
            phoneNumberId: string;
            phoneNumber: string;
            accessToken: string;
            verifyToken: string;
        }
    ) {
        const verification = await this.verifyCredentials(data.accessToken, data.phoneNumberId);

        const existing = await WhatsAppAccountModel.findOne({ userId });

        if (existing) {
            existing.businessAccountId = data.businessAccountId;
            existing.phoneNumberId = data.phoneNumberId;
            existing.phoneNumber = data.phoneNumber || verification.phoneNumber;
            existing.accessToken = data.accessToken;
            existing.verifyToken = data.verifyToken;
            existing.isConnected = true;
            await existing.save();
            return existing;
        }

        const account = await WhatsAppAccountModel.create({
            userId,
            ...data,
            phoneNumber: data.phoneNumber || verification.phoneNumber,
            isConnected: true,
        });

        return account;
    }

    async disconnectAccount(userId: string) {
        const account = await WhatsAppAccountModel.findOne({ userId });

        if (!account) {
            throw new NotFoundError("WhatsApp account not connected");
        }

        account.isConnected = false;
        await account.save();

        return { message: "WhatsApp account disconnected" };
    }

    async getConnection(userId: string) {
        const account = await WhatsAppAccountModel.findOne({ userId }).select(
            "-accessToken -verifyToken -webhookSecret"
        );

        return account;
    }

    async sendMessage(to: string, text: string, userId: string) {
        const account = await WhatsAppAccountModel.findOne({ userId });

        if (!account || !account.isConnected) {
            throw new BadRequestError("WhatsApp not connected");
        }

        const { data } = await axios.post(
            `${WHATSAPP_API_BASE}/${account.phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "text",
                text: { body: text },
            },
            {
                headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return data;
    }

    async verifyWebhook(mode: string | undefined, token: string | undefined, challenge: string | undefined) {
        if (mode !== "subscribe" || !token) {
            return { verified: false };
        }

        const account = await WhatsAppAccountModel.findOne({ verifyToken: token });
        if (!account) {
            return { verified: false };
        }

        return { verified: true, challenge };
    }

    async processIncomingMessage(payload: any) {
        const entry = payload?.entry?.[0];
        const change = entry?.changes?.[0];
        const message = change?.value?.messages?.[0];
        const from = change?.value?.metadata?.phone_number_id;

        if (!message || !from) return null;

        const text = message.text?.body || "";
        const sender = message.from;

        return {
            from,
            sender,
            text,
            messageId: message.id,
            timestamp: message.timestamp,
        };
    }

    async getPhoneNumberId(userId: string): Promise<string | null> {
        const account = await WhatsAppAccountModel.findOne({ userId });
        return account?.phoneNumberId || null;
    }
}
