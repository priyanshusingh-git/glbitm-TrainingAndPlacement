"use client";

import NextImage from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function MobileAuthHeader() {
  return (
    <div className="mb-14 flex justify-center lg:hidden">
      <Link href="/" className="group no-underline">
        <div className="relative h-40 w-[180px] transition-transform duration-500 group-hover:scale-105">
          <NextImage
            src="/glbitm-logo.png"
            alt="GL Bajaj logo"
            fill
            sizes="180px"
            className="object-contain"
            priority
          />
        </div>
      </Link>
    </div>
  );
}
