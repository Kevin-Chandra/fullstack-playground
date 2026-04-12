import * as bcrypt from "bcrypt";

const SALT_ROUND = 12;

export class PasswordUtil {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUND);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
