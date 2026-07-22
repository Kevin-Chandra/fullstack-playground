import { ReactNode } from "react";

const card =
  "flex flex-1 flex-col overflow-hidden rounded-lg border border-edge bg-raised shadow-card";
const body = "flex flex-1 flex-col min-h-0 overflow-y-auto";
const footerBar = "border-t border-edge px-xl py-lg";

type ListCardProps = {
  content: ReactNode;
  footer: ReactNode;
};

export default function ListCard({ content, footer }: ListCardProps) {
  return (
    <section className={card}>
      <div className={body}>{content}</div>
      {footer && <footer className={footerBar}>{footer}</footer>}
    </section>
  );
}
