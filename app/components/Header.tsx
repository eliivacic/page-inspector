export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-[#e9e9e7] py-7">
      <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#18392b]">
        PageInspector
      </h1>

      <span className="hidden text-sm text-[#787774] sm:block">
        AI website audit
      </span>
    </header>
  );
}