import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from "nestjs-paginate";
import { DataSource, Repository } from "typeorm";
import { paginationConstants } from "../libs/constants/pagination.constants";
import { UserStatus } from "../libs/entity/enums/user-status.enum";
import { User } from "../libs/entity/user.entity";
import { PaginationUtil } from "../libs/utils/pagination.util";
import { PasswordUtil } from "../libs/utils/password.util";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private dataSource: DataSource,
  ) {
    this.logger = new Logger("User Management");
  }

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });

    if (existingUser) {
      throw new ConflictException("Username already taken");
    }

    const passwordHash = await PasswordUtil.hash(createUserDto.password);
    const { password: _password, ...userData } = createUserDto;
    const user: Partial<User> = {
      ...userData,
      passwordHash: passwordHash,
      userStatus: createUserDto.userStatus ?? UserStatus.ACTIVE,
    };

    const userEntity = this.userRepository.create(user);
    const savedUser = await this.userRepository.save(userEntity);
    const { passwordHash: _, ...redactedUser } = savedUser;

    return redactedUser;
  }

  async findAll(query: PaginateQuery): Promise<Paginated<User>> {
    const result = await paginate(query, this.userRepository, {
      defaultLimit: paginationConstants.ITEM_PER_PAGE,
      maxLimit: paginationConstants.MAX_ITEM_PER_PAGE,
      sortableColumns: ["name"],
      searchableColumns: ["name", "username"],
      filterableColumns: {
        userStatus: [FilterOperator.EQ],
      },
    });

    PaginationUtil.assertPageInRange(query, result);

    return result;
  }

  async findOne(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        userStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOneBy({
        username: updateUserDto.username,
      });

      if (existingUser) {
        throw new ConflictException("Username already taken");
      }
    }

    const { password: _password, ...userData } = updateUserDto;
    const changes: Partial<User> = {
      ...userData,
    };

    if (updateUserDto.password) {
      changes.passwordHash = await PasswordUtil.hash(updateUserDto.password);
    }

    if (Object.keys(changes).length > 0) {
      await this.userRepository.update({ id: id }, changes);
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id: id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const result = await this.userRepository.delete({ id: id });

    return result.affected === 1;
  }
}
