import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerGuard } from "@nestjs/throttler";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { JwtGuard } from "../guards/jwt.guard";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { MediaUploadPath } from "../libs/entity/enums/media-upload-path";
import { MediaUploadDto } from "./dto/media-upload.dto";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";

const allow = { canActivate: () => true };

describe("MediaController", () => {
  let controller: MediaController;
  let service: jest.Mocked<Partial<MediaService>>;

  beforeEach(async () => {
    service = { upload: jest.fn(), delete: jest.fn() };

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

  it("keeps every media route behind authentication", () => {
    const routes: (keyof MediaController)[] = ["upload", "delete"];

    routes.forEach((route) => {
      const handler = Object.getOwnPropertyDescriptor(
        MediaController.prototype,
        route,
      ).value as (...args: never[]) => unknown;

      expect(
        new Reflector().get<boolean>(IS_PUBLIC_KEY, handler),
      ).toBeUndefined();
    });
  });

  it("hands the uploaded file and its metadata to the service", () => {
    const file = { originalname: "photo.jpg" } as Express.Multer.File;
    const data: MediaUploadDto = {
      mediaUploadPath: MediaUploadPath.HOME,
      mediaType: MediaType.IMAGE,
    };

    void controller.upload(file, data);

    expect(service.upload).toHaveBeenCalledWith(file, data);
  });
});
