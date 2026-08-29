import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { paginate } from "nestjs-paginate";
import type { PaginateQuery } from "nestjs-paginate";
import { DataSource, Not } from "typeorm";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { paginationConstants } from "../libs/constants/pagination.constants";
import { UserStatus } from "../libs/entity/enums/user-status.enum";
import { User } from "../libs/entity/user.entity";
import { PasswordUtil } from "../libs/utils/password.util";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserService } from "./user.service";

/**
 * `paginate` builds and runs its own query, so the only thing a unit test can
 * pin is the config the service hands it — which is where the rules live.
 */
jest.mock("nestjs-paginate", () => ({
  // The real module has to come through: the service reads `FilterOperator`
  // off it while building the config.
  ...jest.requireActual<typeof import("nestjs-paginate")>("nestjs-paginate"),
  paginate: jest.fn(),
}));

const paginateMock = jest.mocked(paginate);

/**
 * Hashing is left real, at the cheapest cost bcrypt accepts, so the password
 * assertions are about an actual hash rather than a stub's return value. The
 * util reads this at call time, and nothing sets it under jest.
 */
process.env.BCRYPT_HASH_ROUND = "4";

const CURRENT_USER = 1;
const OTHER_USER = 2;
const PASSWORD = "correct horse battery";

const createDto = (overrides: Partial<CreateUserDto> = {}): CreateUserDto => ({
  username: "ada",
  password: PASSWORD,
  name: "Ada Lovelace",
  userStatus: undefined,
  ...overrides,
});

const existing = (overrides: Partial<User> = {}): User =>
  ({
    id: OTHER_USER,
    username: "ada",
    name: "Ada Lovelace",
    passwordHash: "hash-on-record",
    userStatus: UserStatus.ACTIVE,
    ...overrides,
  }) as User;

const pageOf = (totalPages: number) =>
  ({
    data: [],
    meta: { totalPages, currentPage: 1, itemsPerPage: 20, totalItems: 0 },
    links: {},
  }) as unknown as Awaited<ReturnType<typeof paginate>>;

