"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"

gsap.registerPlugin(ScrollTrigger)

export function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll(".cta-item")
      if (!items || items.length === 0) return
      gsap.from(items as unknown as gsap.TweenTarget, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.2,
        ease: "power3.out",
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 px-4 md:px-6 text-center"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="cta-item text-3xl md:text-4xl font-bold tracking-tight">
          Ready to never miss a customer message again?
        </h2>
        <p className="cta-item mt-4 text-muted-foreground text-lg">
          Set up in 2 minutes. No credit card required.
        </p>
        <div className="cta-item mt-8">
          <Link href="/signup">
            <Button size="lg" className="text-base px-10">
              Start free — no strings attached
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
