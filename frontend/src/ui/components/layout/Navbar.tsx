"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MdMenu } from "react-icons/md";
import BrandMark from "@/src/ui/components/brand/BrandMark";
import NavItem from "@/src/ui/components/layout/NavItem";
import UserBadge from "@/src/ui/components/avatar/UserBadge";
import { navItems } from "@/src/lib/constants/navItems";
import { isActivePath } from "@/src/lib/utils/isActivePath";
import { initialsFromName } from "@/src/lib/utils/initials";

type NavbarProps = {
  brandTitle: string;
  userName: string;
};

// Left edge is pinned by the layout; only the width animates, so the rail
// minimizes from the right. overflow-x-hidden clips the labels as they slide.
const aside =
  "sticky top-0 flex h-screen shrink-0 flex-col overflow-x-hidden border-r border-edge bg-canvas px-4 py-6 transition-[width] duration-300 ease-out";
const width = {
  expanded: "w-rail",
  collapsed: "w-rail-collapsed",
};

// Fixed-width slot that centres whatever glyph it holds; shared by the brand
// mark, nav icons and avatar so each self-centres in the collapsed rail.
const iconSlot = "flex w-rail-icon shrink-0 items-center justify-center";

const headerExpanded = "flex items-center justify-between";
// const headerCollapsed = "flex items-center justify-center";
const brandButton =
  "flex min-w-0 items-center rounded-md focus:outline-none focus-visible:ring-3 focus-visible:ring-focus";
const brandTitle = {
  base: "min-w-0 overflow-hidden whitespace-nowrap font-display text-h4 font-semibold text-ink transition-all duration-300 ease-out",
  open: "ml-2 max-w-40 opacity-100",
  closed: "max-w-0 opacity-0",
};
const toggleWrap = {
  base: "flex overflow-hidden transition-all duration-300 ease-out",
  open: "ml-2 max-w-12 opacity-100",
  closed: "ml-0 max-w-0 opacity-0",
};
const toggleButton =
  "grid place-items-center rounded-md p-1.5 text-muted transition-colors hover:bg-raised hover:text-ink focus:outline-none focus-visible:ring-3 focus-visible:ring-focus";

const nav = "mt-8 flex flex-1 flex-col gap-1";

export default function Navbar({ brandTitle: title, userName }: NavbarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed((value) => !value);

  return (
    <aside
      className={`${aside} ${collapsed ? width.collapsed : width.expanded}`}
    >
      <div className={headerExpanded}>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={brandButton}
        >
          <span className={iconSlot}>
            <BrandMark size={36} />
          </span>
          <span
            className={`${brandTitle.base} ${collapsed ? brandTitle.closed : brandTitle.open}`}
            aria-hidden={collapsed}
          >
            {title}
          </span>
        </button>
        <span
          className={`${toggleWrap.base} ${collapsed ? toggleWrap.closed : toggleWrap.open}`}
          aria-hidden={collapsed}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label="Collapse sidebar"
            tabIndex={collapsed ? -1 : 0}
            className={toggleButton}
          >
            <MdMenu size={20} aria-hidden />
          </button>
        </span>
      </div>

      <nav className={nav}>
        {navItems.map(({ key, label, href, Icon, exact }) => (
          <NavItem
            key={key}
            label={label}
            href={href}
            Icon={Icon}
            collapsed={collapsed}
            active={isActivePath(pathname, href, exact)}
          />
        ))}
      </nav>

      <UserBadge
        name={userName}
        initials={initialsFromName(userName)}
        collapsed={collapsed}
      />
    </aside>
  );
}
