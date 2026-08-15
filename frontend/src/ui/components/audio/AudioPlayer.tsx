"use client";

import { useAudioPlayer } from "@/src/lib/hooks/components/useAudioPlayer";
import { MdPause, MdPlayArrow } from "react-icons/md";
import DefaultButton from "../buttons/DefaultButton";

export type AudioPlayerProps = {
  audioUrl: string;
  className?: string;
};

const frame =
  "flex w-full items-center gap-lg rounded-xl border border-edge bg-canvas/60 p-lg";
const waveformSlot = "relative min-h-10 min-w-0 flex-1";
const waveform = "w-full";
const waveformIdle = "w-full invisible";
const overlay = "absolute inset-0 flex items-center gap-md";
const skeleton = "h-2.5 w-full animate-pulse rounded-full bg-edge-strong";
const errorMessage = "min-w-0 flex-1 truncate text-body-sm text-error";
const time = "shrink-0 font-mono text-body-sm text-muted tabular-nums";

export default function AudioPlayer({ audioUrl, className = "" }: AudioPlayerProps) {
  const { containerRef, isReady, error, isPlaying, timeLabel, togglePlay, retry } =
    useAudioPlayer({ audioUrl });

  const icon = isPlaying ? MdPause : MdPlayArrow;

  function renderOverlay() {
    if (error) {
      return (
        <div role="alert" className={overlay}>
          <span className={errorMessage}>Could not load this voice note.</span>
          <DefaultButton
            variant="text"
            size="xs"
            label="Retry"
            onClick={retry}
          />
        </div>
      );
    }

    if (!isReady) {
      return (
        <div className={overlay}>
          <span className={skeleton} />
        </div>
      );
    }

    return null;
  }

  return (
    <div className={`${frame} ${className}`}>
      <DefaultButton
        onClick={togglePlay}
        disabled={!isReady}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
        icon={icon}
        className="rounded-full"
      />
      <div className={waveformSlot}>
        <div
          ref={containerRef}
          className={isReady && !error ? waveform : waveformIdle}
        />
        {renderOverlay()}
      </div>

      {error ?
        null :
        <span className={time}>{isReady ? timeLabel : "--:--"}</span>
      }

    </div>
  );
}
