import Image from "next/image";

export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid size-9 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <Image src="/assets/kelasahub-icon.png" alt="" width={24} height={27} className="h-[26px] w-auto" priority />
      </span>
      <span
        className={`font-display text-[1.35rem] font-bold tracking-tight ${light ? "text-white" : "text-ink"}`}
      >
        Kelasa<span className="text-teal">Hub</span>
      </span>
    </span>
  );
}
