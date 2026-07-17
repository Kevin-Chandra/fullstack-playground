"use client";

import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import DefaultInput from "@/src/ui/components/input/DefaultInput";
import InputSelect from "@/src/ui/components/input/InputSelect";
import { ReactNode } from "react";
import {
  MdAdd,
  MdAnchor,
  MdBatterySaver,
  MdCopyAll,
  MdCurrencyExchange,
  MdDelete,
  MdEdit,
  MdGroup,
  MdHideImage,
  MdPerson,
  MdSave,
  MdSearch,
  MdStar,
} from "react-icons/md";

export default function StyleGuidePage() {
  return (
    <div className="mx-auto my-5 w-full max-w-6xl px-5">
      <div className="flex mb-8 flex-col gap-2">
        <h1>Style Guide</h1>
        <p>
          Every token and component in the Everafter system, rendered live.
          Values are defined in tokens.json; full specs live in the Design
          Tokens sheet.
        </p>
      </div>
      <Section title={"01 · Button"} content={<Buttons />} />
      <Section title={"02 · Input"} content={<Inputs />} />
      <Section title={"03 · Input Select"} content={<InputSelects />} />
    </div>
  );
}

function Section({ title, content }: { title: string; content: ReactNode }) {
  return (
    <div className="my-8">
      <h2 className="uppercase font-mono text-muted mb-4">{title}</h2>
      <div className="bg-raised border border-edge rounded-xl p-8">
        {content}
      </div>
    </div>
  );
}

function Inputs() {
  const verticalClass = "flex flex-col gap-5";

  return (
    <div className={verticalClass}>
      <DefaultInput
        id="login-username"
        name="username"
        label="Username"
        autoComplete="username"
        placeholder="yourusername"
        required
        fullWidth
        inputSize="sm"
      />
      <DefaultInput
        id="login-username"
        name="username"
        label="Username"
        autoComplete="username"
        placeholder="yourusername"
        required
        fullWidth
        inputSize="md"
      />
      <DefaultInput
        id="login-username"
        name="username"
        label="USERNAME"
        autoComplete="username"
        placeholder="yourusername"
        required
        fullWidth
        inputSize="lg"
        error="Error text!!!"
      />
      <DefaultInput
        id="login-username"
        name="username"
        autoComplete="username"
        placeholder="Search"
        leftIcon={<MdSearch />}
        fullWidth
        inputSize="md"
      />
      <DefaultInput
        autoComplete="username"
        placeholder="Search"
        rightIcon={<MdCurrencyExchange />}
        fullWidth
        hint="Test the hint"
        inputSize="md"
      />
      <DefaultInput
        label="Test"
        autoComplete="username"
        placeholder="Search"
        leftIcon={<MdEdit />}
        rightIcon={<MdHideImage />}
        fullWidth
        hint="Test the hint"
        inputSize="md"
      />
      <DefaultInput
        label="Disabled input"
        autoComplete="username"
        placeholder="Search"
        leftIcon={<MdEdit />}
        rightIcon={<MdHideImage />}
        fullWidth
        inputSize="md"
        disabled
      />
    </div>
  );
}

