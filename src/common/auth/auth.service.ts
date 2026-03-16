import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@modules/users/entities/user.entity';
import { BcryptService } from '../../utils/bcrypt/bcrypt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private readonly bcryptService: BcryptService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const isValid = await this.bcryptService.verifyPassword(
      pass,
      user.password,
    );

    if (isValid) {
      return user;
    }

    return null;
  }

  login(user: any) {
    const { id, email, role } = user;

    return {
      id,
      email,
      role,
      access_token: this.jwtService.sign({ id, email, role }),
    };
  }
}
