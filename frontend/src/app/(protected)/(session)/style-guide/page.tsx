import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import DefaultInput from "@/src/ui/components/input/DefaultInput";
import { ReactNode } from "react";
import {
  MdAdd,
  MdAnchor,
  MdCopyAll,
  MdCurrencyExchange,
  MdDelete,
  MdEdit,
  MdHideImage,
  MdPerson,
  MdSave,
  MdSearch,
  MdStar,
} from "react-icons/md";

export default function StyleGuidePage() {
  return (
    <div className="mx-auto my-5">
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