describe("UserService", () => {
  let service: UserService;
  let repository: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    paginateMock.mockReset();

    repository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn((data: Partial<User>) => data),
      save: jest.fn((entity: Partial<User>) =>
        Promise.resolve({ id: OTHER_USER, ...entity }),
      ),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: repository },
        // Injected but unused by the service; Nest still has to resolve it.
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe("create", () => {
    it("stores a verifiable hash and neither keeps nor returns the password", async () => {
      repository.findOneBy.mockResolvedValue(null);

      const created = await service.create(createDto());
      const [saved] = repository.save.mock.calls[0] as [User];

      expect(saved.passwordHash).not.toBe(PASSWORD);
      await expect(
        PasswordUtil.compare(PASSWORD, saved.passwordHash),
      ).resolves.toBe(true);
      // The raw field is destructured away rather than written to a column.
      expect(saved).not.toHaveProperty("password");
      expect(created).not.toHaveProperty("passwordHash");
      expect(created).toMatchObject({ username: "ada", name: "Ada Lovelace" });
    });

    it("opens a new account as active", async () => {
      repository.findOneBy.mockResolvedValue(null);

      await service.create(createDto());

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userStatus: UserStatus.ACTIVE }),
      );
    });

    it("honours a status the caller asked for", async () => {
      repository.findOneBy.mockResolvedValue(null);

      await service.create(createDto({ userStatus: UserStatus.INACTIVE }));

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userStatus: UserStatus.INACTIVE }),
      );
    });

    it("refuses a username that is already taken", async () => {
      repository.findOneBy.mockResolvedValue(existing());

      const conflict = service.create(createDto());

      await expect(conflict).rejects.toBeInstanceOf(ConflictException);
      await expect(conflict).rejects.toMatchObject({
        response: { error: errorCodeConstants.USERNAME_CONFLICT },
      });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    /** Nobody manages themselves from the user list. */
    it("hides the caller from their own listing", async () => {
      paginateMock.mockResolvedValue(pageOf(1));

      await service.findAll(CURRENT_USER, { path: "/user" } as PaginateQuery);

      expect(paginateMock.mock.calls[0][2]).toMatchObject({
        where: { id: Not(CURRENT_USER) },
      });
    });

    it("paginates on the shared limits rather than per-route ones", async () => {
      paginateMock.mockResolvedValue(pageOf(1));

      await service.findAll(CURRENT_USER, { path: "/user" } as PaginateQuery);

      expect(paginateMock.mock.calls[0][2]).toMatchObject({
        defaultLimit: paginationConstants.ITEM_PER_PAGE,
        maxLimit: paginationConstants.MAX_ITEM_PER_PAGE,
      });
    });

    /** The frontend maps this code onto a "back to the first page" action. */
    it("rejects a page past the end of the list", async () => {
      paginateMock.mockResolvedValue(pageOf(3));

      const outOfRange = service.findAll(CURRENT_USER, {
        path: "/user",
        page: 4,
      } as PaginateQuery);

      await expect(outOfRange).rejects.toBeInstanceOf(BadRequestException);
      await expect(outOfRange).rejects.toMatchObject({
        response: { error: errorCodeConstants.PAGINATION_OUT_OF_BOUND },
      });
    });

    it("still serves the first page of an empty list", async () => {
      paginateMock.mockResolvedValue(pageOf(0));

      await expect(
        service.findAll(CURRENT_USER, {
          path: "/user",
          page: 1,
        } as PaginateQuery),
      ).resolves.toMatchObject({ data: [] });
    });
  });

  describe("findOne", () => {
    it("never reads the password hash back out", async () => {
      repository.findOne.mockResolvedValue(existing());

      await service.findOne(OTHER_USER);

      const [options] = repository.findOne.mock.calls[0] as [
        { select: Record<string, boolean> },
      ];

      expect(Object.keys(options.select)).not.toContain("passwordHash");
    });

    it("404s on an id that does not exist", async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(404)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("404s on an id that does not exist", async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(CURRENT_USER, 404, { name: "Grace" }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    /** Editing your own row here would let a user unlock or rename themselves. */
    it("refuses to edit the account making the request", async () => {
      repository.findOneBy.mockResolvedValue(existing({ id: CURRENT_USER }));

      const ownAccount = service.update(CURRENT_USER, CURRENT_USER, {
        name: "Grace",
      });

      await expect(ownAccount).rejects.toBeInstanceOf(BadRequestException);
      await expect(ownAccount).rejects.toMatchObject({
        response: { error: errorCodeConstants.UPDATE_OWN_ACCOUNT_RESTRICTED },
      });
      expect(repository.update).not.toHaveBeenCalled();
    });

    it("refuses a username another account already holds", async () => {
      repository.findOneBy
        .mockResolvedValueOnce(existing())
        .mockResolvedValueOnce(existing({ id: 9, username: "grace" }));

      const conflict = service.update(CURRENT_USER, OTHER_USER, {
        username: "grace",
      });

      await expect(conflict).rejects.toBeInstanceOf(ConflictException);
      await expect(conflict).rejects.toMatchObject({
        response: { error: errorCodeConstants.USERNAME_CONFLICT },
      });
      expect(repository.update).not.toHaveBeenCalled();
    });

    it("skips the conflict lookup when the username has not changed", async () => {
      repository.findOneBy.mockResolvedValue(existing({ username: "ada" }));
      repository.findOne.mockResolvedValue(existing());

      await service.update(CURRENT_USER, OTHER_USER, { username: "ada" });

      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(repository.update).toHaveBeenCalled();
    });

    it("swaps a new password for its hash and writes neither in the clear", async () => {
      repository.findOneBy.mockResolvedValue(existing());
      repository.findOne.mockResolvedValue(existing());

      await service.update(CURRENT_USER, OTHER_USER, { password: PASSWORD });

      const [, changes] = repository.update.mock.calls[0] as [
        unknown,
        Partial<User>,
      ];

      expect(changes).not.toHaveProperty("password");
      await expect(
        PasswordUtil.compare(PASSWORD, changes.passwordHash),
      ).resolves.toBe(true);
    });

    it("writes nothing when the payload carries no changes", async () => {
      repository.findOneBy.mockResolvedValue(existing());
      repository.findOne.mockResolvedValue(existing());

      await service.update(CURRENT_USER, OTHER_USER, {});

      expect(repository.update).not.toHaveBeenCalled();
    });

    /** Re-read rather than returned from memory, so the response is post-write. */
    it("answers with the refreshed user", async () => {
      const refreshed = existing({ name: "Grace Hopper" });

      repository.findOneBy.mockResolvedValue(existing());
      repository.findOne.mockResolvedValue(refreshed);

      await expect(
        service.update(CURRENT_USER, OTHER_USER, { name: "Grace Hopper" }),
      ).resolves.toBe(refreshed);
    });
  });

  describe("remove", () => {
    it("404s on an id that does not exist", async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(CURRENT_USER, 404)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    /** Locking yourself out is not an administrative action. */
    it("refuses to delete the account making the request", async () => {
      repository.findOneBy.mockResolvedValue(existing({ id: CURRENT_USER }));

      const ownAccount = service.remove(CURRENT_USER, CURRENT_USER);

      await expect(ownAccount).rejects.toBeInstanceOf(BadRequestException);
      await expect(ownAccount).rejects.toMatchObject({
        response: { error: errorCodeConstants.DELETION_OWN_ACCOUNT_RESTRICTED },
      });
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it("reports whether a row actually went", async () => {
      repository.findOneBy.mockResolvedValue(existing());

      repository.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove(CURRENT_USER, OTHER_USER)).resolves.toBe(
        true,
      );

      repository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(CURRENT_USER, OTHER_USER)).resolves.toBe(
        false,
      );
    });
  });
});
