import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, BarChart3, Globe } from "lucide-react";
import { env } from "@/config/env";

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground mb-8">
        <Bot className="size-4" />
        AI-powered customer support
      </div>

      <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
        Your AI agent that speaks your
        <span className="text-primary"> customer&apos;s language</span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        WhatsApp, Gmail, Slack — one unified inbox. AI that understands
        Hinglish, Urdu, and every language your customers use. Built for Indian
        businesses.
      </p>

      <div className="mt-10 flex items-center gap-4">
        <Link href={`${env.API_URL}/auth/google`}>
          <Button size="lg" className="text-base">
            Get started free
          </Button>
        </Link>
        <Button size="lg" variant="outline" className="text-base">
          Watch demo
        </Button>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {[
          {
            icon: MessageSquare,
            title: "Multi-channel inbox",
            desc: "WhatsApp, Gmail, Slack, Messenger — all in one place",
          },
          {
            icon: Globe,
            title: "Native language AI",
            desc: "Understands Hinglish, Hindi, Urdu. Replies in your customer's tongue",
          },
          {
            icon: BarChart3,
            title: "Smart analytics",
            desc: "Track response times, CSAT, profits — all in real-time",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-3 rounded-xl border p-6 text-center"
          >
            <div className="rounded-lg bg-primary/10 p-3">
              <Icon className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
