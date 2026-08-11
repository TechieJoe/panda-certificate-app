import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandingDocument = Branding & Document;

@Schema({ timestamps: true })
export class Branding {

  @Prop({ type: String, required: false })
  letterhead: string;

  @Prop({ type: String, required: false })
  stamp: string;

  @Prop({ type: String, required: false })
  asnt: string;

  @Prop({ type: String, required: false })
  leea: string;

  @Prop({ type: String, required: false })
  awrf: string;

  @Prop({ type: String, default: 'PANDA INTEGRATED ENERGY SERVICES LIMITED' })
  companyName: string;

  @Prop({ type: String, default: 'LEVEL II NDT INSPECTOR' })
  inspectorQualification: string;
}

export const BrandingSchema = SchemaFactory.createForClass(Branding);