function Buttons() {
  const verticalClass = "flex flex-col gap-5";
  const horizontalClass = "flex gap-4 items-center";

  return (
    <div className={verticalClass}>
      <div className={horizontalClass}>
        <DefaultButton
          variant="primary"
          size="md"
          label="Secondary medium"
          textAlignment="start"
        />
        <DefaultButton
          variant="primary"
          size="md"
          label="Secondary medium"
          textAlignment="start"
          disabled
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="secondary"
          size="md"
          label="Secondary medium"
          textAlignment="start"
        />
        <DefaultButton
          variant="secondary"
          size="md"
          label="Secondary medium"
          textAlignment="start"
          disabled
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="ghost"
          size="md"
          label="Ghost medium"
          textAlignment="start"
        />
        <DefaultButton
          variant="ghost"
          size="md"
          label="Ghost medium"
          textAlignment="start"
          disabled
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="danger"
          size="md"
          label="Danger medium"
          textAlignment="start"
        />
        <DefaultButton
          variant="danger"
          size="md"
          label="Danger medium"
          textAlignment="start"
          disabled
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="text"
          size="md"
          label="Text"
          textAlignment="start"
        />
        <DefaultButton
          variant="text"
          size="md"
          label="Text disabled"
          textAlignment="start"
          disabled
        />
      </div>
      <hr />
      <div className={horizontalClass}>
        <DefaultButton
          variant="primary"
          icon={<MdAdd />}
          size="sm"
          label="Icon primary small"
          textAlignment="start"
        />
        <DefaultButton
          variant="primary"
          icon={<MdAdd />}
          size="md"
          label="Icon primary medium"
          textAlignment="start"
        />
        <DefaultButton
          variant="primary"
          icon={<MdPerson />}
          size="lg"
          label="Icon primary large"
          textAlignment="start"
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="secondary"
          icon={<MdEdit />}
          size="sm"
          label="Icon primary small"
          textAlignment="start"
        />
        <DefaultButton
          variant="secondary"
          icon={<MdAdd />}
          size="md"
          label="Icon primary medium"
          textAlignment="start"
        />
        <DefaultButton
          variant="secondary"
          icon={<MdPerson />}
          size="lg"
          label="Icon primary large"
          textAlignment="start"
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="ghost"
          icon={<MdCopyAll />}
          iconPosition="right"
          size="sm"
          label="Icon primary small"
          textAlignment="start"
        />
        <DefaultButton
          variant="ghost"
          icon={<MdAdd />}
          iconPosition="right"
          size="md"
          label="Icon primary medium"
          textAlignment="start"
        />
        <DefaultButton
          variant="ghost"
          icon={<MdPerson />}
          iconPosition="right"
          size="lg"
          label="Icon primary large"
          textAlignment="start"
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="text"
          icon={<MdEdit />}
          iconPosition="left"
          size="sm"
          label="Edit small"
          textAlignment="start"
        />
        <DefaultButton
          variant="text"
          icon={<MdSave />}
          iconPosition="right"
          size="md"
          label="Icon primary medium"
          textAlignment="start"
        />
        <DefaultButton
          variant="text"
          icon={<MdPerson />}
          iconPosition="right"
          size="lg"
          label="Icon primary large"
          textAlignment="start"
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="danger"
          icon={<MdDelete />}
          iconPosition="left"
          size="sm"
          label="Delete small"
          textAlignment="start"
        />
        <DefaultButton
          variant="danger"
          icon={<MdStar />}
          iconPosition="right"
          size="md"
          label="Icon primary medium"
          textAlignment="start"
        />
        <DefaultButton
          variant="danger"
          icon={<MdAnchor />}
          iconPosition="right"
          size="lg"
          label="Icon primary large"
          textAlignment="start"
        />
      </div>
      <hr />

      {/* Icon Only Button  */}
      <div className={horizontalClass}>
        <DefaultButton
          variant="primary"
          icon={<MdDelete />}
          iconPosition="left"
          size="sm"
          textAlignment="start"
        />
        <DefaultButton
          variant="primary"
          icon={<MdStar />}
          iconPosition="right"
          size="md"
          textAlignment="start"
        />
        <DefaultButton
          variant="primary"
          icon={<MdAnchor />}
          iconPosition="right"
          size="lg"
          textAlignment="start"
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="secondary"
          icon={<MdDelete />}
          iconPosition="left"
          size="sm"
          textAlignment="start"
        />
        <DefaultButton
          variant="secondary"
          icon={<MdStar />}
          iconPosition="right"
          size="md"
          textAlignment="start"
        />
        <DefaultButton
          variant="secondary"
          icon={<MdAnchor />}
          iconPosition="right"
          size="lg"
          textAlignment="start"
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="danger"
          icon={<MdDelete />}
          iconPosition="left"
          size="sm"
          textAlignment="start"
        />
        <DefaultButton
          variant="danger"
          icon={<MdStar />}
          iconPosition="right"
          size="md"
          textAlignment="start"
        />
        <DefaultButton
          variant="danger"
          icon={<MdAnchor />}
          iconPosition="right"
          size="lg"
          textAlignment="start"
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="ghost"
          icon={<MdDelete />}
          size="sm"
          textAlignment="start"
        />
        <DefaultButton
          variant="ghost"
          icon={<MdStar />}
          size="md"
          textAlignment="start"
        />
        <DefaultButton
          variant="ghost"
          icon={<MdAnchor />}
          iconPosition="right"
          size="lg"
          textAlignment="start"
        />
      </div>
      <div className={horizontalClass}>
        <DefaultButton
          variant="text"
          icon={<MdDelete />}
          size="sm"
          textAlignment="start"
        />
        <DefaultButton
          variant="text"
          icon={<MdStar />}
          size="md"
          textAlignment="start"
        />
        <DefaultButton
          variant="text"
          icon={<MdAnchor />}
          iconPosition="right"
          size="lg"
          textAlignment="start"
        />
      </div>
    </div>
  );
}

function InputSelects() {
  const verticalClass = "flex flex-col gap-8";
  const horizontalClass = "flex gap-6";

  type ExampleOptions = {
    name: string;
    value: string;
  };

  const options: ExampleOptions[] = [
    { name: "Option 1", value: "1" },
    { name: "Option 2", value: "2" },
    { name: "Option 3", value: "3" },
    { name: "Option 4", value: "4" },
    { name: "Option 5", value: "5" },
  ];

  const optionLabel = (o: ExampleOptions) => {
    return o.name;
  };

  const optionValue = (o: ExampleOptions) => {
    return o.value;
  };

  const optionDisabled = (o: ExampleOptions) => {
    return o.value === "5";
  };

  return (
    <div className={verticalClass}>
      <div className={horizontalClass}>
        <InputSelect
          label="Status"
          fullWidth
          options={options}
          optionLabel={optionLabel}
          optionValue={optionValue}
          optionDisabled={optionDisabled}
        />
        <InputSelect
          label="Disabled"
          fullWidth
          disabled
          options={options}
          optionLabel={optionLabel}
          optionValue={optionValue}
          optionDisabled={optionDisabled}
        />
      </div>
      <div className={horizontalClass}>
        <InputSelect
          label="Input Select With Error"
          fullWidth
          error="Error"
          options={options}
          optionLabel={optionLabel}
          optionValue={optionValue}
          optionDisabled={optionDisabled}
        />
        <InputSelect
          label="Input Select With Hint"
          hint="Try to click me"
          fullWidth
          options={options}
          optionLabel={optionLabel}
          optionValue={optionValue}
          optionDisabled={optionDisabled}
        />
      </div>
      <div className={horizontalClass}>
        <InputSelect
          label="Input Select With Icon"
          icon={<MdPerson />}
          fullWidth
          options={options}
          placeholder="Long text Long text Long text Long text Long text Long text Long text Long text Long text AA BB CC"
          optionLabel={optionLabel}
          optionValue={optionValue}
          optionDisabled={optionDisabled}
        />
        <InputSelect
          label="Input Select With Icon Disabled"
          icon={<MdGroup />}
          fullWidth
          disabled
          placeholder="Long text Long text Long text Long text Long text Long text Long text Long text Long text AA BB CC"
          options={options}
          optionLabel={optionLabel}
          optionValue={optionValue}
          optionDisabled={optionDisabled}
        />
      </div>
    </div>
  );
}
