import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { StorageService } from "./storage.service";

type Detected = { ext: string; mime: string } | undefined;

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * `file-type` is reached through a dynamic `import()`, which jest cannot
 * execute under `module: nodenext`, and `onModuleInit` builds a real R2
 * client. Both are replaced on the instance so the branch under test — what
 * `upload` does with the detection result — is reachable at all.
 *
 * `undefined` is what the installed `file-type` genuinely returns for
 * unrecognised bytes: plain text, a bare `<svg>`, an empty buffer.
 */
const stub = (
  service: StorageService,
  detected: Detected,
  upload: jest.Mock,
) => {
  Object.defineProperty(service, "detectFileType", {
    value: () => Promise.resolve(detected),
    writable: true,
  });
  Object.defineProperty(service, "bucket", {
    value: { upload },
    writable: true,
  });
};

describe("StorageService", () => {
  let service: StorageService;
  let upload: jest.Mock;

  beforeEach(async () => {
    upload = jest.fn((_buffer: Buffer, key: string) =>
      Promise.resolve({ objectKey: key }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: { get: () => "test" } },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  /**
   * Destructuring the detection result threw a TypeError when it was
   * `undefined`, so an unrecognised upload surfaced as a 500. Refusing is also
   * the safe answer: the alternative is storing unidentified content under the
   * client's claimed mime type and serving it from a public URL.
   */
  it("rejects a file whose type cannot be determined", async () => {
    stub(service, undefined, upload);

    const rejected = service.upload(
      { buffer: Buffer.from("<svg/>") } as Express.Multer.File,
      "page/home/images",
    );

    await expect(rejected).rejects.toBeInstanceOf(BadRequestException);
    await expect(rejected).rejects.toMatchObject({
      response: { error: errorCodeConstants.FILE_TYPE_UNSUPPORTED },
    });
    expect(upload).not.toHaveBeenCalled();
  });

  it("names the detected extension in the key, never the client's filename", async () => {
    stub(service, { ext: "png", mime: "image/png" }, upload);

    const key = await service.upload(
      { buffer: PNG, originalname: "../../etc/passwd" } as Express.Multer.File,
      "page/home/images",
    );

    expect(key).toMatch(/^page\/home\/images\/[\w-]+\.png$/);
    expect(key).not.toContain("passwd");
  });

  /** The stored content type comes from the bytes, never the client's claim. */
  it("uploads under the detected mime type", async () => {
    stub(service, { ext: "png", mime: "image/png" }, upload);

    await service.upload(
      { buffer: PNG, mimetype: "text/html" } as Express.Multer.File,
      "page/home/images",
    );

    expect(upload).toHaveBeenCalledWith(
      PNG,
      expect.any(String),
      undefined,
      "image/png",
    );
  });
});
