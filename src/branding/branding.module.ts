import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandingController } from './branding.controller';
import { BrandingService } from './branding.service';
import { Branding, BrandingSchema } from 'src/utils/schema/schema_branding';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Branding.name, schema: BrandingSchema }])
  ],
  controllers: [BrandingController],
  providers: [BrandingService],
  exports: [BrandingService, MongooseModule],
})
export class BrandingModule {}
