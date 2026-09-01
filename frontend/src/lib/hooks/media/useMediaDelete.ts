"use client"

import { deleteMedia } from "../../services/mediaService";
import { useMutation } from "../useMutation";

/**
 * Deletes an uploaded object outright — for an upload the editor is discarding
 * before it was ever saved.
 *
 * Not the way to remove a file from a page. The backend refuses a key any draft
 * or published snapshot still references, because deleting one breaks the live
 * page. Drop the ref from the section and save instead: the save collects the
 * object once nothing points at it.
 */
export function useMediaDelete() {
  const { loading, mutate } = useMutation(deleteMedia);

  return {
    loading,
    remove: mutate,
  };
}
