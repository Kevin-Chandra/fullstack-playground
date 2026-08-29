import { Test, TestingModule } from "@nestjs/testing";
import type { PaginateQuery } from "nestjs-paginate";
import { JwtGuard } from "../guards/jwt.guard";
import { UserStatus } from "../libs/entity/enums/user-status.enum";
import { isPublicRoute } from "../libs/testing/is-public-route";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

const allow = { canActivate: () => true };
const query = { path: "/user" } as PaginateQuery;

describe("UserController", () => {
  let controller: UserController;
  let service: jest.Mocked<Partial<UserService>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: service }],
    })
      .overrideGuard(JwtGuard)
      .useValue(allow)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  /** Account management is never public, on any route. */
  it("keeps every route authenticated", () => {
    const routes: (keyof UserController)[] = [
      "create",
      "findAll",
      "findOne",
      "update",
      "remove",
    ];

    routes.forEach((route) =>
      expect(isPublicRoute(UserController, route)).toBe(false),
    );
  });

  it("hands the create payload over untouched", () => {
    const createUserDto = {
      username: "ada",
      password: "correct horse battery",
      name: "Ada Lovelace",
      userStatus: UserStatus.ACTIVE,
    };

    void controller.create(createUserDto);

    expect(service.create).toHaveBeenCalledWith(createUserDto);
  });

  /**
   * Ids reach a route as strings and every service method counts on numbers, so
   * the coercion is the only logic these handlers actually carry.
   */
  it("turns the path id into a number", () => {
    void controller.findOne("7");
    void controller.update("1", "7", { name: "Grace" });
    void controller.remove("1", "7");

    expect(service.findOne).toHaveBeenCalledWith(7);
    expect(service.update).toHaveBeenCalledWith(1, 7, { name: "Grace" });
    expect(service.remove).toHaveBeenCalledWith(1, 7);
  });

  /** The caller's own id decides what the list leaves out. */
  it("passes the signed-in id alongside the paginate query", () => {
    void controller.findAll("1", query);

    expect(service.findAll).toHaveBeenCalledWith(1, query);
  });
});
