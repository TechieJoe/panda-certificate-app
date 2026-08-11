import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandingService } from './branding.service';
import type { Multer } from 'multer';

@Controller('branding')
export class BrandingController {

  constructor(private readonly brandingService: BrandingService) { }

  @Post('letterhead')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  }))
  uploadLetterhead(@UploadedFile() file: Express.Multer.File) {
    return this.brandingService.updateLetterhead(file);
  }

  @Post('stamp')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  uploadStamp(@UploadedFile() file: Express.Multer.File) {
    return this.brandingService.updateStamp(file);
  }

  @Post('asnt')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  uploadAsnt(@UploadedFile() file: Express.Multer.File) {
    return this.brandingService.updateAsnt(file);
  }

  @Post('leea')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  uploadLeea(@UploadedFile() file: Express.Multer.File) {
    return this.brandingService.updateLeea(file);
  }

  @Post('awrf')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  uploadAwrf(@UploadedFile() file: Express.Multer.File) {
    return this.brandingService.updateAwrf(file);
  }

  @Get('/')
  getBranding() {
    return this.brandingService.getBranding();
   
  }
}
