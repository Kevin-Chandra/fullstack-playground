import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, FindOperator } from "typeorm";
import { MediaCollection } from "../libs/constants/file.constants";
import { Media } from "../libs/entity/media.entity";
import { StorageService } from "../storage/storage.service";
import { PageMediaService } from "./page-media.service";

const GRACE_MS = MediaCollection.UPLOAD_GRACE_MS;

type MediaRow = {
  id: number;
  key: string;
  deletedFromStorageAt: Date | null;
  createdAt: Date;
};

/** Unwraps whatever TypeORM put in a `where`, `In(...)`/`LessThan(...)` and all. */
const unwrap = (value: unknown): unknown =>
  value instanceof FindOperator ? value.value : value;

describe("PageMediaService", () => {
  let service: PageMediaService;
  let removeObject: jest.Mock;
  /** Keys a draft section or a retained publication still points at. */
  let referencedKeys: string[];
  let referenceQuery: jest.Mock;
  let media: MediaRow[];
  let nextId: number;

  /**
   * Records an upload the way `MediaService.upload` would. Ages old enough to
   * be past the grace window by default — the interesting case is a key that
   * has been sitting around, not one uploaded a second ago.
   */
  const record = (key: string, ageMs = 2 * GRACE_MS): MediaRow => {
    const row: MediaRow = {
      id: nextId++,
      key,
      deletedFromStorageAt: null,
      createdAt: new Date(Date.now() - ageMs),
    };
    media.push(row);

    return row;
  };

  const matchMedia = (where: Record<string, unknown> = {}): MediaRow[] => {
    const wanted = unwrap(where.key);
    const keys = Array.isArray(wanted) ? (wanted as string[]) : [wanted];
    const olderThan = where.createdAt ? unwrap(where.createdAt) : undefined;

    return media.filter((row) => {
      if (where.key !== undefined && !keys.includes(row.key)) return false;
      // `deletedFromStorageAt: IsNull()` is the only form used, so its presence is the
      // predicate.
      if (
        where.deletedFromStorageAt !== undefined &&
        row.deletedFromStorageAt !== null
      )
        return false;
      if (olderThan instanceof Date && row.createdAt >= olderThan) return false;

      return true;
    });
  };

  beforeEach(async () => {
    removeObject = jest.fn().mockResolvedValue(undefined);
    referencedKeys = [];
    media = [];
    nextId = 1;

    // Stands in for the jsonpath lookup, whose predicate is verified against a
    // real Postgres rather than reimplemented here.
    referenceQuery = jest.fn((_sql: string, params: [string[]]) =>
      Promise.resolve(
        params[0]
          .filter((key) => referencedKeys.includes(key))
          .map((key) => ({ key })),
      ),
    );

    const manager = {
      find: jest.fn(
        (_entity: unknown, options: { where?: Record<string, unknown> } = {}) =>
          Promise.resolve(matchMedia(options.where)),
      ),
      query: referenceQuery,
      update: jest.fn(
        (
          _entity: unknown,
          ids: number[],
          patch: { deletedFromStorageAt: Date },
        ): Promise<void> => {
          media
            .filter((row) => ids.includes(row.id))
            .forEach(
              (row) => (row.deletedFromStorageAt = patch.deletedFromStorageAt),
            );

          return Promise.resolve();
        },
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageMediaService,
        {
          provide: getRepositoryToken(Media),
          useValue: {
            find: jest.fn((options: { where?: Record<string, unknown> } = {}) =>
              Promise.resolve(matchMedia(options.where)),
            ),
          },
        },
        {
          provide: StorageService,
          useValue: { remove: removeObject },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((work: (m: unknown) => unknown) =>
              work(manager),
            ),
            query: jest.fn(() => Promise.resolve(undefined)),
          },
        },
      ],
    }).compile();

    service = module.get<PageMediaService>(PageMediaService);
  });

  it("deletes an object nothing references", async () => {
    record("orphan.jpg");

    await service.pruneUnreferenced(["orphan.jpg"]);

    expect(removeObject).toHaveBeenCalledWith("orphan.jpg");
  });

  it("keeps an object a draft section still references", async () => {
    record("kept.jpg");
    referencedKeys = ["kept.jpg"];

    await service.pruneUnreferenced(["kept.jpg"]);

    expect(removeObject).not.toHaveBeenCalled();
  });

  /**
   * The reason this service exists. Removing an image from a draft must never
   * delete the file the live page is still serving.
   */
  it("keeps an object referenced only by a publication", async () => {
    record("live.jpg");
    referencedKeys = ["live.jpg"];

    await service.pruneUnreferenced(["live.jpg"]);

    expect(removeObject).not.toHaveBeenCalled();
  });

  /**
   * Nothing stops two pages sharing an object, so neither lookup may be scoped
   * to a page — collecting a key because *this* page dropped it would break the
   * other one.
   */
  it("looks for references across every page, not just the one being edited", async () => {
    record("shared.jpg");
    referencedKeys = ["shared.jpg"];

    await service.pruneUnreferenced(["shared.jpg"]);

    expect(removeObject).not.toHaveBeenCalled();
    // The lookup is asked about the candidate, unscoped by page.
    expect(referenceQuery).toHaveBeenCalledWith(expect.any(String), [
      ["shared.jpg"],
    ]);
  });

  it("deletes only the unreferenced keys out of a mixed batch", async () => {
    ["in-draft.jpg", "in-live.jpg", "orphan.jpg"].forEach((key) => record(key));
    referencedKeys = ["in-draft.jpg", "in-live.jpg"];

    await service.pruneUnreferenced([
      "in-draft.jpg",
      "in-live.jpg",
      "orphan.jpg",
    ]);

    expect(removeObject).toHaveBeenCalledTimes(1);
    expect(removeObject).toHaveBeenCalledWith("orphan.jpg");
  });

  it("does not read references when there is nothing to consider", async () => {
    await service.pruneUnreferenced([]);

    expect(referenceQuery).not.toHaveBeenCalled();
    expect(removeObject).not.toHaveBeenCalled();
  });

  /**
   * Uploads are recorded, so an object this service has no row for belongs to
   * something whose references it cannot see — a wish's photo, say. Guessing
   * there would delete another module's file.
   */
  it("leaves an object it has no record of alone", async () => {
    await service.pruneUnreferenced(["wish/images/guest-photo.jpg"]);

    expect(removeObject).not.toHaveBeenCalled();
  });

  /**
   * The case no candidate list could reach before uploads were recorded: an
   * image the editor uploaded, never placed in a section, and walked away from.
   */
  it("collects an upload that was never referenced by anything", async () => {
    record("abandoned.jpg");

    await service.pruneUnreferenced([]);

    expect(removeObject).toHaveBeenCalledWith("abandoned.jpg");
  });

  /** An upload in flight looks identical to an abandoned one, minus the age. */
  it("leaves a fresh upload alone", async () => {
    record("just-uploaded.jpg", 30_000);

    await service.pruneUnreferenced([]);

    expect(removeObject).not.toHaveBeenCalled();
  });

  it("does not collect the same object twice", async () => {
    record("orphan.jpg");

    await service.pruneUnreferenced(["orphan.jpg"]);
    removeObject.mockClear();
    await service.pruneUnreferenced(["orphan.jpg"]);

    expect(removeObject).not.toHaveBeenCalled();
  });

  /**
   * The tombstone has to be committed before the object goes away: it is what
   * stops a concurrent save storing a reference to a file that is being
   * deleted.
   */
  it("tombstones the row before removing the object", async () => {
    record("orphan.jpg");
    removeObject.mockImplementation((key: string) => {
      expect(
        media.find((row) => row.key === key).deletedFromStorageAt,
      ).toBeInstanceOf(Date);

      return Promise.resolve(undefined);
    });

    await service.pruneUnreferenced(["orphan.jpg"]);

    expect(removeObject).toHaveBeenCalledTimes(1);
  });

  describe("lockReferencedKeys", () => {
    const manager = () => ({
      find: jest.fn(
        (_entity: unknown, options: { where?: Record<string, unknown> }) =>
          Promise.resolve(matchMedia(options.where)),
      ),
    });

    it("reports a key whose object has already been collected", async () => {
      const deleted = record("gone.jpg");
      deleted.deletedFromStorageAt = new Date();
      record("here.jpg");

      await expect(
        service.lockReferencedKeys(manager() as never, [
          "gone.jpg",
          "here.jpg",
        ]),
      ).resolves.toEqual(["gone.jpg"]);
    });

    /** An unrecorded key belongs to another module, and is not ours to refuse. */
    it("says nothing about keys it has no record of", async () => {
      await expect(
        service.lockReferencedKeys(manager() as never, ["wish/images/a.jpg"]),
      ).resolves.toEqual([]);
    });
  });
});
