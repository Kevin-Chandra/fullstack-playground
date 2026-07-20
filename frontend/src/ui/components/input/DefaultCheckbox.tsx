"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { MdCheck, MdRemove } from "react-icons/md";
import ChoiceControl, {
  type LabelPosition,
} from "@/src/ui/components/input/ChoiceControl";
import { useCheckboxGroupContext } from "@/src/ui/components/input/CheckboxGroup";

export type DefaultCheckboxProps = {
  label?: ReactNode;
  labelPosition?: LabelPosition;
  indeterminate?: boolean;
  onValueChange?: (value: boolean) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">;

const box = [
  "peer size-4.5 shrink-0 appearance-none rounded-sm border border-edge-strong bg-field",
  "transition-[border-color,box-shadow] duration-150",
  "checked:border-transparent checked:bg-accent-gradient",
  "indeterminate:border-transparent indeterminate:bg-accent-gradient",
  "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus",
  "disabled:cursor-not-allowed",
].join(" ");

const mark =
  "pointer-events-none absolute inset-0 m-auto size-3.5 text-accent-ink opacity-0 transition-opacity duration-150";

const DefaultCheckbox = forwardRef<HTMLInputElement, DefaultCheckboxProps>(
  function DefaultCheckbox(
    {
      label,
      labelPosition,
      indeterminate = false,
      disabled,
      className = "",
      onValueChange,
      ...rest
    },
    ref,
  ) {
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const group = useCheckboxGroupContext();
    const value = rest.value;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (group && value != null)
        group.toggle(String(value), event.target.checked);
      onValueChange?.(event.target.checked);
    };

    const groupControlProps =
      group && value != null
        ? { name: group.name, checked: group.values.includes(String(value)) }
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
          ref={innerRef}
          type="checkbox"
          disabled={isDisabled}
          className={box}
          {...rest}
          onChange={handleChange}
          {...groupControlProps}
        />
        <MdCheck
          aria-hidden
          className={`${mark} peer-checked:opacity-100 peer-indeterminate:opacity-0`}
        />
        <MdRemove
          aria-hidden
          className={`${mark} peer-indeterminate:opacity-100`}
        />
      </ChoiceControl>
    );
  },
);

export default DefaultCheckbox;
