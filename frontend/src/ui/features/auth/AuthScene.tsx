import type { ReactNode } from "react";
import BrandLockup from "@/src/ui/components/brand/BrandLockup";
import AuthHero from "@/src/ui/features/auth/AuthHero";

type AuthSceneProps = {
  children: ReactNode;
};

/*
 * Layout stages, one line per stage. The `card:` and `hero:` variants are
 * semantic breakpoint tokens from globals.css — move a switch by editing
 * its token value, not these classes.
 *   base  → full-bleed content on the canvas (small screens)
 *   card: → centered card
 *   hero: → marketing split-panel joins the card
 */
const scene = [
  "relative flex min-h-screen items-stretch justify-center overflow-hidden bg-canvas",
  "card:items-center card:px-6 card:py-10",
].join(" ");

const shell = [
  "relative grid w-full animate-auth-in motion-reduce:animate-none",
  "card:overflow-hidden card:rounded-xl card:border card:border-edge card:bg-raised card:shadow-modal",
  "hero:max-w-5xl hero:min-h-145 hero:grid-cols-2",
].join(" ");

const formColumn = [
  "flex flex-col px-7 pt-14 pb-10 sm:px-12",
  "card:justify-center card:py-14",
  "hero:px-14 hero:py-16",
].join(" ");

const formColumnInner = ["flex w-full grow flex-col", "card:grow-0"].join(" ");

export default function AuthScene({ children }: AuthSceneProps) {
  return (
    <div className={scene}>
      {/* faint accent glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-accent-halo opacity-25"
      />

      <main className={shell}>
        <AuthHero className="hidden hero:flex" />

        <div className={formColumn}>
          <div className={formColumnInner}>
            <BrandLockup title="Everafter" className="mb-12 hero:hidden" />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
