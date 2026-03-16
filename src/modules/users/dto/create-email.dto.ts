import { IsString } from 'class-validator';

export class CreateEmailDto {
  @IsString()
  to: string;
  @IsString()
  subject: string;
  @IsString()
  template: string;
  dataTemplate: { text: string };
}
