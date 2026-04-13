export default function MockupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml" style={{ background: "#fcfbf9", minHeight: "100vh", padding: 0, margin: 0 }}>
      {children}
    </div>
  );
}
