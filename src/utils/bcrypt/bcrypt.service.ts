import * as bcrypt from 'bcrypt';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class BcryptService {
  async hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
