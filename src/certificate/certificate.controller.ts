// src/certificate/certificate.controller.ts

import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { BrandingService } from '../branding/branding.service';
import { CertificatesService } from './certificate.service';
import { UploadService } from 'src/cloudinary/upload.service';
import { generate } from './pdf.service';
import { UpdateCertificateDto } from 'src/utils/schema/DTO/update.certtificate';
import { CreateCertificateDto } from 'src/utils/schema/DTO/certificate';

const storage = memoryStorage();

// =====================================
// CERTIFICATE CONFIG
// =====================================

const CERTIFICATE_CONFIG = {
  NDT: {
    aliases: ['ndt'],
    imageField: 'ndtImage',
  },

  'MPI-UT': {
    aliases: ['mpi', 'ut', 'mpi-ut'],
    imageField: 'mpiImage',
  },

  'load-test': {
    aliases: ['load', 'load-test'],
    imageField: 'equipmentImg',
  },

  // 'pressure-test': {
  //   aliases: ['pressure', 'pressure-test'],
  //   imageField: 'pressureImage',
  // },

  'drill-pipe': {
    aliases: ['drill', 'drill-pipe'],
    imageField: 'drillPipeImage',
  },

  calibration: {
    aliases: ['calibration'],
    imageField: 'equipmentImage',
  },
} as const;

type CertificateName = keyof typeof CERTIFICATE_CONFIG;


@Controller('certificates')
export class CertificatesController {
  constructor(
    private readonly brandingService: BrandingService,
    private readonly certificatesService: CertificatesService,
    private readonly uploadService: UploadService,
  ) { }


  private getCertificateTitle(name: string): string {
    const titles: Record<string, string> = {
      NDT: 'NDT Inspection Certificate',
      'MPI-UT': 'Magnetic Particle / Ultrasonic Test',
      'load-test': 'Load Test Certificate',
      'pressure-test': 'Pressure Test Certificate',
      'drill-pipe': 'Drill Pipe Inspection',
      calibration: 'Calibration Certificate',
    };

    return titles[name] || name;
  }

  // =====================================
  // HOME PAGE
  // =====================================


@Get('/')
async home(
  @Query('search') search = '',
  @Res() res: Response,
) {
  const certificateTypes = Object.entries(CERTIFICATE_CONFIG).map(([key]) => ({
    name: key,
    title: this.getCertificateTitle(key),
    url: `/certificates/${key}`,
  }));

  const recentCertificates =
    await this.certificatesService.search( search );

  return res.render('dashboard/home', {
    title: 'Dashboard',
    certificateTypes,
    certificates: certificateTypes,
    recentCertificates,
    search,
    enableSearch: true,
  });
}

  // =====================================
  // CREATE CERTIFICATE PAGE
  // =====================================


  @Get('create')
  async createPage(@Res() res: Response) {
    const certificateTypes = Object.entries(CERTIFICATE_CONFIG).map(
      ([key]) => ({
        name: key,
        title: this.getCertificateTitle(key),
        url: `/certificates/${key}`,
      }),
    );

    return res.render('certificates/create', {
    title: 'Create Certificate',
    certificateTypes,
    layout: 'layout/main',
    });     
  }

  // =====================================
  // CREATE CERTIFICATE TEMPLATE PAGE
  // =====================================

  @Get('new/:template')
  async createCertificate(
    @Param('template') template: string,
    @Res() res: Response,
  ) {

    if (!(template in CERTIFICATE_CONFIG)) {
      throw new NotFoundException();
    }

    const branding =
      await this.brandingService.getBranding();

    return res.render(
      `templates/${template}`,
      {
        title: 'Create Certificate',
        branding,
        data: {},
        isPdf: false,
        isView: false,
        isEdit: false,
        isCreate: true,
      },
    );
  }


// =====================================
// HISTORY PAGE
// =====================================

@Get('history')
async history(
  @Query('search') search = '',
  @Query('template') template = 'all',
  @Query('status') status = 'all',
  @Query('from') from = '',
  @Query('to') to = '',
  @Query('page') page = '1',
  @Res() res: Response,
) {
  const result =
    await this.certificatesService.searchHistory({
      search,
      template,
      status,
      from,
      to,
      page: Number(page),
    });

  return res.render('certificates/history', {
    title: 'Certificate History',
    css: 'history',

    // data
    certificates: result.certificates,

    // pagination
    total: result.total,
    currentPage: result.currentPage,
    totalPages: result.totalPages,

    // filters
    search,
    template,
    status,
    from,
    to,

    // layout flags
    enableSearch: true,
  });
}

// =====================================
  // SEARCH SUGGESTIONS
  // =====================================


@Get('search/suggestions')
async searchSuggestions(
  @Query('q') q: string,
) {
  return this.certificatesService.searchSuggestions(q);
}

