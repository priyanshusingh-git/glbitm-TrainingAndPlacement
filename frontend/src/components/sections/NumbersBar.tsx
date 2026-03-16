"use client"

import {
  packageDistribution,
  placementMiniStats,
  placementStats,
  placementTable,
  tickerItems,
} from "@/data/landing"
import { AnimatedSection, fadeUp } from "@/components/ui/AnimatedSection"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function NumbersBar() {
  const tickerTrack = [...tickerItems, ...tickerItems]

  return (
    <>
      <div className="overflow-hidden border-y border-brown-900/10 bg-brown-100 py-3" aria-hidden="true">
        <div className="flex animate-ticker whitespace-nowrap">
          {tickerTrack.map((item, index) => (
            <div
              key={`${item.value}-${item.label}-${index}`}
              className="inline-flex items-center gap-2.5 border-r border-brown-900/12 px-7 text-xs font-semibold text-brown-800"
            >
              <strong className="font-display text-[22px] font-bold tracking-[-0.02em] text-brown-900">{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section id="placements" className="bg-brown-900 px-4 py-14 text-white sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-20 xl:px-[clamp(40px,6vw,80px)]">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto mb-10 max-w-[40rem] text-center lg:mb-12">
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              Placement Record 2022-25
            </div>
            <h2 className="section-display-inverse">
              Numbers That Speak
              <br />
              <span className="text-amber-400 italic">For Themselves</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[32rem] text-sm leading-[1.85] text-white/46">
              Consistent year-on-year growth across packages, recruiters, and students placed, with outcomes validated through the institute's published placement record.
            </p>
          </div>

          <AnimatedSection className="grid overflow-hidden rounded-[24px] border border-white/8 bg-white/4 sm:grid-cols-2 lg:grid-cols-4">
            {placementStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className={cn(
                  "border-b border-white/6 px-5 py-6 sm:px-6 lg:border-b-0 lg:px-8 lg:py-9",
                  index % 2 === 0 && "sm:border-r sm:border-white/6 lg:border-r",
                  index >= 2 && "sm:border-b-0",
                  index < placementStats.length - 1 && "lg:border-r lg:border-white/6",
                  index === placementStats.length - 1 && "border-b-0 sm:border-r-0 lg:border-r-0"
                )}
              >
                <div className="mb-4 h-0.5 w-6 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
                <div
                  aria-label={stat.ariaLabel}
                  className="font-display text-[40px] font-bold leading-none tracking-[-0.04em] text-white lg:text-[52px]"
                >
                  {stat.prefix && <span className="mr-0.5 text-[0.52em] font-semibold text-white/45">{stat.prefix}</span>}
                  {stat.value}
                  {stat.suffix && <span className="ml-0.5 text-[0.46em] font-bold text-amber-400">{stat.suffix}</span>}
                </div>
                <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/48">{stat.label}</div>
                <div className="mt-1 text-[10px] italic text-white/22 lg:block">{stat.note}</div>
              </motion.div>
            ))}
          </AnimatedSection>

          <div className="mt-9 overflow-x-auto rounded-2xl border border-white/6">
            <table className="min-w-[720px] w-full border-collapse">
              <thead>
                <tr className="border-b border-white/7">
                  {["Batch", "Highest Package", "Average Package", "Median Package", "Students Placed", "Recruiters", "Status"].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {placementTable.map((row) => (
                  <tr key={row.batch} className="border-b border-white/4 last:border-b-0 hover:bg-white/[0.025]">
                    <td className="px-4 py-3 text-[12.5px] text-white/66">
                      <span className="font-display text-xl font-bold text-white">{row.batch}</span>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-white/66">
                      <span className="font-display text-xl font-bold text-amber-400">{row.highest}</span>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-white/66">
                      <span className="font-display text-xl font-bold text-white">{row.average}</span>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-white/66 tabular-nums">{row.median}</td>
                    <td className="px-4 py-3 text-[12.5px] text-white/66">{row.placed}</td>
                    <td className="px-4 py-3 text-[12.5px] text-white/66">{row.recruiters}</td>
                    <td className="px-4 py-3 text-[12.5px] text-white/66">
                      <span className="inline-flex rounded-full border border-amber-500/15 bg-amber-500/13 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.05em] text-amber-300">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-[10.5px] text-white/22">
            *2025 season ongoing. Source: published institute placement record.{" "}
            <a
              href="https://www.glbitm.org/placements"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500/45 transition-colors hover:text-amber-400"
            >
              Full data at glbitm.org →
            </a>
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">
                <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
                Package Distribution 2024
              </div>

              <div className="space-y-3">
                {packageDistribution.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-[11.5px] text-white/50">{item.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/7">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r from-brown-700 to-amber-500",
                          item.accent && "from-amber-700 to-amber-400"
                        )}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className={cn("w-7 text-right text-[11.5px] font-semibold text-white", item.accent && "text-amber-400")}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:w-[22rem] lg:grid-cols-2">
              {placementMiniStats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/7 bg-white/[0.052] px-5 py-5 text-center">
                  <div className="font-display text-[34px] font-bold leading-none tracking-[-0.03em] text-amber-400">
                    {stat.value}
                    <span className="ml-0.5 text-[0.46em]">{stat.suffix}</span>
                  </div>
                  <div className="mt-1.5 text-[10px] uppercase tracking-[0.08em] text-white/38">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
