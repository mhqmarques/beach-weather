import { User } from '@src/models/user';
import bcrypt from 'bcrypt';
import config from 'config';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface DecodedUser extends Omit<User, '_id'>, JwtPayload {
  id: string;
}

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

  public static generateToken(payload: object, keySecret?: string): string {
    const secret = keySecret ? keySecret : config.get<string>('App.auth.key');
    return jwt.sign(payload, secret, {
      expiresIn: config.get<number>('App.auth.tokenExpiresIn'),
    });
  }

  public static decodeToken(token: string): DecodedUser {
    return jwt.verify(token, config.get('App.auth.key')) as DecodedUser;
  }
}
