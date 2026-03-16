import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RefreshTokenDto {
  @Expose()
  refreshToken: string;
}
