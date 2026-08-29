import { ReactNode } from "react";

const card =
  "flex flex-1 flex-col overflow-hidden rounded-lg border border-edge bg-raised shadow-card";
const body = "flex flex-1 flex-col min-h-0 overflow-y-auto";
const headerBar = "border-b border-edge px-xl py-lg";
const footerBar = "border-t border-edge px-xl py-lg";

type ListCardProps = {
  header?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
};

export default function ListCard({ header, content, footer }: ListCardProps) {
  return (
    <section className={card}>
      {header && <header className={headerBar}>{header}</header>}
      <div className={body}>{content}</div>
      {footer && <footer className={footerBar}>{footer}</footer>}
    </section>
  );
}
