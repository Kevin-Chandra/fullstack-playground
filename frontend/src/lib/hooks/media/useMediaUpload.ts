"use client"

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { UPLOAD_CANCELLED_ERROR } from "../../constants/error";
import { MEDIA_ACCEPTED_MIME, MEDIA_MAX_SIZE_BYTES } from "../../constants/media";
import { uploadMedia } from "../../services/mediaService";
import { MediaType } from "../../types/enum/MediaType.enum";
import { ErrorEntity } from "../../types/ErrorEntity";
import { MediaUploadParams, MediaUploadResult } from "../../types/Media";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

function toMegabytes(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

/**
 * Rejects a file the backend would refuse anyway, so nothing oversized leaves
 * the browser. Returns undefined when the file is acceptable.
 *
 * These limits mirror `MediaService.assertFileMatchesType`, which applies the
 * per-type caps in `file.constants.ts` — the route's own pipe only knows the
 * largest of the three. Changing a limit here without changing it there makes
 * this a lie in one direction or the other.
 */
function validateMediaFile(file: File, mediaType: MediaType): ErrorEntity | undefined {
  if (!MEDIA_ACCEPTED_MIME[mediaType].test(file.type)) {
    return {
      error: "Unsupported file",
      description: `This file cannot be used as ${mediaType}.`,
      errorStatusCode: 400,
    };
  }

  const maxSize = MEDIA_MAX_SIZE_BYTES[mediaType];
  if (file.size > maxSize) {
    return {
      error: "File too large",
      description: `An ${mediaType} file must be ${toMegabytes(maxSize)}MB or smaller.`,
      errorStatusCode: 400,
    };
  }

  return undefined;
}

export function useMediaUpload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (
      file: File,
      params: MediaUploadParams,
    ): Promise<Result<MediaUploadResult, ErrorEntity>> => {
      const validationError = validateMediaFile(file, params.mediaType);
      if (validationError) {
        return { success: false, error: validationError };
      }

      const controller = new AbortController();
      controllerRef.current = controller;
      setProgress(0);
      setLoading(true);

      try {
        const result = await uploadMedia(file, params, {
          signal: controller.signal,
          onProgress: setProgress,
        });
        return { success: true, data: result };
      } catch (e) {
        // A cancel carries no response, so handleSystemError would report it as
        // a generic failure rather than the deliberate action it was. The error
        // carries CustomErrorCode.UPLOAD_CANCELLED so callers can skip the toast.
        if (axios.isCancel(e)) {
          return { success: false, error: UPLOAD_CANCELLED_ERROR };
        }
        return { success: false, error: handleSystemError(e) };
      } finally {
        // Only clear the ref if a newer upload has not already claimed it.
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
        setLoading(false);
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  // Drop an in-flight upload when the component goes away.
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return {
    loading,
    progress,
    upload,
    cancel,
  };
}
