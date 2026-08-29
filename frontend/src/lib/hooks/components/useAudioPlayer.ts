import { formatDurationClock } from "@/src/lib/utils/dateTimeFormatter";
import { useWavesurfer } from "@wavesurfer/react";
import { useEffect, useRef, useState } from "react";
import { ErrorEntity } from "../../types/ErrorEntity";
import { handleSystemError } from "../../utils/errorHandler";

type UseAudioPlayerParams = {
  audioUrl: string;
};

const WAVEFORM_SHAPE = {
  height: 40,
  barWidth: 5,
  barGap: 6,
  barRadius: 5,
  barMinHeight: 2,
  cursorWidth: 0,
  normalize: true,
  dragToSeek: true,
  waveColor: "#5C4A3A",
  progressColor: "#e2b190",
} as const;

export function useAudioPlayer({ audioUrl }: UseAudioPlayerParams) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<ErrorEntity>();

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: audioUrl,
    ...WAVEFORM_SHAPE,
  });

  useEffect(() => {
    if (!wavesurfer) return;

    const unsubscribe = [
      wavesurfer.on("load", () => setError(undefined)),
      wavesurfer.on("error", (e) => setError(handleSystemError(e))),
    ];

    return () => unsubscribe.forEach((off) => off());
  }, [wavesurfer]);

  const duration = isReady ? (wavesurfer?.getDuration() ?? 0) : 0;
  const timeLabel = formatDurationClock(currentTime > 0 ? currentTime : duration);

  const togglePlay = () => {
    wavesurfer?.playPause();
  };

  const retry = () => {
    if (!wavesurfer) return;

    wavesurfer.load(audioUrl).catch(() => undefined);
  };

  return { containerRef, isReady, error, isPlaying, timeLabel, togglePlay, retry };
}
