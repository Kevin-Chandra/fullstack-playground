import { requireUser } from "@/src/lib/guards/requireUser";

export default async function SessionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();

  return <>{children}</>;
}
