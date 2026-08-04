import { forwardRef } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import ChoiceControl, {
  type LabelPosition,
} from "@/src/ui/components/input/ChoiceControl";
import { useRadioGroupContext } from "@/src/ui/components/input/RadioGroup";

export type DefaultRadioButtonProps = {
  label?: ReactNode;
  labelPosition?: LabelPosition;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const circle = [
  "peer size-4.5 shrink-0 appearance-none rounded-full border border-edge-strong bg-field",
  "transition-[border-color,box-shadow] duration-150",
  "checked:border-accent",
  "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus",
  "disabled:cursor-not-allowed",
].join(" ");

const dot = [
  "pointer-events-none absolute inset-0 m-auto size-2 scale-0 rounded-full bg-accent",
  "transition-transform duration-150 peer-checked:scale-100",
].join(" ");

const DefaultRadioButton = forwardRef<HTMLInputElement, DefaultRadioButtonProps>(
  function DefaultRadioButton(
    { label, labelPosition, disabled, className = "", ...rest },
    ref,
  ) {
    const group = useRadioGroupContext();
    const value = rest.value;

    // inside a RadioGroup the group owns name/checked/onChange; a standalone
    // radio keeps whatever native props the caller passed via `rest`
    const groupProps = group
      ? {
        name: group.name,
        checked: value != null && group.value === String(value),
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
          if (value != null) group.select(String(value));
          rest.onChange?.(event);
        },
      }
      : null;

    const isDisabled = disabled ?? group?.disabled;
    const resolvedLabelPosition = labelPosition ?? group?.labelPosition;

    return (
      <ChoiceControl
        label={label}
        labelPosition={resolvedLabelPosition}
        disabled={isDisabled}
        className={className}
      >
        <input
          ref={ref}
          type="radio"
          disabled={isDisabled}
          className={circle}
          {...rest}
          {...groupProps}
        />
        <span aria-hidden className={dot} />
      </ChoiceControl>
    );
  },
);

export default DefaultRadioButton;
