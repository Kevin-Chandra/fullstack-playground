import * as bcrypt from "bcrypt";

export class PasswordUtil {
  static async hash(password: string): Promise<string> {
    const saltRound = Number(process.env.BCRYPT_HASH_ROUND);
    return bcrypt.hash(password, saltRound);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
