import { Wish } from "@/src/lib/types/Wish";
import { formatFullDateRsvp } from "@/src/lib/utils/dateTimeFormatter";
import Image from "next/image";
import { MdFormatQuote, MdMicNone } from "react-icons/md";
import DefaultBadge from "../../components/badge/DefaultBadge";

const card =
  "flex w-full flex-col gap-lg rounded-md border border-edge bg-raised p-lg text-left shadow-card";
const photoFrame =
  "relative aspect-[4/3] w-full overflow-hidden rounded-md bg-canvas/40";
const photo = "object-cover";
const quote = "flex flex-col items-start gap-md px-sm";
const quoteMarkOpen = "rotate-180 self-start text-accent/40";
const quoteMarkClose = "self-end text-accent/40";
const message = "line-clamp-5 break-words text-body-lg text-ink";
const footer = "flex flex-col gap-xs items-start";
const guestName = "text-h4 text-ink";
const guestMeta = "text-label text-muted";

const QUOTE_SIZE = 20;
// wishes grid: one card per row on mobile, two from sm, three from lg
const PHOTO_SIZES = "(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw";

type WishItemListCardProps = {
  wish: Wish;
  onClick: () => void;
};

export default function WishItemListCard({
  wish,
  onClick,
}: WishItemListCardProps) {
  const guest = wish.guest;

  function renderPhoto() {
    if (wish.imageUrl) {
      return (
        <div className={photoFrame}>
          <Image
            className={photo}
            src={wish.imageUrl}
            alt={`Photo from ${guest.name}`}
            fill
            loading="eager"
            sizes={PHOTO_SIZES}
          />
        </div>
      );
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={card}>
      {renderPhoto()}

      {wish.audioUrl &&
        <DefaultBadge
          icon={MdMicNone}
          label="Voice note attached"
          variant="warning"
          className="mt-md self-start"
        />}

      <div className={quote}>
        <MdFormatQuote size={QUOTE_SIZE} className={quoteMarkOpen} />
        <p className={message}>{wish.message}</p>
        <MdFormatQuote size={QUOTE_SIZE} className={quoteMarkClose} />
      </div>

      <hr />

      <div className={footer}>
        <span className={guestName}>{guest.name}</span>
        <span className={guestMeta}>{formatFullDateRsvp(wish.createdAt)}</span>
      </div>
    </button>
  );
}
