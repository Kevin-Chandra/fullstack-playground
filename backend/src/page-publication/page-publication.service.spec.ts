/**
 * `paginate` talks to a real query builder, so the call is captured instead:
 * what matters here is the config the service asks for — the sort, the page
 * scope, and the columns left out.
 */
jest.mock("nestjs-paginate", () => ({
  ...jest.requireActual<Record<string, unknown>>("nestjs-paginate"),
  paginate: jest.fn(),
}));

import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { SectionType } from "../libs/entity/enums/section-type.enum";
import {
  PagePublication,
  PublishedSection,
} from "../libs/entity/page-publication.entity";
import { PageConfigsService } from "../page-configs/page-configs.service";
import { PageService } from "../page/page.service";
import { StorageService } from "../storage/storage.service";
import { User } from "../libs/entity/user.entity";
import type { PaginateConfig, PaginateQuery } from "nestjs-paginate";
import { paginate } from "nestjs-paginate";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { PagePublicationService } from "./page-publication.service";

const HOME = 1;

const AUTHOR = 7;

type Row = {
  id: number;
  pageId: number;
  version: number;
  description: string;
  sections: PublishedSection[];
  publishedAt: Date;
  publishedBy?: { id: number; name?: string } | null;
};

/** Just enough of TypeORM's builder for `listPublications`. */
type QueryBuilderStub = {
  leftJoin: () => QueryBuilderStub;
  select: () => QueryBuilderStub;
  where: () => QueryBuilderStub;
  orderBy: () => QueryBuilderStub;
  getMany: () => Promise<Omit<Row, "sections">[]>;
};

const section = (
  type: SectionType,
  overrides: Partial<PublishedSection> = {},
): PublishedSection => ({
  type,
  sortOrder: 0,
  isVisible: true,
  data: {},
  ...overrides,
});

const body = (description: string): CreatePublicationDto => ({ description });

