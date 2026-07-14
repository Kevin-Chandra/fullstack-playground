import Link from "next/link";
import { requireUser } from "@/src/lib/guards/requireUser";
import { Routes } from "@/src/lib/constants/routes";
import LogoutButton from "@/src/ui/features/auth/LogoutButton";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-black/6 bg-white px-6 py-3 dark:border-white/8 dark:bg-zinc-950">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-black dark:text-zinc-50">
            Wedding Management Portal
          </span>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href={Routes.DASHBOARD}
              className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Dashboard
            </Link>
            <Link
              href={Routes.DASHBOARD_USERS}
              className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Users
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {user.username}
          </span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">
        {children}
      </main>
    </div>
  );
}
