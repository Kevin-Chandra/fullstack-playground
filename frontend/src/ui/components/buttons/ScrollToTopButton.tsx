"use client";

import { useScrollToTop } from "@/src/lib/hooks/components/useScrollToTop";
import { MdArrowUpward } from "react-icons/md";
import DefaultButton from "./DefaultButton";

const wrapper = [
  "fixed right-2xl bottom-2xl z-40",
  "transition-[opacity,translate] duration-250 ease-out",
].join(" ");

const state = {
  shown: "translate-y-0 opacity-100",
  hidden: "pointer-events-none translate-y-5 opacity-0",
};

type ScrollToTopButtonProps = {
  /** Distance scrolled, in px, before the button fades in */
  threshold?: number;
  label?: string;
};

export default function ScrollToTopButton({
  threshold,
  label = "Scroll to top",
}: ScrollToTopButtonProps) {
  const { anchorRef, visible, scrollToTop } = useScrollToTop({ threshold });

  return (
    <div
      ref={anchorRef}
      aria-hidden={!visible}
      className={`${wrapper} ${visible ? state.shown : state.hidden}`}
    >
      <DefaultButton
        variant="primary"
        size="lg"
        icon={MdArrowUpward}
        aria-label={label}
        label={label}
        tabIndex={visible ? undefined : -1}
        onClick={scrollToTop}
      />
    </div>
  );
}
