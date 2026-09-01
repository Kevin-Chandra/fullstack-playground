import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  ImageFileConstants,
  StoragePrefixes,
  StorageTypePath,
  VideoFileConstants,
} from "../libs/constants/file.constants";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { MediaUploadPath } from "../libs/entity/enums/media-upload-path";
import { Media } from "../libs/entity/media.entity";
import { PageMediaService } from "../page/page-media.service";
import { StorageService } from "../storage/storage.service";
import { MediaService } from "./media.service";

describe("MediaService", () => {
  let service: MediaService;
  let upload: jest.Mock;
  let recordUpload: jest.Mock;
  let removeObject: jest.Mock;
  let findMedia: jest.Mock;
  let collectUnreferenced: jest.Mock;
  const mockDto = {
    mediaType: MediaType.AUDIO,
    mediaUploadPath: MediaUploadPath.HOME,
  };

  beforeEach(async () => {
    upload = jest.fn().mockResolvedValue("page/home/images/abc.jpg");
    recordUpload = jest.fn((row: unknown) => Promise.resolve(row));
    removeObject = jest.fn().mockResolvedValue(undefined);
    findMedia = jest.fn().mockResolvedValue(null);
    collectUnreferenced = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: getRepositoryToken(Media),
          useValue: {
            create: jest.fn((row: unknown) => row),
            save: recordUpload,
            update: jest.fn(() => Promise.resolve(undefined)),
            findOne: findMedia,
          },
        },
        {
          provide: PageMediaService,
          useValue: { collectUnreferenced },
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

  /**
   * The route's pipe caps at the largest of the three limits, because the
   * declared type is not visible to it. Without this check a 24MB JPEG would
   * pass under the video allowance.
   */
  it("refuses a file over the limit for the type it was declared as", async () => {
    const file = {
      mimetype: "image/jpeg",
      size: ImageFileConstants.MAX_SIZE_BYTES + 1,
    } as Express.Multer.File;

    await expect(
      service.upload(file, { ...mockDto, mediaType: MediaType.IMAGE }),
    ).rejects.toMatchObject({
      response: { error: errorCodeConstants.FILE_TOO_LARGE },
    });
    expect(upload).not.toHaveBeenCalled();
  });

  it("accepts a file the size of its type's limit", async () => {
    const file = {
      mimetype: "video/mp4",
      size: VideoFileConstants.MAX_SIZE_BYTES,
    } as Express.Multer.File;

    await service.upload(file, { ...mockDto, mediaType: MediaType.VIDEO });

    expect(upload).toHaveBeenCalled();
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

  describe("delete", () => {
    const KEY = "page/home/images/abc.jpg";
    const recorded = { id: 1, key: KEY, deletedFromStorageAt: null };

    /**
     * The caller only knows the draft it is editing. A key can also be held by
     * a retained publication — the snapshot the live page is served from — so
     * the decision has to come from the service that sees every reference.
     */
    it("refuses a key something still references", async () => {
      findMedia.mockResolvedValue(recorded);
      collectUnreferenced.mockResolvedValue([]);

      await expect(service.delete(KEY)).rejects.toBeInstanceOf(
        ConflictException,
      );
      await expect(service.delete(KEY)).rejects.toMatchObject({
        response: { error: errorCodeConstants.MEDIA_IN_USE },
      });
      expect(removeObject).not.toHaveBeenCalled();
    });

    it("collects a key nothing references", async () => {
      findMedia.mockResolvedValue(recorded);
      collectUnreferenced.mockResolvedValue([KEY]);

      await expect(service.delete(KEY)).resolves.toBeUndefined();
      expect(collectUnreferenced).toHaveBeenCalledWith([KEY]);
    });

    /** An unrecorded key belongs to a module whose references this one cannot see. */
    it("refuses a key it has no record of", async () => {
      findMedia.mockResolvedValue(null);

      await expect(service.delete(KEY)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await expect(service.delete(KEY)).rejects.toMatchObject({
        response: { error: errorCodeConstants.MEDIA_NOT_FOUND },
      });
      expect(collectUnreferenced).not.toHaveBeenCalled();
    });

    /** Already collected is the state the caller asked for, so it is not an error. */
    it("succeeds without collecting again when the row is tombstoned", async () => {
      findMedia.mockResolvedValue({
        ...recorded,
        deletedFromStorageAt: new Date(),
      });

      await expect(service.delete(KEY)).resolves.toBeUndefined();
      expect(collectUnreferenced).not.toHaveBeenCalled();
      expect(removeObject).not.toHaveBeenCalled();
    });
  });
});
