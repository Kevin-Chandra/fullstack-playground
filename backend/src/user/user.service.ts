import { ConflictException, Injectable, Logger } from "@nestjs/common";
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

  findOne(id: number) {
    return this.userRepository.findOneBy({ id: id });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return this.userRepository.delete({ id: id });
  }
}
