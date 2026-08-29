import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerGuard } from "@nestjs/throttler";
import { JwtGuard } from "../guards/jwt.guard";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { MediaUploadPath } from "../libs/entity/enums/media-upload-path";
import { isPublicRoute } from "../libs/testing/is-public-route";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { RouteParamtypes } from "@nestjs/common/enums/route-paramtypes.enum";
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

    routes.forEach((route) =>
      expect(isPublicRoute(MediaController, route)).toBe(false),
    );
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

  it("hands the key to delete to the service", () => {
    void controller.delete({ key: "page/home/images/abc.jpg" });

    expect(service.delete).toHaveBeenCalledWith("page/home/images/abc.jpg");
  });

  /**
   * Delegation alone cannot catch this: an undecorated parameter is simply
   * never bound, so the handler runs with `key` undefined, `remove` returns on
   * its falsy guard, and the caller is told the object was deleted. The
   * binding metadata is the only place that shows up.
   */
  it("binds the delete key from the query string", () => {
    const bindings = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      MediaController,
      "delete",
    ) as Record<string, { index: number }>;

    expect(Object.keys(bindings)).toEqual([`${RouteParamtypes.QUERY}:0`]);
  });
});
