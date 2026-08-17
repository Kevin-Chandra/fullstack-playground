import { Test, TestingModule } from "@nestjs/testing";
import { StoragePrefixes } from "../libs/constants/file.constants";
import { StorageService } from "../storage/storage.service";
import { MediaService } from "./media.service";

describe("MediaService", () => {
  let service: MediaService;
  let upload: jest.Mock;

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

    await service.upload(file);

    expect(upload).toHaveBeenCalledWith(file, StoragePrefixes.HOME_PAGE_IMAGE);
  });

  it("returns the key to persist alongside a url to preview", async () => {
    const result = await service.upload({} as Express.Multer.File);

    expect(result).toEqual({
      key: "page/home/images/abc.jpg",
      url: "https://cdn.test/page/home/images/abc.jpg",
    });
  });
});
