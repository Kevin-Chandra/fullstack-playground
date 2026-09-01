import { MediaType } from "./enum/MediaType.enum";
import { MediaUploadPath } from "./enum/MediaUploadPath.enum";

export interface MediaUploadParams {
  mediaUploadPath: MediaUploadPath;
  mediaType: MediaType;
}

/**
 * The upload endpoint's response body: the stored key and its preview URL.
 *
 * `url` is nullable for the same reason `MediaRef.url` is — it is derived from
 * the key by the storage layer, which resolves to none when the bucket has no
 * public URL. Only `key` is authoritative.
 */
export interface MediaUploadResponse {
  key: string;
  url: string | null;
}

export interface MediaUploadResult extends MediaUploadResponse {
  mediaType: MediaType;
}
