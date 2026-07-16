import { requireUser } from "@/src/lib/guards/requireUser";
import Navbar from "@/src/ui/components/layout/Navbar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen bg-canvas">
      <Navbar brandTitle="Everafter" userName={user.username} />
      <main className="flex-1 overflow-x-hidden px-8 py-8">{children}</main>
    </div>
  );
}
