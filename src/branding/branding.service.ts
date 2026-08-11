import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import sharp from 'sharp';
import { Branding, BrandingDocument } from 'src/utils/schema/schema_branding';


@Injectable()
export class BrandingService {

  constructor(
    @InjectModel(Branding.name)
    private brandingModel: Model<BrandingDocument>,
  ) { }

  private validateImage(file: Express.Multer.File) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Only PNG and JPG allowed');
    }
  }

  private async optimizeAndConvert(file: Express.Multer.File) {
    const optimized = await sharp(file.buffer)
      .resize({ width: 2500 }) // good for print
      .toBuffer();

    const base64 = optimized.toString('base64');
    return `data:${file.mimetype};base64,${base64}`;
  }

  async updateLetterhead(file: Express.Multer.File) {
    this.validateImage(file);
    const base64 = await this.optimizeAndConvert(file);

    return this.brandingModel.findOneAndUpdate(
      {},
      { letterhead: base64 },
      { upsert: true, returnDocument: 'after' }
    );
  }

  async updateStamp(file: Express.Multer.File) {
    this.validateImage(file);
    const base64 = await this.optimizeAndConvert(file);

    return this.brandingModel.findOneAndUpdate(
      {},
      { stamp: base64 },
      { upsert: true, returnDocument: 'after' }
    );
  }

  async updateAsnt(file: Express.Multer.File) {
    this.validateImage(file);
    const base64 = await this.optimizeAndConvert(file);

    return this.brandingModel.findOneAndUpdate(
      {},
      { asnt: base64 },
      { upsert: true, returnDocument: 'after' }
    );
  }
  async updateLeea(file: Express.Multer.File) {
    this.validateImage(file);
    const base64 = await this.optimizeAndConvert(file);

    return this.brandingModel.findOneAndUpdate(
      {},
      { leea: base64 },
      { upsert: true, returnDocument: 'after' }
    );
  }
  async updateAwrf(file: Express.Multer.File) {
    this.validateImage(file);
    const base64 = await this.optimizeAndConvert(file);

    return this.brandingModel.findOneAndUpdate(
      {},
      { awrf: base64 },
      { upsert: true, returnDocument: 'after' }
    );
  }

  async getBranding() {
    const branding = await this.brandingModel.findOne();
    return branding;
  }
}
