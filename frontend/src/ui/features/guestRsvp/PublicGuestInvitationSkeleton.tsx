const content = "flex flex-col items-center gap-md";
const bar = "animate-pulse rounded-full bg-edge-strong";
const headline = `h-6 w-72 ${bar}`;
const subline = `h-4 w-44 ${bar}`;

export default function PublicGuestInvitationSkeleton() {
  return (
    <div aria-hidden className={content}>
      <span className={headline} />
      <span className={subline} />
    </div>
  );
}
