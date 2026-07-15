import InitialsBadge from "@/src/ui/components/avatar/InitialsBadge";
import LogoutIconButton from "@/src/ui/features/auth/LogoutIconButton";

type UserBadgeProps = {
  name: string;
  initials: string;
  collapsed?: boolean;
};

const wrap = "mt-2 border-t border-edge pt-4";
// Avatar sits in the shared centred slot (self-centres in the collapsed rail);
// the name and logout clip away to the right.
const row = "flex items-center";

// Centred icon slot — shared shape with the brand mark + nav icons.
const iconSlot = "flex w-rail-icon shrink-0 items-center justify-center";

const name = {
  base: "min-w-0 overflow-hidden whitespace-nowrap text-body text-ink-body transition-all duration-300 ease-out",
  open: "ml-2 max-w-40 opacity-100",
  closed: "max-w-0 opacity-0",
};

const logout = {
  base: "flex overflow-hidden transition-all duration-300 ease-out",
  open: "ml-auto max-w-16 opacity-100",
  closed: "ml-0 max-w-0 opacity-0",
};

export default function UserBadge({
  name: displayName,
  initials,
  collapsed = false,
}: UserBadgeProps) {
  return (
    <div className={wrap}>
      <div className={row}>
        <span className={iconSlot}>
          <InitialsBadge initials={initials} size={40} />
        </span>
        <span
          className={`${name.base} ${collapsed ? name.closed : name.open}`}
          aria-hidden={collapsed}
        >
          {displayName}
        </span>
        <span
          className={`${logout.base} ${collapsed ? logout.closed : logout.open}`}
          aria-hidden={collapsed}
        >
          <LogoutIconButton />
        </span>
      </div>
    </div>
  );
}
