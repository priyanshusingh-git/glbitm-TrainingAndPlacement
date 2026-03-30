"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { landingTestimonials } from "@/data/landing"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 3

export default function Testimonials() {
  const [page, setPage] = useState(0)

  const pages = useMemo(() => {
    const chunks: typeof landingTestimonials[] = []

    for (let index = 0; index < landingTestimonials.length; index += PAGE_SIZE) {
      chunks.push(landingTestimonials.slice(index, index + PAGE_SIZE))
    }

    return chunks
  }, [])

  const totalPages = pages.length

  return (
    <section id="alumni" className="bg-brown-900 px-4 py-14 text-white sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-[84px] xl:px-[clamp(40px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              Alumni Speak
            </div>
            <h2 className="section-display-inverse">
              Success Stories From
              <br />
              <span className="text-amber-400 italic">Our Graduates</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous testimonials"
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
              disabled={page === 0}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/6 text-white transition hover:border-amber-500 hover:bg-amber-500 hover:text-brown-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-12 text-center text-sm font-semibold text-white/36">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next testimonials"
              onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
              disabled={page === totalPages - 1}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/6 text-white transition hover:border-amber-500 hover:bg-amber-500 hover:text-brown-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px]">
          <div className="grid gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
            {pages[page]?.map((testimonial) => (
              <article
                key={`${testimonial.name}-${testimonial.company}`}
                className="relative flex flex-col overflow-hidden rounded-md border border-white/8 bg-white/5 px-4 py-5 transition hover:bg-white/8 animate-in fade-in slide-in-from-right-1 duration-300"
              >
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <div className="font-display text-[20px] font-bold tracking-[-0.02em] text-amber-400">
                        {testimonial.package}
                      </div>
                      <span className="ml-auto rounded-full border border-amber-500/15 bg-amber-500/9 px-2.5 py-1 text-[9px] font-bold text-amber-300">
                        {testimonial.company}
                      </span>
                      <span className="rounded-full bg-white/6 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.04em] text-white/34">
                        {testimonial.tag}
                      </span>
                    </div>

                    <div className="mb-2 font-display text-[32px] leading-[0.6] text-amber-500/20">"</div>
                    <p className="flex-1 text-[12px] italic leading-[1.74] text-white/60">{testimonial.quote}</p>

                    <div className="mt-4 flex items-center gap-2.5">
                      <div
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-xs font-bold text-white",
                          testimonial.accent
                        )}
                      >
                        {testimonial.initial}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{testimonial.name}</div>
                        <div className="text-[10px] text-white/34">{testimonial.meta}</div>
                      </div>
                    </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-1.5">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to testimonial page ${index + 1}`}
              onClick={() => setPage(index)}
              className={cn(
                "h-1.5 rounded-full bg-white/17 px-2 py-5 transition-all",
                page === index ? "w-4 bg-amber-500" : "w-1.5"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
