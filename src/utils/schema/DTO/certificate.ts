import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCertificateDto {

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsString()
  data?: string;
}