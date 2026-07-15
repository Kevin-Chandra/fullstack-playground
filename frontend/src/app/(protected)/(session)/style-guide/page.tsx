import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import {
  MdAdd,
  MdAnchor,
  MdCopyAll,
  MdDelete,
  MdEdit,
  MdPercent,
  MdPerson,
  MdSave,
  MdStar,
} from "react-icons/md";

export default function StyleGuidePage() {
  return (
    <div className="mx-auto my-5">
      <h1>Style Guide</h1>
      <Buttons />
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
          size="sm"
          label="Primary small"
          textAlignment="start"
          // fullWidth
        />
        <DefaultButton
          variant="primary"
          size="md"
          label="Primary medium"
          textAlignment="center"
          // fullWidth
        />
        <DefaultButton
          variant="primary"
          size="lg"
          label="Primary large"
          textAlignment="end"
          // fullWidth
        />
      </div>
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
