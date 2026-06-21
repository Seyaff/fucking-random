import { Env } from "../config/app.config";

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export class EmailService {
    async send(options: EmailOptions): Promise<void> {
        if (!Env.RESEND_API_KEY) {
            console.warn("[email] RESEND_API_KEY not configured — skipping");
            return;
        }

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: Env.RESEND_FROM_EMAIL || "Relay <onboarding@resend.dev>",
                to: options.to,
                subject: options.subject,
                html: options.html,
            }),
        });

        if (!res.ok) {
            const error = await res.text();
            console.error("[email] Send failed:", error);
            throw new Error(`Email send failed: ${error}`);
        }
    }

    async sendWelcomeEmail(to: string, name: string): Promise<void> {
        await this.send({
            to,
            subject: "Welcome to Relay!",
            html: `<h1>Welcome, ${this.escape(name)}!</h1>
<p>Thanks for signing up. You can now connect your WhatsApp account and start managing conversations.</p>
<p><a href="${Env.FRONTEND_ORIGIN}/settings" style="display:inline-block;padding:12px 24px;background:#22c55e;color:#fff;text-decoration:none;border-radius:6px;">Get Started</a></p>
<p>Need help? Just reply to this email.</p>`,
        });
    }

    async sendOrderConfirmationEmail(
        to: string,
        data: {
            customerName: string;
            orderId: string;
            items: { name: string; quantity: number; total: number }[];
            total: number;
        }
    ): Promise<void> {
        const itemsHtml = data.items
            .map(
                (i) =>
                    `<tr><td style="padding:8px;border-bottom:1px solid #eee">${this.escape(i.name)}</td><td style="padding:8px;border-bottom:1px solid #eee">x${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee">$${i.total.toFixed(2)}</td></tr>`
            )
            .join("");

        await this.send({
            to,
            subject: `Order Confirmed — ${data.orderId}`,
            html: `<h1>Order Confirmed!</h1>
<p>Hi ${this.escape(data.customerName)},</p>
<p>Your order <strong>${data.orderId}</strong> has been placed successfully.</p>
<table style="width:100%;border-collapse:collapse;">
<tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:left">Qty</th><th style="padding:8px;text-align:left">Total</th></tr>
${itemsHtml}
</table>
<p style="font-size:18px;font-weight:bold;margin-top:16px;">Total: $${data.total.toFixed(2)}</p>
<p>We'll notify you when the order status changes.</p>`,
        });
    }

    private escape(str: string): string {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

export const emailService = new EmailService();
