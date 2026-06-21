import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { ConnectorService } from "./connector.service";
import { HTTPSTATUS } from "../../config/http.config";
import { Env } from "../../config/app.config";

const connectorService = new ConnectorService();

export class ConnectorController {
    listStatus = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const statuses = await connectorService.listAllStatuses(userId);
        return res.status(HTTPSTATUS.OK).json({ success: true, ...statuses });
    });

    gmailAuth = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const url = connectorService.getGmailAuthUrl(userId);
        return res.status(HTTPSTATUS.OK).json({ success: true, url });
    });

    gmailCallback = asyncHandler(async (req: Request, res: Response) => {
        const { code, state } = req.query as { code: string; state: string };
        if (!code || !state) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({ success: false, message: "Missing code or state" });
        }

        await connectorService.handleGmailCallback(code, state);
        return res.redirect(`${Env.FRONTEND_ORIGIN}/connectors?connected=gmail`);
    });

    gmailDisconnect = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const result = await connectorService.disconnect("gmail", userId);
        return res.status(HTTPSTATUS.OK).json({ success: true, ...result });
    });

    gmailData = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const emails = await connectorService.fetchGmailEmails(userId);
        return res.status(HTTPSTATUS.OK).json({ success: true, emails });
    });

    gmailEmailDetail = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const emailId = req.params.emailId as string;
        if (!emailId) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({ success: false, message: "Email ID is required" });
        }
        const email = await connectorService.fetchGmailEmailDetail(userId, emailId);
        return res.status(HTTPSTATUS.OK).json({ success: true, email });
    });

    slackAuth = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const url = connectorService.getSlackAuthUrl(userId);
        return res.status(HTTPSTATUS.OK).json({ success: true, url });
    });

    slackCallback = asyncHandler(async (req: Request, res: Response) => {
        const { code, state } = req.query as { code: string; state: string };
        if (!code || !state) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({ success: false, message: "Missing code or state" });
        }

        await connectorService.handleSlackCallback(code, state);
        return res.redirect(`${Env.FRONTEND_ORIGIN}/connectors?connected=slack`);
    });

    slackDisconnect = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const result = await connectorService.disconnect("slack", userId);
        return res.status(HTTPSTATUS.OK).json({ success: true, ...result });
    });

    slackData = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const messages = await connectorService.fetchSlackMessages(userId);
        return res.status(HTTPSTATUS.OK).json({ success: true, messages });
    });

    gmailStatus = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const status = await connectorService.getStatus("gmail", userId);
        return res.status(HTTPSTATUS.OK).json({ success: true, ...status });
    });

    slackStatus = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const status = await connectorService.getStatus("slack", userId);
        return res.status(HTTPSTATUS.OK).json({ success: true, ...status });
    });
}
