import { ReactNode } from "react";

const panel = [
  "flex min-w-0 flex-1 flex-col overflow-y-auto rounded-lg border border-edge bg-raised p-2xl shadow-card",
  "opacity-100 transition-opacity duration-300 ease-out starting:opacity-0",
].join(" ");

type SidePanelProps = {
  content: ReactNode;
  className?: string;
};

export default function SidePanel({ content, className = "" }: SidePanelProps) {
  return <section className={`${panel} ${className}`}>{content}</section>;
}
