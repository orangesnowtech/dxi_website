import type { Background } from "@/lib/sanity/types";

const BACKGROUNDS: Record<Background, string> = {
  paper: "bg-paper text-ink",
  ash: "bg-ash text-ink",
  dark: "bg-ink text-white",
};

/** Full-width band of page: background, vertical rhythm and the 1180px column. */
export default function Section({
  background = "paper",
  id,
  children,
  className = "",
}: {
  background?: Background;
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`${BACKGROUNDS[background]} py-[88px] ${className}`}>
      <div className="mx-auto w-full max-w-wrap px-6">{children}</div>
    </section>
  );
}

/** The 1180px column on its own, for content outside a Section. */
export function Wrap({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-wrap px-6 ${className}`}>{children}</div>;
}
