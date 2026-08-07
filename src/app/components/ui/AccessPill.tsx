import type { Access } from "@/lib/sanity/types";

/** FREE / MEMBERS badge on Academy course and webinar cards. */
export default function AccessPill({ access }: { access: Access }) {
  const isFree = access === "free";
  return (
    <span
      className={`mb-2.5 inline-block px-[9px] py-[3px] font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-white ${
        isFree ? "bg-free" : "bg-signal"
      }`}
    >
      {isFree ? "Free" : "Members"}
    </span>
  );
}
