import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerGuard } from "@nestjs/throttler";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { JwtGuard } from "../guards/jwt.guard";
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
      discard: jest.fn(),
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
    const isPublicRoute = (route: keyof PagePublicationController): boolean => {
      const handler = Object.getOwnPropertyDescriptor(
        PagePublicationController.prototype,
        route,
      ).value as (...args: never[]) => unknown;

      return new Reflector().get<boolean>(IS_PUBLIC_KEY, handler);
    };

    it("leaves the live page open to visitors", () => {
      expect(isPublicRoute("findLive")).toBe(true);
    });

    it("keeps preview and every publishing action authenticated", () => {
      const guarded: (keyof PagePublicationController)[] = [
        "preview",
        "publicationPreview",
        "publish",
        "discard",
        "listPublications",
        "rollback",
      ];

      guarded.forEach((route) => expect(isPublicRoute(route)).toBeUndefined());
    });
  });

  it("passes the slug through to each read", () => {
    void controller.findLive("home");
    void controller.preview("home");
    void controller.listPublications("home");

    expect(service.findLive).toHaveBeenCalledWith("home");
    expect(service.preview).toHaveBeenCalledWith("home");
    expect(service.listPublications).toHaveBeenCalledWith("home");
  });

  it("records who published, as a number", () => {
    const body: CreatePublicationDto = { description: "Initial launch" };

    void controller.publish("home", "42", body);

    expect(service.publish).toHaveBeenCalledWith("home", body, 42);
  });

  it("converts the publication id on preview", () => {
    void controller.publicationPreview("7");

    expect(service.publicationPreview).toHaveBeenCalledWith(7);
  });

  it("converts the publication id on rollback", () => {
    void controller.rollback("home", "7", "42");

    expect(service.rollback).toHaveBeenCalledWith("home", 7, 42);
  });

  it("discards without needing a user", () => {
    void controller.discard("home");

    expect(service.discard).toHaveBeenCalledWith("home");
  });
});
