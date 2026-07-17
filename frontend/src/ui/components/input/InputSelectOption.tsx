import { MdCheck } from "react-icons/md";

export type InputSelectOptionProps = {
  id: string;
  label: string;
  selected: boolean;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
  onHover: () => void;
};

export default function InputSelectOption({
  id,
  label,
  selected,
  active,
  disabled,
  onSelect,
  onHover,
}: InputSelectOptionProps) {
  const className = [
    "flex h-10 w-full items-center justify-between gap-2 rounded-sm px-3 text-input transition-colors",
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    selected ? "bg-accent/8 text-ink" : "text-ink-body",
    active && !disabled ? "bg-edge" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onSelect}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={onHover}
      className={className}
    >
      <span className="truncate">{label}</span>
      {selected && (
        <MdCheck aria-hidden className="size-4 shrink-0 text-accent" />
      )}
    </li>
  );
}
