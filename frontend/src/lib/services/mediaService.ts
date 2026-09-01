import { Media as MediaPath } from "../constants/apiPaths";
import { MEDIA_UPLOAD_TIMEOUT_MS } from "../constants/media";
import { axiosInstance } from "../network/axiosInstance";
import {
  MediaUploadParams,
  MediaUploadResponse,
  MediaUploadResult,
} from "../types/Media";

interface UploadMediaOptions {
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
}

export const uploadMedia = async (
  file: File,
  params: MediaUploadParams,
  options?: UploadMediaOptions,
): Promise<MediaUploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  // The backend runs JSON.parse on this part, so it has to be a single string
  // field rather than separate data[...] entries.
  formData.append("data", JSON.stringify(params));

  const response = await axiosInstance.post<MediaUploadResponse>(MediaPath.BASE, formData, {
    // The instance sets application/json globally, which would send the body
    // without a multipart boundary. Clearing it lets axios derive the header
    // and boundary from the FormData.
    headers: { "Content-Type": undefined },
    // Large uploads outrun the instance's default timeout.
    timeout: MEDIA_UPLOAD_TIMEOUT_MS,
    signal: options?.signal,
    onUploadProgress: (event) => {
      // `total` is absent when the size is unknown, leaving no percentage to report.
      if (!options?.onProgress || !event.total) return;
      options.onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  // The response carries only the key and its URL. Stamping the requested type
  // back on is what makes the result a complete `MediaRef` — the backend
  // rejects a ref without one, and its collector cannot see the key at all.
  return { ...response.data, mediaType: params.mediaType };
};

export const deleteMedia = async (key: string): Promise<void> => {
  // The key travels as a query param because it contains slashes.
  await axiosInstance.delete(MediaPath.BASE, { params: { key } });
};
