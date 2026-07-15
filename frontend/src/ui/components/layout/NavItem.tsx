import Link from "next/link";
import type { IconType } from "react-icons";

type NavItemProps = {
  label: string;
  href: string;
  Icon: IconType;
  active?: boolean;
  collapsed?: boolean;
};

// The icon sits in a fixed centred slot (so it self-centres in the collapsed
// rail); only the label to its right clips away, so the row minimizes from the
// right only.
const base =
  "group flex items-center py-2.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-focus";

// Centred icon slot — shared shape with the brand mark + avatar.
const iconSlot = "flex w-rail-icon shrink-0 items-center justify-center";

const tone = {
  active: "bg-brand text-ink",
  idle: "text-muted hover:bg-raised hover:text-ink",
};

// Label slides + clips to the right (max-width/opacity → 0) instead of popping.
const label = {
  base: "min-w-0 overflow-hidden whitespace-nowrap text-body-sm transition-all duration-300 ease-out",
  open: "max-w-40 opacity-100",
  closed: "max-w-0 opacity-0",
};

export default function NavItem({
  label: text,
  href,
  Icon,
  active = false,
  collapsed = false,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={`${base} ${active ? tone.active : tone.idle}`}
      aria-current={active ? "page" : undefined}
      title={collapsed ? text : undefined}
    >
      <span className={iconSlot}>
        <Icon size={20} aria-hidden />
      </span>
      <span
        className={`${label.base} ${collapsed ? label.closed : label.open}`}
        aria-hidden={collapsed}
      >
        {text}
      </span>
    </Link>
  );
}
