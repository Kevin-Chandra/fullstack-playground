"use client";

import { MAX_PAGE_BUTTONS } from "@/src/lib/constants/pagination";
import InitialsAvatar from "@/src/ui/components/avatar/InitialsAvatar";
import DefaultBadge from "@/src/ui/components/badge/DefaultBadge";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import DefaultDialog from "@/src/ui/components/dialog/DefaultDialog";
import CheckboxGroup from "@/src/ui/components/input/CheckboxGroup";
import DefaultCheckbox from "@/src/ui/components/input/DefaultCheckbox";
import DefaultInput from "@/src/ui/components/input/DefaultInput";
import DefaultRadioButton from "@/src/ui/components/input/DefaultRadioButton";
import DefaultSwitch from "@/src/ui/components/input/DefaultSwitch";
import DefaultTextarea from "@/src/ui/components/input/DefaultTextarea";
import InputSelect from "@/src/ui/components/input/InputSelect";
import RadioGroup from "@/src/ui/components/input/RadioGroup";
import PaginationBar from "@/src/ui/components/pagination/PaginationBar";
import { toast } from "@/src/ui/components/toast/toast";
import { ReactNode, useState } from "react";
import {
  MdAdd,
  MdAnchor,
  MdArchive,
  MdCopyAll,
  MdCurrencyExchange,
  MdDelete,
  MdDeleteForever,
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
      <Section title={"04 · Checkbox"} content={<Checkboxes />} />
      <Section title={"05 · Radio Button"} content={<RadioButtons />} />
      <Section title={"06 · Switch"} content={<Switches />} />
      <Section title={"07 · Dialog"} content={<Dialogs />} />
      <Section title={"08 · Pagination"} content={<PaginationBars />} />
      <Section title={"09 · Badge"} content={<Badges />} />
      <Section title={"10 · Toast"} content={<Toasts />} />
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

      <DefaultTextarea
        label="Text area"
        autoComplete="username"
        placeholder="Search"
        fullWidth
      />

      <DefaultTextarea
        id="login-username"
        name="username"
        label="USERNAME"
        autoComplete="username"
        placeholder="yourusername"
        required
        fullWidth
        error="Error text!!!"
      />

      <DefaultTextarea
        id="login-username"
        name="username"
        label="USERNAME"
        autoComplete="username"
        placeholder="yourusername"
        resize="vertical"
        rows={2}
        required
        fullWidth
        hint="HINT!!!"
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
          size="xs"
          label="Icon primary small"
          textAlignment="start"
        />
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
          size="xs"
          label="Icon primary small"
          textAlignment="start"
        />
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
          icon={<MdCopyAll />}
          iconPosition="right"
          size="xs"
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
          size="xs"
          label="Edit small"
          textAlignment="start"
        />
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
          size="xs"
          label="Delete small"
          textAlignment="start"
        />
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
          size="xs"
          textAlignment="start"
        />
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
          size="xs"
          textAlignment="start"
        />
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
          size="xs"
          textAlignment="start"
        />
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
          size="xs"
          textAlignment="start"
        />
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
          size="xs"
          textAlignment="start"
        />
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

const choiceStackClass = "flex flex-col gap-5";
const choiceRowClass = "flex flex-wrap gap-6 items-center";

function Checkboxes() {
  const [subscribed, setSubscribed] = useState(false);
  const [toppings, setToppings] = useState<string[]>(["cheese"]);

  return (
    <div className={choiceStackClass}>
      <div className={choiceRowClass}>
        <DefaultCheckbox label="Unchecked" />
        <DefaultCheckbox label="Checked" defaultChecked />
        <DefaultCheckbox label="Indeterminate" indeterminate />
      </div>
      <div className={choiceRowClass}>
        <DefaultCheckbox label="Disabled" disabled />
        <DefaultCheckbox label="Disabled checked" defaultChecked disabled />
        <DefaultCheckbox
          label="Disabled indeterminate"
          indeterminate
          disabled
        />
      </div>
      <div className={choiceRowClass}>
        <DefaultCheckbox aria-label="Checkbox without label" />
        <DefaultCheckbox
          aria-label="Checked checkbox without label"
          defaultChecked
        />
      </div>
      {/* controlled single: onValueChange hands back the boolean directly */}
      <div className={choiceRowClass}>
        <DefaultCheckbox
          label="Subscribe to newsletter"
          checked={subscribed}
          onValueChange={setSubscribed}
        />
        <span className="text-caption text-muted">
          {subscribed ? "Subscribed" : "Not subscribed"}
        </span>
      </div>
      {/* controlled multi-select group: onValueChange hands back a string[] */}
      <div className="flex flex-col gap-3">
        <CheckboxGroup
          label="Toppings"
          labelPosition="right"
          value={toppings}
          onValueChange={setToppings}
          orientation="vertical"
        >
          <DefaultCheckbox value="cheese" label="Cheese" />
          <DefaultCheckbox value="mushroom" label="Mushroom" />
          <DefaultCheckbox value="pepperoni" label="Pepperoni" />
          <DefaultCheckbox value="pineapple" label="Pineapple" disabled />
        </CheckboxGroup>
        <span className="text-caption text-muted">
          Selected: {toppings.join(", ") || "none"}
        </span>
      </div>
    </div>
  );
}

function RadioButtons() {
  const [plan, setPlan] = useState("pro");

  return (
    <div className={choiceStackClass}>
      {/* Controlled group: onValueChange hands back the selected value string */}
      <div className="flex flex-col gap-3">
        <RadioGroup
          label="Plan"
          value={plan}
          onValueChange={setPlan}
          orientation="horizontal"
        >
          <DefaultRadioButton value="starter" label="Starter" />
          <DefaultRadioButton value="pro" label="Pro" />
          <DefaultRadioButton value="enterprise" label="Enterprise" disabled />
        </RadioGroup>
        <span className="text-caption text-muted">Selected: {plan}</span>
      </div>

      {/* Uncontrolled group seeded by defaultValue */}
      <RadioGroup
        label="Billing period"
        defaultValue="monthly"
        orientation="vertical"
      >
        <DefaultRadioButton value="monthly" label="Monthly" />
        <DefaultRadioButton value="yearly" label="Yearly" />
      </RadioGroup>

      {/* Whole group disabled from the parent */}
      <RadioGroup
        label="Disabled group"
        defaultValue="b"
        orientation="horizontal"
        disabled
      >
        <DefaultRadioButton value="a" label="Option A" />
        <DefaultRadioButton value="b" label="Option B" />
      </RadioGroup>
    </div>
  );
}

function Switches() {
  return (
    <div className={choiceStackClass}>
      <div className={choiceRowClass}>
        <DefaultSwitch label="Off" />
        <DefaultSwitch label="On" defaultChecked />
      </div>
      <div className={choiceRowClass}>
        <DefaultSwitch label="Disabled off" disabled />
        <DefaultSwitch label="Disabled on" defaultChecked disabled />
      </div>
      <div className={choiceRowClass}>
        <DefaultSwitch aria-label="Switch without label" />
        <DefaultSwitch aria-label="Switch on without label" defaultChecked />
      </div>
    </div>
  );
}

type DialogDemo = "icon" | "default" | "destructive" | "form";

function Dialogs() {
  const horizontalClass = "flex flex-wrap gap-4 items-center";
  const [openDialog, setOpenDialog] = useState<DialogDemo | null>(null);

  const close = () => setOpenDialog(null);

  return (
    <>
      <div className={horizontalClass}>
        <DefaultButton
          variant="secondary"
          size="md"
          label="Default dialog with icon"
          onClick={() => setOpenDialog("icon")}
        />
        <DefaultButton
          variant="secondary"
          size="md"
          label="Default dialog"
          onClick={() => setOpenDialog("default")}
        />
        <DefaultButton
          variant="danger"
          size="md"
          label="Destructive dialog"
          onClick={() => setOpenDialog("destructive")}
        />
        <DefaultButton
          variant="primary"
          size="md"
          label="Form dialog"
          onClick={() => setOpenDialog("form")}
        />
      </div>

      <DefaultDialog
        open={openDialog === "icon"}
        onClose={close}
        icon={<MdGroup />}
        title="Discard draft? Discard draft? Discard draft? Discard draft?"
        primaryButtonLabel="Discard"
        secondaryButtonLabel="Cancel"
        onPrimaryClick={close}
      >
        Your unsaved changes will be lost. This only affects the current draft;
        published content stays untouched.
      </DefaultDialog>

      <DefaultDialog
        open={openDialog === "default"}
        onClose={close}
        title="Discard draft? Discard draft? Discard draft? Discard draft?"
        primaryButtonLabel="Discard"
        secondaryButtonLabel="Cancel"
        onPrimaryClick={close}
        dismissable={false}
      >
        Your unsaved changes will be lost. This only affects the current draft;
        published content stays untouched.
      </DefaultDialog>

      <DefaultDialog
        open={openDialog === "destructive"}
        onClose={close}
        destructive
        icon={<MdDeleteForever />}
        title="Delete account"
        primaryButtonLabel="Delete"
        secondaryButtonLabel="Cancel"
        onPrimaryClick={close}
      >
        This permanently removes the account and every workspace it owns. This
        action cannot be undone.
      </DefaultDialog>

      <DefaultDialog
        open={openDialog === "form"}
        onClose={close}
        title="Invite teammate"
        primaryButtonLabel="Send invite"
        onPrimaryClick={close}
      >
        <DefaultInput
          label="Name"
          name="invite-name"
          placeholder="Ada Lovelace"
          fullWidth
          inputSize="md"
        />
        <DefaultInput
          label="Email"
          name="invite-email"
          type="email"
          placeholder="ada@everafter.dev"
          leftIcon={<MdPerson />}
          fullWidth
          inputSize="md"
        />
      </DefaultDialog>
    </>
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

function PaginationBars() {
  const [currentPage, setCurrentPage] = useState(10);
  return (
    <PaginationBar
      currentPage={currentPage}
      totalPages={20}
      totalItems={300}
      itemsPerPage={15}
      maxPageNumber={MAX_PAGE_BUTTONS}
      onPageChange={setCurrentPage}
    />
  );
}

function Badges() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <InitialsAvatar initials="AB" size="sm" variant="primary" />
        <InitialsAvatar initials="AB" size="md" variant="primary" />
        <InitialsAvatar initials="AB" size="lg" variant="primary" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <InitialsAvatar initials="AB" size="sm" variant="secondary" />
        <InitialsAvatar initials="AB" size="md" variant="secondary" />
        <InitialsAvatar initials="AB" size="lg" variant="secondary" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <DefaultBadge
          variant="active"
          label="Long text Long text Long text Long text Long text Long"
        />
        <DefaultBadge variant="warning" label="Pending" />
        <DefaultBadge variant="neutral" label="Draft" />
        <DefaultBadge variant="danger" label="Archived" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <DefaultBadge icon={MdGroup} variant="active" label="5 pax" />
        <DefaultBadge icon={MdGroup} variant="warning" label="Pending" />
        <DefaultBadge icon={MdArchive} variant="neutral" label="Draft" iconPosition="end" />
        <DefaultBadge icon={MdDelete} variant="danger" label="Archived" iconPosition="end" />
      </div>
    </div>
  );
}

function Toasts() {
  const horizontalClass = "flex flex-wrap gap-4 items-center";

  const runLoadingDemo = () => {
    const id = toast.loading("Saving changes…", {
      subline: "This may take a moment.",
    });
    setTimeout(
      () =>
        toast.update(id, {
          variant: "success",
          message: "Changes saved",
          subline: "Everything is up to date.",
        }),
      2000,
    );
  };

  const runLoadingErrorDemo = () => {
    const id = toast.loading("Saving changes…", {
      subline: "This may take a moment.",
    });
    setTimeout(
      () =>
        toast.update(id, {
          variant: "error",
          message: "Something went wrong",
          subline: "Unable to connect to internet",
        }),
      3000,
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* message only */}
      <div className={horizontalClass}>
        <DefaultButton
          variant="secondary"
          size="md"
          label="Success"
          onClick={() => toast.success("Invitation sent")}
        />
        <DefaultButton
          variant="secondary"
          size="md"
          label="Info"
          onClick={() => toast.info("A new version is available")}
        />
        <DefaultButton
          variant="danger"
          size="md"
          label="Error"
          onClick={() => toast.error("Couldn’t save your changes")}
        />
        <DefaultButton
          variant="ghost"
          size="md"
          label="Loading (persist)"
          onClick={() => toast.loading("Uploading files…")}
        />
      </div>

      {/* message + subline */}
      <div className={horizontalClass}>
        <DefaultButton
          variant="secondary"
          size="md"
          label="Success + subline"
          onClick={() =>
            toast.success("Teammate invited", {
              subline: "ada@everafter.dev will receive an email shortly.",
            })
          }
        />
        <DefaultButton
          variant="secondary"
          size="md"
          label="Subline long text"
          onClick={() =>
            toast.success("Teammate invited", {
              subline:
                "ada@everafter.dev will receive an email shortly. We'll resume automatically when you're back online. ada@everafter.dev will receive an email shortly.",
            })
          }
        />
        <DefaultButton
          variant="secondary"
          size="md"
          label="Info + subline"
          onClick={() =>
            toast.info("Sync paused", {
              subline: "We'll resume automatically when you're back online.",
            })
          }
        />
        <DefaultButton
          variant="danger"
          size="md"
          label="Error + subline"
          onClick={() =>
            toast.error("Upload failed", {
              subline: "The file exceeds the 25 MB limit.",
            })
          }
        />
        <DefaultButton
          variant="ghost"
          size="md"
          label="Loading + subline"
          onClick={() =>
            toast.loading("Processing…", {
              subline: "Crunching the numbers.",
            })
          }
        />
      </div>

      {/* interactions */}
      <div className={horizontalClass}>
        <DefaultButton
          variant="primary"
          size="md"
          label="Loading → success"
          onClick={runLoadingDemo}
        />
        <DefaultButton
          variant="danger"
          size="md"
          label="Loading → error"
          onClick={runLoadingErrorDemo}
        />
        <DefaultButton
          variant="ghost"
          size="md"
          label="Dismiss all"
          onClick={() => toast.dismiss()}
        />
      </div>
    </div>
  );
}
