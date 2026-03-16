import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LoginResponseDto {
  @Expose()
  id: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  phone: string;
}
