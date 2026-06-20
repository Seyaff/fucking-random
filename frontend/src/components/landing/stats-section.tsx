"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: 50, suffix: "+", label: "Languages supported" },
  { value: 3, suffix: "s", label: "Avg. response time" },
  { value: 99, suffix: "%", label: "Uptime" },
  { value: 10, suffix: "K+", label: "Active businesses" },
]

function AnimatedCounter({
  value,
  suffix,
  label,
}: {
  value: number
  suffix: string
  label: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        textContent: 0,
        duration: 2,
        ease: "power2.out",
        snap: { textContent: 1 },
        onUpdate: () => {
          const current = Math.round(Number(el.textContent) * value)
          el.textContent = current + suffix
        },
      })
    }, el)

    return () => ctx.revert()
  }, [value, suffix])

  return (
    <div className="text-center">
      <span
        ref={ref}
        className="text-4xl md:text-5xl font-bold text-primary block"
      >
        0
      </span>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </div>
  )
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll(".stat-item")
      if (!items || items.length === 0) return
      gsap.from(items as unknown as gsap.TweenTarget, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 md:px-6 border-y">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item">
              <AnimatedCounter {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