  // =====================================
  // VIEW CERTIFICATE
  // =====================================

@Get(':id/view')
async viewCertificate(
  @Param('id') id: string,
  @Res() res: Response,
) {
  const cert =
    await this.certificatesService.findOne(id);

  if (!cert) {
    throw new NotFoundException(
      'Certificate not found',
    );
  }

  const branding =
    await this.brandingService.getBranding();

  const template = cert.template;

  return res.render(`templates/${template}`, {
    title: 'View Certificate',
    branding,
    data: cert.data,

    isPdf: false,
    isView: true,
    isEdit: false,
    isCreate: false,

    certificateId: cert._id,
  });
}

  // =====================================
  // EDIT CERTIFICATE
  // =====================================

@Get(':id/edit')
async editCertificate(
  @Param('id') id: string,
  @Res() res: Response,
) {
  const cert =
    await this.certificatesService.findOne(id);

  if (!cert) {
    throw new NotFoundException(
      'Certificate not found',
    );
  }

  const template = cert.template;

  const branding =
    await this.brandingService.getBranding();

  return res.render(`templates/${template}`, {
    title: `Edit ${this.getCertificateTitle(template)}`,
    branding,
    data: cert.data,

    // IMPORTANT
    isPdf: false,
    isView: false,
    isEdit: true,
    isCreate: false,

    certificateId: cert._id,
  });
}

  // =====================================
  // UPDATE CERTIFICATE
  // =====================================

  @Post(':id/update')
  async updateCertificate(
    @Param('id') id: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ) {
    const cert =
      await this.certificatesService.findOne(id);

    if (!cert) {
      throw new NotFoundException(
        'Certificate not found',
      );
    }

    return this.certificatesService.update(
      id,
      updateCertificateDto,
    );

  }


  // =====================================
  // DELETE CERTIFICATE
  // =====================================

 @Post(':id/delete')
async deleteCertificate(
  @Param('id') id: string,
  @Res() res: Response,
) {
  const cert =
    await this.certificatesService.findOne(id);

  if (!cert) {
    throw new NotFoundException(
      'Certificate not found',
    );
  }

  await this.certificatesService.delete(id);

  // Return to certificate history instead of JSON
  return res.redirect('/certificates/history');
}

  // =====================================
  // REGENERATE PDF
  // =====================================

  @Get(':id/pdf')
  async regeneratePdf(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const cert =
      await this.certificatesService.findOne(id);

    if (!cert) {
      throw new NotFoundException(
        'Certificate not found',
      );
    }

    const template = cert.template;

    const branding =
      await this.brandingService.getBranding();

    const html =
      await new Promise<string>(
        (resolve, reject) => {
          res.render(
            template,
            {
              branding,
              data: cert.data,
              isPdf: true,
            },
            (err, renderedHtml) => {
              if (err) {
                return reject(err);
              }

              resolve(renderedHtml);
            },
          );
        },
      );

    const pdf = await generate(
      html,
      template,
    );

    res.set({
      'Content-Type':
        'application/pdf',
      'Content-Disposition':
        `attachment; filename="${template}-${id}.pdf"`,
    });

    return res.send(pdf);
  }


  // =====================================
  // LOAD CERTIFICATE PAGE
  // =====================================

  @Get(':certName')
  async showCertificate(
    @Param('certName') certName: string,
    @Res() res: Response,
  ) {
    if (!(certName in CERTIFICATE_CONFIG)) {
      throw new NotFoundException(
        `Certificate "${certName}" not found`,
      );
    }

    const branding =
      await this.brandingService.getBranding();

    return res.render(`templates/${certName}`, {
      title: this.getCertificateTitle(certName),
      branding,
      data: {},
      isPdf: false,
      isCreate: true,
      
    });

  }

