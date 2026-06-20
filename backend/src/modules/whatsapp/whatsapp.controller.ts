import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { WhatsAppService } from "./whatsapp.service";
import { ConversationService } from "../conversation/conversation.service";
import { HTTPSTATUS } from "../../config/http.config";
import { enqueueMessage } from "../../lib/worker";
import WhatsAppAccountModel from "./whatsapp-account.model";

const conversationService = new ConversationService();

const whatsappService = new WhatsAppService();

export class WhatsAppController {
    connect = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const { businessAccountId, phoneNumberId, phoneNumber, accessToken, verifyToken } = req.body;

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
    });

    disconnect = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const result = await whatsappService.disconnectAccount(userId);

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            ...result,
        });
    });

    myConnection = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const connection = await whatsappService.getConnection(userId);

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            connection: connection || null,
        });
    });

    webhookVerify = asyncHandler(async (req: Request, res: Response) => {
        const mode = req.query["hub.mode"] as string | undefined;
        const token = req.query["hub.verify_token"] as string | undefined;
        const challenge = req.query["hub.challenge"] as string | undefined;

        const result = await whatsappService.verifyWebhook(mode, token, challenge);

        if (result.verified && challenge) {
            return res.status(HTTPSTATUS.OK).send(challenge);
        }

        return res.status(HTTPSTATUS.FORBIDDEN).send("Verification failed");
    });

    webhookReceive = asyncHandler(async (req: Request, res: Response) => {
        const message = await whatsappService.processIncomingMessage(req.body);

        if (message) {
            const account = await WhatsAppAccountModel.findOne({
                phoneNumberId: message.from,
            });

            if (account) {
                const userId = account.userId.toString();

                await conversationService.addMessage(userId, message.sender, "user", message.text);

                await enqueueMessage({
                    ...message,
                    userId,
                });
            }
        }

        return res.status(HTTPSTATUS.OK).json({ success: true });
    });
}
