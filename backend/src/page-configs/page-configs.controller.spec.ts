import { Test, TestingModule } from "@nestjs/testing";
import { JwtGuard } from "../guards/jwt.guard";
import { SectionType } from "../libs/entity/enums/section-type.enum";
import { isPublicRoute } from "../libs/testing/is-public-route";
import { PageConfigsController } from "./page-configs.controller";
import { PageConfigsService } from "./page-configs.service";

const allow = { canActivate: () => true };

describe("PageConfigsController", () => {
  let controller: PageConfigsController;
  let service: jest.Mocked<Partial<PageConfigsService>>;

  beforeEach(async () => {
    service = {
      findDraft: jest.fn(),
      save: jest.fn(),
      discard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PageConfigsController],
      providers: [{ provide: PageConfigsService, useValue: service }],
    })
      .overrideGuard(JwtGuard)
      .useValue(allow)
      .compile();

    controller = module.get<PageConfigsController>(PageConfigsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  /** Nothing about a draft may ever be public — it is unreleased work. */
  it("keeps every draft route authenticated", () => {
    const routes: (keyof PageConfigsController)[] = [
      "findDraft",
      "save",
      "discard",
    ];

    routes.forEach((route) =>
      expect(isPublicRoute(PageConfigsController, route)).toBe(false),
    );
  });

  it("scopes reads and writes to the slug in the path", () => {
    const pageConfig = {
      draftVersion: 0,
      sections: [
        {
          uuid: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
          type: SectionType.HERO,
          data: { title: "Ada" },
          isVisible: true,
        },
      ],
    };

    void controller.findDraft("home");
    void controller.save("home", pageConfig);

    expect(service.findDraft).toHaveBeenCalledWith("home");
    expect(service.save).toHaveBeenCalledWith("home", pageConfig);
  });

  it("discards the slug's draft without needing a user", () => {
    void controller.discard("home");

    expect(service.discard).toHaveBeenCalledWith("home");
  });
});
