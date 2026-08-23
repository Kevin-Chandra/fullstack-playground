import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { SectionType } from "../libs/entity/enums/section-type.enum";
import {
  PagePublication,
  PublishedSection,
} from "../libs/entity/page-publication.entity";
import { PageSectionService } from "../page-section/page-section.service";
import { PageMediaService } from "../page/page-media.service";
import { PageService } from "../page/page.service";
import { StorageService } from "../storage/storage.service";
import { UserService } from "../user/user.service";
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
  publishedBy?: { id: number; name: string };
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
  let prune: jest.Mock;
  let replaceAllSections: jest.Mock;

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
    prune = jest.fn().mockResolvedValue(undefined);
    replaceAllSections = jest.fn().mockResolvedValue(undefined);

    const forPage = () =>
      [...rows]
        .filter((row) => row.pageId === HOME)
        .sort((a, b) => b.id - a.id);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagePublicationService,
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
          provide: PageSectionService,
          useValue: {
            projectToSnapshot: jest.fn(() => Promise.resolve(draft)),
            replaceAllSections,
          },
        },
        { provide: PageMediaService, useValue: { pruneUnreferenced: prune } },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn((id: number) =>
              Promise.resolve({ id, name: `User ${id}` }),
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

    /**
     * Publishing has no media side effects. Because snapshots are kept forever,
     * anything a publication references stays referenced — draft edits and
     * discard are the only paths that collect storage.
     */
    it("does not prune media", async () => {
      publish([
        section(SectionType.GALLERY, {
          data: {
            images: [{ mediaType: MediaType.IMAGE, key: "old.jpg" }],
          },
        }),
      ]);
      draft = [section(SectionType.HERO, { data: { title: "newest" } })];

      await service.publish("home", body("newest"), AUTHOR);

      expect(prune).not.toHaveBeenCalled();
    });
  });

  describe("discard", () => {
    it("restores the draft from the live snapshot", async () => {
      const sections = [
        section(SectionType.HERO),
        section(SectionType.GALLERY, { sortOrder: 1, isVisible: false }),
      ];
      publish(sections);
      draft = [section(SectionType.COUPLE)];

      await service.discard("home");

      expect(replaceAllSections).toHaveBeenCalledWith(HOME, sections);
    });

    it("empties the draft when nothing has been published", async () => {
      draft = [section(SectionType.HERO)];

      await service.discard("home");

      expect(replaceAllSections).toHaveBeenCalledWith(HOME, []);
    });

    it("offers images that only ever existed in the draft for collection", async () => {
      publish([section(SectionType.HERO)]);
      draft = [
        section(SectionType.GALLERY, {
          data: {
            images: [
              { mediaType: MediaType.IMAGE, key: "never-published.jpg" },
            ],
          },
        }),
      ];

      await service.discard("home");

      expect(prune).toHaveBeenCalledWith(["never-published.jpg"]);
    });

    it("returns the restored page in public shape", async () => {
      publish([section(SectionType.HERO)]);

      await expect(service.discard("home")).resolves.toEqual([
        { type: SectionType.HERO, sortOrder: 0, data: {} },
      ]);
    });
  });

  describe("listPublications", () => {
    it("lists newest first, without the payloads", async () => {
      publish([section(SectionType.HERO)]);
      publish([section(SectionType.HERO), section(SectionType.GALLERY)]);

      const history = await service.listPublications("home");

      expect(history.map((entry) => entry.version)).toEqual([2, 1]);
      expect(history[0]).not.toHaveProperty("sections");
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
});