  // =====================================
  // GENERATE PDF
  // =====================================

  @Post('pdf')
  @UseInterceptors(
    FileInterceptor('image', {
      storage,
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async generatePDF(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      // ---------------------------------
      // Normalize Certificate
      // ---------------------------------

      const certificateName =
        this.normalizeCertificateName(
          body.template || body.type || 'NDT',
        );



      // ---------------------------------
      // Parse Data
      // ---------------------------------

      const rawData =
        body.data
          ? JSON.parse(body.data)
          : {};

      // ---------------------------------
      // Image Field
      // ---------------------------------

      const imageField =
        (body as any)?.imageField ||
        CERTIFICATE_CONFIG[certificateName]
          .imageField;

      console.log('\n========================');
      console.log(
        'CERTIFICATE:',
        certificateName,
      );
      console.log(
        'IMAGE FIELD:',
        imageField,
      );
      console.log('FILE:', !!file);
      console.log('========================\n');

      // ---------------------------------
      // Upload Image
      // ---------------------------------

      let imageUrl = '';

      if (file) {
        imageUrl =
          await this.uploadService.uploadBuffer(
            file,
          );

        console.log(
          '✅ Uploaded:',
          imageUrl,
        );
      }

      // ---------------------------------
      // Final Data
      // ---------------------------------

      const data = {
        ...rawData,

        images: {
          ...(rawData.images || {}),

          ...(imageUrl
            ? {
              [imageField]: imageUrl,
            }
            : {}),
        },
      };

      console.log(
        'FINAL IMAGES:',
        JSON.stringify(
          data.images,
          null,
          2,
        ),
      );

      // ---------------------------------
      // Save To MongoDB
      // ---------------------------------

      console.log(
        'DATA TYPE:',
        typeof data,
      );

      console.log(data);
      const saved =
        await this.certificatesService.create({
          template: certificateName,
          data,
        });

      // ---------------------------------
      // Branding
      // ---------------------------------

      const branding =
        await this.brandingService.getBranding();

      // ---------------------------------
      // Render EJS
      // ---------------------------------

      const html =
        await new Promise<string>(
          (resolve, reject) => {
           res.render(
  `templates/${certificateName}`,
  {
    branding,
    data,
    isPdf: true,
    layout: false
  },
  (err, renderedHtml) => {
                if (err) {
                  return reject(err);
                }

                if (
                  !renderedHtml ||
                  !renderedHtml.trim()
                ) {
                  return reject(
                    new Error(
                      'Rendered HTML is empty',
                    ),
                  );
                }

                resolve(renderedHtml);
              },
            );
          },
        );

      console.log(
        `✅ HTML GENERATED (${html.length} chars)`,
      );

      console.log(
        'Equipment Image:',
        data.images?.equipmentImage
      );

      // ---------------------------------
      // Generate PDF
      // ---------------------------------

      console.log('BODY');
      console.log(body);

      console.log('FILE');
      console.log(file);

      const pdf = await generate(
        html,
        certificateName,
      );

      res.set({
        'X-Certificate-Id': String(saved._id),

        'Content-Type':
          'application/pdf',

        'Content-Disposition':
          `attachment; filename="${certificateName}.pdf"`,
      });

      return res.send(pdf);
    } catch (err) {
      console.error(
        '\n❌ PDF ERROR\n',
      );
      console.error(err);

      return res.status(500).json({
        success: false,
        message:
          'PDF generation failed',
        error:
          err instanceof Error
            ? err.message
            : String(err),
      });
    }
  }

  // =====================================
  // NORMALIZE CERTIFICATE NAME
  // =====================================

  private normalizeCertificateName(
    type: string,
  ): CertificateName {
    const value =
      type
        ?.toLowerCase()
        .trim() || '';

    for (const [
      name,
      config,
    ] of Object.entries(
      CERTIFICATE_CONFIG,
    )) {
      if (
        config.aliases.some((alias) =>
          value.includes(alias),
        )
      ) {
        return name as CertificateName;
      }
    }

    return 'calibration';
  }


}