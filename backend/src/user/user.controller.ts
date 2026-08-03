import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { PaginateQuery, Paginated } from "nestjs-paginate";
import { Paginate } from "nestjs-paginate";
import { LoginUserId } from "../decorators/user-details-decorator";
import { JwtGuard } from "../guards/jwt.guard";
import { User } from "../libs/entity/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

@UseGuards(JwtGuard)
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(
    @LoginUserId() userId: string,
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<User>> {
    return this.userService.findAll(+userId, query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(":id")
  update(
    @LoginUserId() userId: string,
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(+userId, +id, updateUserDto);
  }

  @Delete(":id")
  remove(@LoginUserId() userId: string, @Param("id") id: string) {
    return this.userService.remove(+userId, +id);
  }
}
