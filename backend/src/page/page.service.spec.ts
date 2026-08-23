import { Logger, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { Page } from "../libs/entity/page.entity";
import { PageService } from "./page.service";

describe("PageService", () => {
  let service: PageService;
  let rows: { id: number; slug: string; name: string }[];
  let save: jest.Mock;

  beforeEach(async () => {
    rows = [];
    save = jest.fn((page: { slug: string; name: string }) => {
      const row = { id: rows.length + 1, ...page };
      rows.push(row);

      return Promise.resolve(row);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageService,
        {
          provide: getRepositoryToken(Page),
          useValue: {
            find: jest.fn(() => Promise.resolve(rows)),
            findOneBy: jest.fn(({ slug }: { slug: string }) =>
              Promise.resolve(rows.find((row) => row.slug === slug) ?? null),
            ),
            create: jest.fn((page: unknown) => page),
            save,
          },
        },
      ],
    }).compile();

    service = module.get<PageService>(PageService);
  });

  it("seeds the home page on first boot", async () => {
    await service.onModuleInit();

    expect(rows).toEqual([{ id: 1, slug: "home", name: "Home" }]);
  });

  it("is idempotent across restarts", async () => {
    await service.onModuleInit();
    await service.onModuleInit();

    expect(save).toHaveBeenCalledTimes(1);
  });

  /**
   * In production `synchronize` is off and the table may not exist yet. That is
   * a deployment problem, not a reason to refuse to boot.
   */
  it("does not take the app down when seeding fails", async () => {
    // Expected on this path — silenced so it does not read as a real failure.
    const logged = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => undefined);
    save.mockRejectedValueOnce(new Error('relation "pages" does not exist'));

    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(logged).toHaveBeenCalled();

    logged.mockRestore();
  });

  it("resolves a page by slug", async () => {
    await service.onModuleInit();

    await expect(service.findBySlugOrFail("home")).resolves.toMatchObject({
      slug: "home",
    });
  });

  it("404s on an unknown slug", async () => {
    const missing = service.findBySlugOrFail("nope");

    await expect(missing).rejects.toBeInstanceOf(NotFoundException);
    await expect(missing).rejects.toMatchObject({
      response: { error: errorCodeConstants.PAGE_NOT_FOUND },
    });
  });
});
