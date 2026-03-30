interface KeyTakeawayBoxProps {
  children: React.ReactNode;
}

export function KeyTakeawayBox({ children }: KeyTakeawayBoxProps) {
  return (
    <div className="my-8 rounded-lg border-l-4 border-primary bg-primary/5 p-4">
      <p className="text-sm font-semibold text-primary mb-1">Key Takeaway</p>
      <div className="text-sm text-foreground [&>p]:mb-0">{children}</div>
    </div>
  );
}
