import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  StoragePrefixes,
  StorageTypePath,
} from "../libs/constants/file.constants";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { MediaUploadPath } from "../libs/entity/enums/media-upload-path";
import { Media } from "../libs/entity/media.entity";
import { StorageService } from "../storage/storage.service";
import { MediaService } from "./media.service";

describe("MediaService", () => {
  let service: MediaService;
  let upload: jest.Mock;
  let recordUpload: jest.Mock;
  let removeObject: jest.Mock;
  const mockDto = {
    mediaType: MediaType.AUDIO,
    mediaUploadPath: MediaUploadPath.HOME,
  };

  beforeEach(async () => {
    upload = jest.fn().mockResolvedValue("page/home/images/abc.jpg");
    recordUpload = jest.fn((row: unknown) => Promise.resolve(row));
    removeObject = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: getRepositoryToken(Media),
          useValue: {
            create: jest.fn((row: unknown) => row),
            save: recordUpload,
            update: jest.fn(() => Promise.resolve(undefined)),
          },
        },
        {
          provide: StorageService,
          useValue: {
            upload,
            remove: removeObject,
            getPublicUrl: (key: string) => `https://cdn.test/${key}`,
          },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it("uploads under the home page prefix", async () => {
    const file = {
      buffer: Buffer.from(""),
      mimetype: "audio/mpeg",
    } as Express.Multer.File;

    await service.upload(file, mockDto);

    expect(upload).toHaveBeenCalledWith(
      file,
      `${StoragePrefixes.HOME_PAGE}${StorageTypePath.AUDIO}`,
    );
  });

  it("returns the key to persist alongside a url to preview", async () => {
    const result = await service.upload(
      { mimetype: "audio/mpeg" } as Express.Multer.File,
      mockDto,
    );

    expect(result).toEqual({
      key: "page/home/images/abc.jpg",
      url: "https://cdn.test/page/home/images/abc.jpg",
    });
  });

  /**
   * The row is the only thing that can later find this object: an upload the
   * editor never references is invisible to every cleanup path without it.
   */
  it("records the uploaded object so it can be collected later", async () => {
    const file = {
      buffer: Buffer.from(""),
      mimetype: "audio/mpeg",
    } as Express.Multer.File;

    await service.upload(file, mockDto);

    expect(recordUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "page/home/images/abc.jpg",
        mediaType: MediaType.AUDIO,
        uploadPath: MediaUploadPath.HOME,
        deletedFromStorageAt: null,
      }),
    );
  });

  /** An object with no row is a bill nobody can find, so it goes back. */
  it("removes the object again if recording it fails", async () => {
    recordUpload.mockRejectedValueOnce(new Error("write failed"));
    const file = {
      buffer: Buffer.from(""),
      mimetype: "audio/mpeg",
    } as Express.Multer.File;

    await expect(service.upload(file, mockDto)).rejects.toThrow("write failed");
    expect(removeObject).toHaveBeenCalledWith("page/home/images/abc.jpg");
  });

  /**
   * The route's pipe only asks whether the bytes are media at all — the
   * declared type rides in the JSON blob beside the file. Without this check an
   * mp3 could be filed under `/images` and served as one.
   */
  it.each([
    [MediaType.IMAGE, "audio/mpeg"],
    [MediaType.AUDIO, "image/png"],
    [MediaType.VIDEO, "image/png"],
  ])("refuses a %s upload carrying a %s file", async (mediaType, mimetype) => {
    const file = { mimetype } as Express.Multer.File;

    await expect(
      service.upload(file, { ...mockDto, mediaType }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(upload).not.toHaveBeenCalled();
  });

  it.each([
    [MediaType.IMAGE, "image/jpeg"],
    [MediaType.AUDIO, "audio/mpeg"],
    [MediaType.AUDIO, "video/webm"],
    [MediaType.VIDEO, "video/mp4"],
  ])("accepts a %s upload carrying a %s file", async (mediaType, mimetype) => {
    const file = { mimetype } as Express.Multer.File;

    await service.upload(file, { ...mockDto, mediaType });

    expect(upload).toHaveBeenCalled();
  });
});
