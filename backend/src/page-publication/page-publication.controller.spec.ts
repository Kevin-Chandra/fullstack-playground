import type { PaginateQuery } from "nestjs-paginate";
import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerGuard } from "@nestjs/throttler";
import { JwtGuard } from "../guards/jwt.guard";
import { isPublicRoute } from "../libs/testing/is-public-route";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { PagePublicationController } from "./page-publication.controller";
import { PagePublicationService } from "./page-publication.service";

const allow = { canActivate: () => true };

describe("PagePublicationController", () => {
  let controller: PagePublicationController;
  let service: jest.Mocked<Partial<PagePublicationService>>;

  beforeEach(async () => {
    service = {
      findLive: jest.fn(),
      preview: jest.fn(),
      publicationPreview: jest.fn(),
      publish: jest.fn(),
      listPublications: jest.fn(),
      rollback: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagePublicationController],
      providers: [{ provide: PagePublicationService, useValue: service }],
    })
      .overrideGuard(JwtGuard)
      .useValue(allow)
      .overrideGuard(ThrottlerGuard)
      .useValue(allow)
      .compile();

    controller = module.get<PagePublicationController>(
      PagePublicationController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  /**
   * The controller is guarded class-wide, so routes are authenticated unless
   * they opt out. Getting this wrong either locks visitors out of the site or
   * exposes unpublished work, and neither shows up in a delegation test.
   */
  describe("access control", () => {
    it("leaves the live page open to visitors", () => {
      expect(isPublicRoute(PagePublicationController, "findLive")).toBe(true);
    });

    it("keeps preview and every publishing action authenticated", () => {
      const guarded: (keyof PagePublicationController)[] = [
        "preview",
        "publicationPreview",
        "publish",
        "listPublications",
        "rollback",
      ];

      guarded.forEach((route) =>
        expect(isPublicRoute(PagePublicationController, route)).toBe(false),
      );
    });
  });

  it("passes the slug through to each read", () => {
    const query = { path: "/page/home/publications" } as PaginateQuery;

    void controller.findLive("home");
    void controller.preview("home");
    void controller.listPublications("home", query);

    expect(service.findLive).toHaveBeenCalledWith("home");
    expect(service.preview).toHaveBeenCalledWith("home");
    expect(service.listPublications).toHaveBeenCalledWith("home", query);
  });

  it("records who published, as a number", () => {
    const body: CreatePublicationDto = { description: "Initial launch" };

    void controller.publish("home", "42", body);

    expect(service.publish).toHaveBeenCalledWith("home", body, 42);
  });

  /** The slug is what scopes the lookup, so it has to reach the service. */
  it("passes the slug alongside the publication id on preview", () => {
    void controller.publicationPreview("home", 7);

    expect(service.publicationPreview).toHaveBeenCalledWith("home", 7);
  });

  it("converts the user id on rollback", () => {
    void controller.rollback("home", 7, "42");

    expect(service.rollback).toHaveBeenCalledWith("home", 7, 42);
  });
});
