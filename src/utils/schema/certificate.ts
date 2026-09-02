import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type CertificateDocument =
  Certificate & Document;

@Schema({
  timestamps: true,
})
export class Certificate {

  @Prop({
    required: true,
  })
  template: string;


  @Prop({
    type: Object,
    required: true,
    default: {},
  })
  data: Record<string, any>;


  @Prop({
    default: 'new',
  })
  status: 'new' | 'edited';


  // =====================================
  // QR VERIFICATION TOKEN
  // =====================================

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  verificationToken: string;
}

export const CertificateSchema =
  SchemaFactory.createForClass(
    Certificate,
  );