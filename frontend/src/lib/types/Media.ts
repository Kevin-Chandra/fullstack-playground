import { MediaType } from "./enum/MediaType.enum";
import { MediaUploadPath } from "./enum/MediaUploadPath.enum";

export interface MediaUploadParams {
  mediaUploadPath: MediaUploadPath;
  mediaType: MediaType;
}

/** The upload endpoint's response body: the stored key and its preview URL. */
export interface MediaUploadResponse {
  key: string;
  url: string;
}

export interface MediaUploadResult extends MediaUploadResponse {
  mediaType: MediaType;
}
