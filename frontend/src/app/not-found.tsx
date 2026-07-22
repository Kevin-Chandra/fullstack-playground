import { NOT_FOUND_ERROR, SUPPORT_EMAIL } from "@/src/lib/constants/error";
import FullScreenError from "@/src/ui/components/error/FullScreenError";
import NotFoundActions from "@/src/ui/components/error/NotFoundActions";

/**
 * Root 404 — Next.js renders this for `notFound()` calls and any URL that
 * doesn't match a route. Server component; the interactive CTAs live in the
 * client NotFoundActions.
 */
const supportLink =
  "font-medium text-accent underline-offset-4 transition-colors hover:text-accent-soft hover:underline";

export default function NotFound() {
  return (
    <FullScreenError
      code={NOT_FOUND_ERROR.code}
      title={NOT_FOUND_ERROR.title}
      description={NOT_FOUND_ERROR.description}
      actions={<NotFoundActions />}
      footer={
        <>
          {NOT_FOUND_ERROR.supportPrompt}{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={supportLink}>
            {NOT_FOUND_ERROR.supportLabel}
          </a>
        </>
      }
    />
  );
}
