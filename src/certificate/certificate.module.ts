import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificatesController } from './certificate.controller';
import { CertificatesService } from './certificate.service';
import { BrandingModule } from 'src/branding/branding.module';
import { Certificate, CertificateSchema } from 'src/utils/schema/certificate';
import { UploadService } from 'src/cloudinary/upload.service';

@Module({
  imports: [
    BrandingModule,
    MongooseModule.forFeature([{ name: Certificate.name, schema: CertificateSchema }]),
  ],
  controllers: [CertificatesController],
  providers: [  UploadService, CertificatesService],
})
export class CertificatesModule { }