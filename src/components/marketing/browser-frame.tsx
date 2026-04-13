/* Browser Chrome Frame — wraps screenshots to look like real product */

export function BrowserFrame({
  children,
  url,
  className = "",
}: {
  children: React.ReactNode;
  url: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        boxShadow:
          "0 25px 60px -12px rgba(15,23,42,0.12), 0 8px 24px -8px rgba(15,23,42,0.06)",
      }}
    >
      <div
        className="flex items-center px-4 h-9"
        style={{ background: "#f1f0ee" }}
      >
        <div className="flex gap-1.5">
          <span
            className="h-[10px] w-[10px] rounded-full"
            style={{ background: "#ff5f57" }}
          />
          <span
            className="h-[10px] w-[10px] rounded-full"
            style={{ background: "#febc2e" }}
          />
          <span
            className="h-[10px] w-[10px] rounded-full"
            style={{ background: "#28c840" }}
          />
        </div>
        <div className="mx-auto">
          <span
            className="text-[11px] px-6 py-0.5 rounded"
            style={{ color: "#999", background: "rgba(0,0,0,0.04)" }}
          >
            {url}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
