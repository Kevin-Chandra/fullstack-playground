"use client";

import { USER_FORM_LIMITS, USER_FORM_MESSAGES } from "@/src/lib/constants/form";
import { userStatusOptions } from "@/src/lib/data/userStatusOptions";
import { CreateUserPayload } from "@/src/lib/types/User";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import DefaultInput from "@/src/ui/components/input/DefaultInput";
import { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FormMode } from "../../components/form/Form";
import InputSelect from "../../components/input/InputSelect";

const form = "flex min-h-0 flex-1 flex-col gap-2xl";
const scrollArea = "flex min-h-0 flex-1 flex-col gap-xl overflow-y-auto";
const footer = "flex justify-end gap-sm border-t border-edge pt-xl";

type UserFormProps = {
  mode?: FormMode;
  formMethods: UseFormReturn<CreateUserPayload>;
  onSubmit: (userDetails: CreateUserPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export default function UserForm({
  mode = "create",
  formMethods,
  onSubmit,
  onCancel,
  isLoading = false,
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  return (
    <form className={form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={scrollArea}>
        <DefaultInput
          fullWidth
          required
          label="Full Name"
          placeholder="e.g. John Doe"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name", {
            required: USER_FORM_MESSAGES.name.required,
            minLength: {
              value: USER_FORM_LIMITS.name.min,
              message: USER_FORM_MESSAGES.name.min,
            },
            maxLength: {
              value: USER_FORM_LIMITS.name.max,
              message: USER_FORM_MESSAGES.name.max,
            },
          })}
        />

        <DefaultInput
          fullWidth
          required
          label="Username"
          placeholder="e.g. johndoe"
          autoComplete="username"
          error={errors.username?.message}
          {...register("username", {
            required: USER_FORM_MESSAGES.username.required,
            minLength: {
              value: USER_FORM_LIMITS.username.min,
              message: USER_FORM_MESSAGES.username.min,
            },
            maxLength: {
              value: USER_FORM_LIMITS.username.max,
              message: USER_FORM_MESSAGES.username.max,
            },
          })}
        />

        {mode === "create" && (
          <DefaultInput
            fullWidth
            required
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            error={errors.password?.message}
            rightIcon={showPassword ? MdVisibilityOff : MdVisibility}
            rightIconLabel={showPassword ? "Hide password" : "Show password"}
            onRightIconClick={() => setShowPassword((prev) => !prev)}
            {...register("password", {
              required: USER_FORM_MESSAGES.password.required,
              minLength: {
                value: USER_FORM_LIMITS.password.min,
                message: USER_FORM_MESSAGES.password.min,
              },
              maxLength: {
                value: USER_FORM_LIMITS.password.max,
                message: USER_FORM_MESSAGES.password.max,
              },
            })}
          />
        )}

        <Controller
          control={control}
          name="userStatus"
          render={({ field }) => (
            <InputSelect
              label="User Status"
              options={userStatusOptions}
              optionLabel={(opt) => opt.name}
              optionValue={(opt) => opt.value}
              optionDisabled={() => false}
              value={field.value}
              onChange={(opt) => field.onChange(opt.value)}
            />
          )}
        />
      </div>

      <div className={footer}>
        <DefaultButton
          type="button"
          variant="secondary"
          label="Cancel"
          disabled={isLoading}
          onClick={onCancel}
        />
        <DefaultButton
          type="submit"
          variant="primary"
          label={mode === "edit" ? "Save changes" : "Add User"}
          loading={isLoading}
          disabled={isLoading}
        />
      </div>
    </form>
  );
}
