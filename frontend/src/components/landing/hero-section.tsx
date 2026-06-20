"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const blobsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.6 })
        .from(".hero-title-line", { y: 40, opacity: 0, duration: 0.8, stagger: 0.15 }, "-=0.3")
        .from(".hero-desc", { y: 30, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.5, stagger: 0.15 }, "-=0.4")

      if (blobsRef.current) {
        gsap.to(blobsRef.current.querySelectorAll(".blob"), {
          scale: 1.15,
          rotate: (i) => (i % 2 === 0 ? 15 : -15),
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative flex flex-col items-center justify-center px-4 md:px-6 pt-28 md:pt-36 pb-20 md:pb-28 text-center overflow-hidden">
      <div ref={blobsRef} className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="blob absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 blur-3xl" />
        <div className="blob absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-chart-1/20 to-primary/20 blur-3xl" />
      </div>

      <div className="hero-badge inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground mb-8 relative">
        AI-powered customer support
      </div>

      <h1 className="max-w-4xl text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight relative">
        <span className="hero-title-line block">Your AI agent that speaks</span>
        <span className="hero-title-line block text-primary">your customer&apos;s language</span>
      </h1>

      <p className="hero-desc mt-6 max-w-2xl text-base md:text-lg text-muted-foreground relative">
        WhatsApp, Gmail, Slack — one unified inbox. AI that understands
        Hinglish, Hindi, Urdu, and every language they use.
      </p>

      <div className="hero-cta mt-10 flex flex-col sm:flex-row items-center gap-4 relative">
        <Link href="/signup">
          <Button size="lg" className="text-base w-full sm:w-auto px-8">
            Get started free
          </Button>
        </Link>
        <Button size="lg" variant="outline" className="text-base w-full sm:w-auto px-8">
          Watch demo
        </Button>
      </div>
    </section>
  )
}
