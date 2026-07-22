import { requireUser } from "@/src/lib/guards/requireUser";
import Navbar from "@/src/ui/components/layout/Navbar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <div className="flex h-screen bg-canvas">
      <Navbar brandTitle="Everafter" userName={user.username} />
      <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-8 py-8">
        {children}
      </main>
    </div>
  );
}