describe("PagePublicationService", () => {
  let service: PagePublicationService;
  let rows: Row[];
  let nextId: number;
  let draft: PublishedSection[];
  let replaceAllSections: jest.Mock;
  /** Page rows locked, in order, so the lock can be asserted on. */
  let lockedPages: { id?: number; mode: string }[];
  /** "lock" | "read" | "write", in the order the service did them. */
  let lockOrder: string[];
  let transaction: jest.Mock;
  let committedInsideTransaction: boolean;
  /** Ids whose account has been deleted while a token still names them. */
  let deletedUsers: number[];
  let paginated: { data: unknown[]; meta: { totalPages: number } };
  let paginateConfig: PaginateConfig<PagePublication>;

  const publish = (sections: PublishedSection[]): Row => {
    const id = nextId++;
    const row: Row = {
      id,
      pageId: HOME,
      version: id,
      description: `v${id}`,
      sections,
      // An hour apart, so ordering by `publishedAt` is actually decidable.
      publishedAt: new Date(Date.UTC(2026, 0, 1) + id * 3_600_000),
    };
    rows.push(row);

    return row;
  };

  beforeEach(async () => {
    rows = [];
    nextId = 1;
    draft = [];
    replaceAllSections = jest.fn().mockResolvedValue(undefined);

    const forPage = () =>
      [...rows]
        .filter((row) => row.pageId === HOME)
        .sort((a, b) => b.id - a.id);

    lockedPages = [];
    lockOrder = [];
    deletedUsers = [];
    paginated = { data: [{ id: 1, version: 1 }], meta: { totalPages: 1 } };
    (paginate as jest.Mock).mockImplementation(
      (
        _query: PaginateQuery,
        _repository: unknown,
        config: PaginateConfig<PagePublication>,
      ) => {
        paginateConfig = config;

        return Promise.resolve(paginated);
      },
    );
    committedInsideTransaction = false;
    let insideTransaction = false;

    const manager = {
      findOne: jest.fn(
        (
          entity: unknown,
          options: { where: { id?: number }; lock?: { mode: string } },
        ) => {
          if (entity === PagePublication) {
            lockOrder.push("read");

            return Promise.resolve(forPage()[0] ?? null);
          }

          if (entity === User) {
            return Promise.resolve(
              deletedUsers.includes(options.where.id)
                ? null
                : { id: options.where.id },
            );
          }

          // The page row, taken as a lock; only the lock itself matters here.
          lockOrder.push("lock");
          lockedPages.push({ id: options.where.id, mode: options.lock.mode });

          return Promise.resolve({ id: options.where.id });
        },
      ),
      create: jest.fn((_entity: unknown, row: Partial<Row>) => ({ ...row })),
      save: jest.fn((row: Partial<Row>) => {
        lockOrder.push("write");
        committedInsideTransaction = insideTransaction;
        const saved = {
          ...row,
          id: nextId++,
          publishedAt: new Date("2026-06-01T00:00:00.000Z"),
        } as Row;
        rows.push(saved);

        return Promise.resolve(saved);
      }),
    };

    transaction = jest.fn(async (work: (m: unknown) => Promise<unknown>) => {
      insideTransaction = true;
      try {
        return await work(manager);
      } finally {
        insideTransaction = false;
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagePublicationService,
        { provide: DataSource, useValue: { transaction } },
        {
          provide: getRepositoryToken(PagePublication),
          useValue: {
            find: jest.fn(() => Promise.resolve(forPage())),
            findOne: jest.fn(() => Promise.resolve(forPage()[0] ?? null)),
            findOneBy: jest.fn(
              ({ id, pageId }: { id: number; pageId: number }) =>
                Promise.resolve(
                  rows.find((row) => row.id === id && row.pageId === pageId) ??
                    null,
                ),
            ),
            create: jest.fn((row: Partial<Row>) => ({ ...row })),
            save: jest.fn((row: Partial<Row>) => {
              const saved = {
                ...row,
                id: nextId++,
                publishedAt: new Date("2026-06-01T00:00:00.000Z"),
              } as Row;
              rows.push(saved);

              return Promise.resolve(saved);
            }),
            createQueryBuilder: jest.fn(() => {
              const builder: QueryBuilderStub = {
                leftJoin: () => builder,
                select: () => builder,
                where: () => builder,
                orderBy: () => builder,
                getMany: () =>
                  Promise.resolve(
                    forPage()
                      .sort(
                        (a, b) =>
                          b.publishedAt.getTime() - a.publishedAt.getTime(),
                      )
                      // `select` leaves the payload behind: this is a list view.
                      .map(({ sections: _sections, ...entry }) => entry),
                  ),
              };

              return builder;
            }),
            delete: jest.fn((ids: number[]) => {
              rows = rows.filter((row) => !ids.includes(row.id));

              return Promise.resolve({ affected: ids.length });
            }),
          },
        },
        {
          provide: PageService,
          useValue: {
            findBySlugOrFail: jest.fn((slug: string) =>
              slug === "home"
                ? Promise.resolve({ id: HOME })
                : Promise.reject(new NotFoundException("Page not found.")),
            ),
          },
        },
        {
          provide: PageConfigsService,
          useValue: {
            projectToSnapshot: jest.fn(() => Promise.resolve(draft)),
            replaceAllSections,
          },
        },
        {
          provide: StorageService,
          useValue: {
            getPublicUrl: (key: string) =>
              key ? `https://cdn.test/${key}` : null,
          },
        },
      ],
    }).compile();

    service = module.get<PagePublicationService>(PagePublicationService);
  });

  describe("findLive", () => {
    it("is empty until the first publish, even with a draft in place", async () => {
      draft = [section(SectionType.HERO)];

      await expect(service.findLive("home")).resolves.toEqual([]);
    });

    it("serves the newest publication", async () => {
      publish([section(SectionType.HERO)]);
      publish([section(SectionType.GALLERY)]);

      const live = await service.findLive("home");

      expect(live.map((entry) => entry.type)).toEqual([SectionType.GALLERY]);
    });

    it("hides sections marked hidden and renumbers what remains", async () => {
      publish([
        section(SectionType.HERO, { sortOrder: 0 }),
        section(SectionType.COUNTDOWN, { sortOrder: 1, isVisible: false }),
        section(SectionType.GALLERY, { sortOrder: 2 }),
      ]);

      const live = await service.findLive("home");

      expect(live).toEqual([
        { type: SectionType.HERO, sortOrder: 0, data: {} },
        { type: SectionType.GALLERY, sortOrder: 1, data: {} },
      ]);
    });

    it("resolves media urls from the snapshot's raw keys", async () => {
      publish([
        section(SectionType.HERO, {
          data: { background: { mediaType: MediaType.IMAGE, key: "a.jpg" } },
        }),
      ]);

      const [hero] = await service.findLive("home");

      expect(hero.data).toEqual({
        background: {
          mediaType: MediaType.IMAGE,
          key: "a.jpg",
          url: "https://cdn.test/a.jpg",
        },
      });
    });

    it("404s on an unknown page", async () => {
      await expect(service.findLive("nope")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("preview", () => {
    it("shows the draft in exactly the shape the live page uses", async () => {
      publish([section(SectionType.HERO)]);
      draft = [
        section(SectionType.GALLERY, { sortOrder: 0 }),
        section(SectionType.COUPLE, { sortOrder: 1, isVisible: false }),
      ];

      await expect(service.preview("home")).resolves.toEqual([
        { type: SectionType.GALLERY, sortOrder: 0, data: {} },
      ]);
    });
  });

  describe("publish", () => {
    it("snapshots the draft, hidden sections included", async () => {
      draft = [
        section(SectionType.HERO, { sortOrder: 0 }),
        section(SectionType.GALLERY, { sortOrder: 1, isVisible: false }),
      ];

      const published = await service.publish("home", body("Launch"), AUTHOR);

      expect(published.sections).toHaveLength(2);
      expect(published.publishedBy).toMatchObject({ id: AUTHOR });
      expect(rows[0].sections.map((entry) => entry.isVisible)).toEqual([
        true,
        false,
      ]);
    });

    it("rejects a publish that would change nothing", async () => {
      publish([section(SectionType.HERO)]);
      draft = [section(SectionType.HERO)];

      const unchanged = service.publish("home", body("No-op"), AUTHOR);

      await expect(unchanged).rejects.toBeInstanceOf(ConflictException);
      await expect(unchanged).rejects.toMatchObject({
        response: { error: errorCodeConstants.NO_UNPUBLISHED_CHANGES },
      });
    });

    it("allows publishing a deliberately emptied page", async () => {
      publish([section(SectionType.HERO)]);
      draft = [];

      await expect(
        service.publish("home", body("Emptied"), AUTHOR),
      ).resolves.toMatchObject({ sections: [] });
    });

    /** History is never trimmed, so publishing keeps every earlier snapshot. */
    it("retains every previous publication", async () => {
      for (let i = 0; i < 25; i++) {
        publish([section(SectionType.HERO, { data: { title: `v${i}` } })]);
      }
      draft = [section(SectionType.HERO, { data: { title: "newest" } })];

      await service.publish("home", body("newest"), AUTHOR);

      expect(rows).toHaveLength(26);
      expect(rows.map((row) => row.id)).toContain(1);
    });
  });

  describe("listPublications", () => {
    const query = { path: "/page/home/publications" } as PaginateQuery;

    it("returns a paginated page rather than the whole history", async () => {
      publish([section(SectionType.HERO)]);

      const history = await service.listPublications("home", query);

      expect(history.data).toEqual(paginated.data);
      expect(history.meta).toBe(paginated.meta);
    });

    /**
     * `findNewest` decides what is live by id, so the history has to agree:
     * two publications a millisecond apart tie on `publishedAt`, and sorting
     * by it could head the list with a row that is not the one being served.
     */
    it("sorts by id, matching how the live publication is chosen", async () => {
      publish([section(SectionType.HERO)]);

      await service.listPublications("home", query);

      expect(paginateConfig.defaultSortBy).toEqual([["id", "DESC"]]);
      expect(paginateConfig.where).toEqual({ pageId: HOME });
    });

    it("leaves the payloads out of the list", async () => {
      publish([section(SectionType.HERO)]);

      await service.listPublications("home", query);

      expect(paginateConfig.select).not.toContain("sections");
    });
  });

  describe("rollback", () => {
    it("appends a copy of the chosen snapshot rather than mutating history", async () => {
      const first = publish([section(SectionType.HERO)]);
      publish([section(SectionType.GALLERY)]);

      const restored = await service.rollback("home", first.id, AUTHOR);

      expect(rows).toHaveLength(3);
      expect(restored.id).not.toBe(first.id);
      await expect(service.findLive("home")).resolves.toEqual([
        { type: SectionType.HERO, sortOrder: 0, data: {} },
      ]);
    });

    /**
     * Rollback changes what visitors see, never the editor's work in progress.
     */
    it("leaves the draft alone", async () => {
      const first = publish([section(SectionType.HERO)]);
      publish([section(SectionType.GALLERY)]);
      draft = [section(SectionType.COUPLE)];

      await service.rollback("home", first.id, AUTHOR);

      expect(replaceAllSections).not.toHaveBeenCalled();
      await expect(service.preview("home")).resolves.toEqual([
        { type: SectionType.COUPLE, sortOrder: 0, data: {} },
      ]);
    });

    it("404s on a publication that does not exist", async () => {
      const missing = service.rollback("home", 999, AUTHOR);

      await expect(missing).rejects.toBeInstanceOf(NotFoundException);
      await expect(missing).rejects.toMatchObject({
        response: { error: errorCodeConstants.PUBLICATION_NOT_FOUND },
      });
    });

    it("refuses to roll a page back to another page's publication", async () => {
      const foreign: Row = {
        id: nextId++,
        pageId: 99,
        version: 1,
        description: "another page",
        sections: [section(SectionType.HERO)],
        publishedAt: new Date("2026-01-01T00:00:00.000Z"),
      };
      rows.push(foreign);

      await expect(
        service.rollback("home", foreign.id, AUTHOR),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("publicationPreview", () => {
    it("returns the snapshot in public shape", async () => {
      const published = publish([section(SectionType.HERO)]);

      await expect(
        service.publicationPreview("home", published.id),
      ).resolves.toEqual([{ type: SectionType.HERO, sortOrder: 0, data: {} }]);
    });

    /**
     * The slug in the URL has to mean something: without the `pageId` filter
     * any id is readable through any slug, so one page's unreleased content
     * leaks through another's.
     */
    it("refuses to serve another page's publication through this slug", async () => {
      const foreign: Row = {
        id: nextId++,
        pageId: 99,
        version: 1,
        description: "another page",
        sections: [section(SectionType.HERO)],
        publishedAt: new Date("2026-01-01T00:00:00.000Z"),
      };
      rows.push(foreign);

      await expect(
        service.publicationPreview("home", foreign.id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    /** The frontend maps this code to a real message; a bare 404 gets the generic one. */
    it("names the error code the frontend maps", async () => {
      await expect(
        service.publicationPreview("home", 404),
      ).rejects.toMatchObject({
        response: { error: errorCodeConstants.PUBLICATION_NOT_FOUND },
      });
    });
  });

  describe("version numbering", () => {
    it("numbers a first publication 1, then counts up", async () => {
      draft = [section(SectionType.HERO, { data: { title: "one" } })];
      await service.publish("home", body("one"), AUTHOR);
      draft = [section(SectionType.HERO, { data: { title: "two" } })];
      await service.publish("home", body("two"), AUTHOR);

      expect(rows.map((row) => row.version)).toEqual([1, 2]);
    });

    /**
     * Rollback used to number from the snapshot it copied, so rolling back to
     * v1 while v3 was live produced a second v2 — and every later publish
     * counted up from the duplicate.
     */
    it("numbers a rollback from the newest publication, not the one it copies", async () => {
      const first = publish([section(SectionType.HERO)]);
      publish([section(SectionType.GALLERY)]);
      publish([section(SectionType.COUPLE)]);

      await service.rollback("home", first.id, AUTHOR);

      const versions = rows.map((row) => row.version);
      expect(versions).toEqual([1, 2, 3, 4]);
      expect(new Set(versions).size).toBe(versions.length);
    });

    it("keeps counting up after a rollback", async () => {
      const first = publish([section(SectionType.HERO)]);
      publish([section(SectionType.GALLERY)]);
      await service.rollback("home", first.id, AUTHOR);

      draft = [section(SectionType.COUPLE)];
      await service.publish("home", body("after rollback"), AUTHOR);

      expect(rows.map((row) => row.version)).toEqual([1, 2, 3, 4]);
    });

    /** Versions are per page, so another page's history cannot shift them. */
    it("counts within one page", async () => {
      rows.push({
        id: nextId++,
        pageId: 99,
        version: 41,
        description: "another page",
        sections: [section(SectionType.HERO)],
        publishedAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      draft = [section(SectionType.HERO)];
      await service.publish("home", body("first here"), AUTHOR);

      expect(rows.find((row) => row.pageId === HOME).version).toBe(1);
    });
  });

  describe("concurrency", () => {
    /**
     * Publishing is a read-then-insert, so it is only correct while nobody
     * else is publishing the same page. Without the lock two requests both
     * read the same newest version and both write it.
     */
    it("takes the page lock before deciding anything", async () => {
      draft = [section(SectionType.HERO)];

      await service.publish("home", body("first"), AUTHOR);

      const lockedPageFirst = lockedPages[0];
      expect(lockedPageFirst).toEqual({ id: HOME, mode: "pessimistic_write" });
      // Nothing may be read or written before the lock is held.
      expect(lockOrder[0]).toBe("lock");
    });

    it("takes the same lock on rollback", async () => {
      const first = publish([section(SectionType.HERO)]);
      publish([section(SectionType.GALLERY)]);
      lockedPages.length = 0;

      await service.rollback("home", first.id, AUTHOR);

      expect(lockedPages).toEqual([{ id: HOME, mode: "pessimistic_write" }]);
    });

    it("writes the publication inside the transaction it locked in", async () => {
      draft = [section(SectionType.HERO)];

      await service.publish("home", body("first"), AUTHOR);

      expect(transaction).toHaveBeenCalledTimes(1);
      expect(committedInsideTransaction).toBe(true);
    });
  });

  describe("authorship", () => {
    it("credits the publishing user", async () => {
      draft = [section(SectionType.HERO)];

      await service.publish("home", body("first"), AUTHOR);

      expect(rows[0].publishedBy).toEqual({ id: AUTHOR });
    });

    /**
     * Access tokens outlive the account they name, so a deleted user can still
     * present a valid one. `publishedBy` is nullable exactly so a publication
     * can outlive its author — losing the snapshot to a 404 about a *user* is
     * the wrong trade.
     */
    it("records a null author rather than failing when the account is gone", async () => {
      deletedUsers = [AUTHOR];
      draft = [section(SectionType.HERO)];

      await service.publish("home", body("first"), AUTHOR);

      expect(rows).toHaveLength(1);
      expect(rows[0].publishedBy).toBeNull();
    });

    it("does not fail a rollback for a deleted author either", async () => {
      const first = publish([section(SectionType.HERO)]);
      publish([section(SectionType.GALLERY)]);
      deletedUsers = [AUTHOR];

      await service.rollback("home", first.id, AUTHOR);

      expect(rows).toHaveLength(3);
      expect(rows[2].publishedBy).toBeNull();
    });
  });
});
