import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col bg-transparent">
      <main className="flex-1 overflow-y-auto pb-24 perspective-container">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
