// src/certificate/dto/update-certificate.dto.ts

import {
  IsObject,
  IsOptional,
} from 'class-validator';

export class UpdateCertificateDto {

  @IsOptional()
  data?: Record<string, any>;
}