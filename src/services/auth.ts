import bcrypt from 'bcrypt';

export class AuthService {
  public static async hashPassword(
    password: string,
    salt: number = 10
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
