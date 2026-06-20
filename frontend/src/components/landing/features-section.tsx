"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MessageSquare, Globe, BarChart3, Bot, Workflow, Shield } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: MessageSquare,
    title: "Multi-channel inbox",
    desc: "WhatsApp, Gmail, Slack, Messenger — every conversation in one unified thread view. Never switch tabs again.",
  },
  {
    icon: Globe,
    title: "Speaks their language",
    desc: "Understands Hinglish, Hindi, Urdu, and 50+ languages. Detects the customer's tongue and replies naturally.",
  },
  {
    icon: Bot,
    title: "AI with tools",
    desc: "Your AI calls real tools — check prices, place orders, look up inventory. Customers get answers, not chatbot loops.",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    desc: "Response times, CSAT scores, resolution rates, revenue tracked per customer. Data that actually helps you grow.",
  },
  {
    icon: Workflow,
    title: "Smart automation",
    desc: "Auto-reply to FAQs, route billing questions to your team, escalate angry customers — all without code.",
  },
  {
    icon: Shield,
    title: "Role-based access",
    desc: "Admin, manager, agent, viewer — granular permissions. Your data stays secure as your team scales.",
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll(".feature-card")
      if (!cards || cards.length === 0) return

      gsap.from(cards as unknown as gsap.TweenTarget, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 md:py-28 px-4 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to
            <span className="text-primary"> support at scale</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            One platform, infinite possibilities. From first ping to happy customer.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="feature-card group rounded-xl border p-6 transition-all hover:shadow-lg hover:border-primary/30"
            >
              <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
