"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function InsightsClientWrapper() {
  const pathname = usePathname();

  useEffect(() => {
    // Any client-side initialization if needed
  }, [pathname]);

  return null;
}

