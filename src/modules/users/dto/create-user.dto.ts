import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsPhoneNumber('UA')
  phone: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth: string;

  @IsOptional()
  registrationToken?: string;
}
