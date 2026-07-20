import { forwardRef } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import ChoiceControl, {
  type LabelPosition,
} from "@/src/ui/components/input/ChoiceControl";

export type DefaultSwitchProps = {
  label?: ReactNode;
  labelPosition?: LabelPosition;
  onValueChange?: (value: boolean) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role" | "onChange">;

const track = [
  "peer h-5.5 w-10 shrink-0 appearance-none rounded-full bg-ink/12",
  "transition-[box-shadow] duration-150",
  "checked:bg-accent-gradient",
  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus",
  "disabled:cursor-not-allowed",
].join(" ");

const thumb = [
  "pointer-events-none absolute top-0.75 left-0.75 size-4 rounded-full bg-muted",
  "transition-[translate,background-color] duration-150",
  "peer-checked:translate-x-4.5 peer-checked:bg-accent-ink",
].join(" ");

const DefaultSwitch = forwardRef<HTMLInputElement, DefaultSwitchProps>(
  function DefaultSwitch(
    { label, labelPosition, disabled, className = "", onValueChange, ...rest },
    ref,
  ) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(event.target.checked);
    };

    return (
      <ChoiceControl
        label={label}
        labelPosition={labelPosition}
        disabled={disabled}
        className={className}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          disabled={disabled}
          onChange={handleChange}
          className={track}
          {...rest}
        />
        <span aria-hidden className={thumb} />
      </ChoiceControl>
    );
  },
);

export default DefaultSwitch;
