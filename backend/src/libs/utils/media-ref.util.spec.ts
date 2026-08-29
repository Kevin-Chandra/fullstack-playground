import { MediaType } from "../entity/enums/media-type.enum";
import {
  collectMediaKeys,
  collectMediaRefs,
  MediaRef,
  resolveMediaRefs,
} from "./media-ref.util";

const url = (key: string) => `https://cdn.test/${key}`;

describe("collectMediaKeys", () => {
  it("finds keys nested in objects and arrays", () => {
    const data = {
      heading: "Our day",
      background: { mediaType: MediaType.IMAGE, key: "a.jpg", alt: "backdrop" },
      couple: {
        bride: {
          name: "Ada",
          photo: { mediaType: MediaType.IMAGE, key: "b.jpg" },
        },
        groom: { name: "Alan", photo: { key: "c.jpg" } },
      },
      images: [
        { mediaType: MediaType.IMAGE, key: "d.jpg" },
        { key: "e.jpg", alt: "party" },
      ],
    };

    expect(collectMediaKeys(data).sort()).toEqual(["a.jpg", "b.jpg", "d.jpg"]);
  });

  it("deduplicates keys shared by several refs", () => {
    const data = {
      a: { mediaType: MediaType.IMAGE, key: "same.jpg" },
      b: [{ mediaType: MediaType.IMAGE, key: "same.jpg" }],
    };

    expect(collectMediaKeys(data)).toEqual(["same.jpg"]);
  });

  it("ignores payloads without media and non-string or empty keys", () => {
    expect(collectMediaKeys({ title: "Hero", subtitle: "" })).toEqual([]);
    expect(collectMediaKeys({ ref: { key: "" } })).toEqual([]);
    expect(collectMediaKeys({ ref: { key: 42 } })).toEqual([]);
    expect(collectMediaKeys(null)).toEqual([]);
  });

  it("skips a ref whose mediaType is not a known media type", () => {
    expect(
      collectMediaKeys({ ref: { key: "a.jpg", mediaType: "gif" } }),
    ).toEqual([]);
  });
});

describe("collectMediaRefs", () => {
  it("keeps mediaType so callers do not re-derive it from the key", () => {
    const data = {
      background: { key: "a.jpg", mediaType: MediaType.IMAGE },
      track: { key: "b.mp3", mediaType: MediaType.AUDIO, alt: "our song" },
    };

    expect(collectMediaRefs(data)).toEqual([
      { key: "a.jpg", mediaType: MediaType.IMAGE },
      { key: "b.mp3", mediaType: MediaType.AUDIO, alt: "our song" },
    ]);
  });

  it("deduplicates by key, keeping the first ref", () => {
    const data = {
      a: { key: "same.jpg", mediaType: MediaType.IMAGE, alt: "first" },
      b: [{ key: "same.jpg", mediaType: MediaType.IMAGE, alt: "second" }],
    };

    expect(collectMediaRefs(data)).toEqual([
      { key: "same.jpg", mediaType: MediaType.IMAGE, alt: "first" },
    ]);
  });
});

describe("resolveMediaRefs", () => {
  it("adds a url to every ref while preserving the surrounding shape", () => {
    const data = {
      title: "Hero",
      background: { mediaType: MediaType.IMAGE, key: "a.jpg", alt: "backdrop" },
      images: [{ mediaType: MediaType.IMAGE, key: "b.jpg" }],
    };

    expect(resolveMediaRefs(data, url)).toEqual({
      title: "Hero",
      background: {
        mediaType: MediaType.IMAGE,
        key: "a.jpg",
        alt: "backdrop",
        url: "https://cdn.test/a.jpg",
      },
      images: [
        {
          mediaType: MediaType.IMAGE,
          key: "b.jpg",
          url: "https://cdn.test/b.jpg",
        },
      ],
    });
  });

  it("passes a null url through when the key cannot be resolved", () => {
    const resolved = resolveMediaRefs(
      { background: { mediaType: MediaType.IMAGE, key: "a.jpg" } },
      () => null,
    );

    expect(resolved).toEqual({
      background: { mediaType: MediaType.IMAGE, key: "a.jpg", url: null },
    });
  });

  it("skips a payload with malformed media refs", () => {
    const first = resolveMediaRefs(
      { background: { mediaType: "gif", key: "a.jpg" } },
      url,
    );
    const second = resolveMediaRefs({ background: { key: "a.jpg" } }, url);

    expect(first).toEqual({ background: { mediaType: "gif", key: "a.jpg" } });
    expect(second).toEqual({ background: { key: "a.jpg" } });
  });

  it("does not mutate the input payload", () => {
    const background: MediaRef = { key: "a.jpg" };
    const data = { background };

    resolveMediaRefs(data, url);

    expect(background).toEqual({ key: "a.jpg" });
    expect(data.background).toBe(background);
  });

  it("leaves payloads without media untouched", () => {
    const data = { label: "Countdown", targetDate: "2026-08-16T10:00:00.000Z" };

    expect(resolveMediaRefs(data, url)).toEqual(data);
  });
});
