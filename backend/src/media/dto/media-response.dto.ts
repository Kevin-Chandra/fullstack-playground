/**
 * `key` is what gets persisted; `url` is a derived preview link.
 *
 * `url` is nullable because {@link StorageService.getPublicUrl} is — a bucket
 * with no public URL configured resolves to none — and it matches the
 * `ResolvedMediaRef` shape the page reads hand back for the same value.
 */
export type MediaResponse = {
  key: string;
  url: string | null;
};
