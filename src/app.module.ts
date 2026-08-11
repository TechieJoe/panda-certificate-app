import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandingModule } from './branding/branding.module';
import { CertificatesModule } from './certificate/certificate.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }) as any,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error(
            'MONGODB_URI environment variable is not set. Please add it to your .env or environment variables.'
          );
        }
        return {
          uri,
        } as any;
      },
      inject: [ConfigService],

    }),
    CertificatesModule, BrandingModule,

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src/public'), // ✅ FIXED
      serveRoot: '/', // optional but good
    }),


  ]
})
export class AppModule { }



   



