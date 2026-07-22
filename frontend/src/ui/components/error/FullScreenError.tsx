import type { ReactNode } from "react";

type FullScreenErrorProps = {
  title: string;
  code?: string;
  description?: string;
  mark?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
};

/**
 * Full-viewport error scaffold: a centred code / title / description column
 * with optional CTA row and support footer. Purely presentational — the
 * caller supplies copy, the graphic (`mark`) and the interactive `actions`
 * (see NotFoundActions). For an in-content, retryable panel use ErrorState.
 */
const screen =
  "flex min-h-dvh flex-col items-center justify-center gap-8 bg-canvas px-6 py-16 text-center";
const column = "flex w-full flex-col items-center gap-4";
const codeText =
  "text-caption font-medium uppercase tracking-widest text-accent";
const titleText =
  "font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl";
const descriptionText = "text-body text-muted";
const actionsRow = "flex flex-col items-center gap-3 sm:flex-row";
const footerText = "text-caption text-muted";

export default function FullScreenError({
  title,
  code,
  description,
  mark,
  actions,
  footer,
}: FullScreenErrorProps) {
  return (
    <main className={screen}>
      {mark}
      <div className={column}>
        {code && <span className={codeText}>{code}</span>}
        <h1 className={titleText}>{title}</h1>
        {description && <p className={descriptionText}>{description}</p>}
      </div>
      {actions && <div className={actionsRow}>{actions}</div>}
      {footer && <p className={footerText}>{footer}</p>}
    </main>
  );
}
