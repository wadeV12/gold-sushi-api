import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() body: LoginDto, @Req() req) {
    return this.authService.login(req.user);
  }

  @Post('logout')
  async logout() {
    return 'logout success';
  }

  @Post('refresh')
  async refreshToken() {
    return 'token refresh success';
  }
}
