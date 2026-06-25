import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { WhatsAppService } from "./whatsapp.service";
import { ConversationService } from "../conversation/conversation.service";
import { HTTPSTATUS } from "../../config/http.config";
import { enqueueMessage } from "../../lib/worker";
import { eventService } from "../../lib/event-service";
import WhatsAppAccountModel from "./whatsapp-account.model";

const conversationService = new ConversationService();

const whatsappService = new WhatsAppService();

export class WhatsAppController {
    connect = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const { businessAccountId, phoneNumberId, phoneNumber, accessToken, verifyToken } = req.body;

        if (!businessAccountId || !phoneNumberId || !accessToken) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "Missing required fields: businessAccountId, phoneNumberId, accessToken",
            });
        }

        try {
            const account = await whatsappService.connectAccount(userId, {
                businessAccountId,
                phoneNumberId,
                phoneNumber,
                accessToken,
                verifyToken,
            });

            return res.status(HTTPSTATUS.OK).json({
                success: true,
                message: "WhatsApp connected successfully",
                account: {
                    id: account._id,
                    businessAccountId: account.businessAccountId,
                    phoneNumberId: account.phoneNumberId,
                    phoneNumber: account.phoneNumber,
                    isConnected: account.isConnected,
                },
            });
        } catch (err: any) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: err.message || "Failed to connect WhatsApp",
            });
        }
    });

    disconnect = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();

        try {
            const result = await whatsappService.disconnectAccount(userId);
            return res.status(HTTPSTATUS.OK).json({
                success: true,
                ...result,
            });
        } catch (err: any) {
            return res.status(HTTPSTATUS.NOT_FOUND).json({
                success: false,
                message: err.message || "WhatsApp account not found",
            });
        }
    });

    myConnection = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();

        try {
            const connection = await whatsappService.getConnection(userId);
            return res.status(HTTPSTATUS.OK).json({
                success: true,
                connection: connection || null,
            });
        } catch (err: any) {
            return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to fetch connection details",
            });
        }
    });

    webhookVerify = asyncHandler(async (req: Request, res: Response) => {
        const mode = req.query["hub.mode"] as string | undefined;
        const token = req.query["hub.verify_token"] as string | undefined;
        const challenge = req.query["hub.challenge"] as string | undefined;

        if (!mode || !token || !challenge) {
            return res.status(HTTPSTATUS.BAD_REQUEST).send("Missing verification parameters");
        }

        const result = await whatsappService.verifyWebhook(mode, token, challenge);

        if (result.verified) {
            return res.status(HTTPSTATUS.OK).send(challenge);
        }

        return res.status(HTTPSTATUS.FORBIDDEN).send("Verification failed");
    });

    webhookReceive = asyncHandler(async (req: Request, res: Response) => {
        let message;

        try {
            message = await whatsappService.processIncomingMessage(req.body);
        } catch (err: any) {
            console.error("[webhook] Failed to parse incoming message:", err.message);
            return res.status(HTTPSTATUS.OK).json({ success: true });
        }

        if (!message) {
            return res.status(HTTPSTATUS.OK).json({ success: true });
        }

        try {
            const account = await WhatsAppAccountModel.findOne({
                phoneNumberId: message.from,
            });

            if (!account) {
                console.warn(`[webhook] No account found for phoneNumberId: ${message.from}`);
                return res.status(HTTPSTATUS.OK).json({ success: true });
            }

            const userId = account.userId.toString();

            const msg = await conversationService.addMessage(userId, message.sender, "user", message.text);

            eventService.emit(userId, {
                type: "new_message",
                data: {
                    conversationId: msg.conversationId.toString(),
                    customerPhone: message.sender,
                    preview: message.text.slice(0, 100),
                },
            });

            await enqueueMessage({
                from: message.from,
                sender: message.sender,
                text: message.text,
                messageId: message.messageId,
                timestamp: message.timestamp,
                userId,
            });
        } catch (err: any) {
            console.error("[webhook] Error processing message:", err.message);
        }

        return res.status(HTTPSTATUS.OK).json({ success: true });
    });
}
