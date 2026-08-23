import { Test, TestingModule } from "@nestjs/testing";
import {
  StoragePrefixes,
  StorageTypePath,
} from "../libs/constants/file.constants";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { MediaUploadPath } from "../libs/entity/enums/media-upload-path";
import { StorageService } from "../storage/storage.service";
import { MediaService } from "./media.service";

describe("MediaService", () => {
  let service: MediaService;
  let upload: jest.Mock;
  const mockDto = {
    mediaType: MediaType.AUDIO,
    mediaUploadPath: MediaUploadPath.HOME,
  };

  beforeEach(async () => {
    upload = jest.fn().mockResolvedValue("page/home/images/abc.jpg");

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: StorageService,
          useValue: {
            upload,
            getPublicUrl: (key: string) => `https://cdn.test/${key}`,
          },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it("uploads under the home page prefix", async () => {
    const file = { buffer: Buffer.from("") } as Express.Multer.File;

    await service.upload(file, mockDto);

    expect(upload).toHaveBeenCalledWith(
      file,
      `${StoragePrefixes.HOME_PAGE}${StorageTypePath.AUDIO}`,
    );
  });

  it("returns the key to persist alongside a url to preview", async () => {
    const result = await service.upload({} as Express.Multer.File, mockDto);

    expect(result).toEqual({
      key: "page/home/images/abc.jpg",
      url: "https://cdn.test/page/home/images/abc.jpg",
    });
  });
});
