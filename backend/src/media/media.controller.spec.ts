import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerGuard } from "@nestjs/throttler";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { JwtGuard } from "../guards/jwt.guard";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";

const allow = { canActivate: () => true };

describe("MediaController", () => {
  let controller: MediaController;
  let service: jest.Mocked<Partial<MediaService>>;

  beforeEach(async () => {
    service = { upload: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [{ provide: MediaService, useValue: service }],
    })
      .overrideGuard(JwtGuard)
      .useValue(allow)
      .overrideGuard(ThrottlerGuard)
      .useValue(allow)
      .compile();

    controller = module.get<MediaController>(MediaController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("keeps uploading behind authentication", () => {
    const handler = Object.getOwnPropertyDescriptor(
      MediaController.prototype,
      "upload",
    ).value as (...args: never[]) => unknown;

    expect(
      new Reflector().get<boolean>(IS_PUBLIC_KEY, handler),
    ).toBeUndefined();
  });

  it("hands the uploaded file to the service", () => {
    const file = { originalname: "photo.jpg" } as Express.Multer.File;

    void controller.upload(file);

    expect(service.upload).toHaveBeenCalledWith(file);
  });
});
