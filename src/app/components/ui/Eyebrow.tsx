/** The small red tag that opens most sections. */
export default function Eyebrow({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="mb-[18px] inline-block bg-signal px-3 py-[5px] font-mono text-[11px] uppercase tracking-[0.14em] text-white">
      {children}
    </div>
  );
}
