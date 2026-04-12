import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "../libs/entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { PasswordUtil } from "../libs/utils/password.util";

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
    const user: Partial<User> = {
      username: createUserDto.username,
      passwordHash: passwordHash,
    };

    const userEntity = this.userRepository.create(user);
    const savedUser = await this.userRepository.save(userEntity);
    const { passwordHash: _, ...redactedUser } = savedUser;

    return redactedUser;
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
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
