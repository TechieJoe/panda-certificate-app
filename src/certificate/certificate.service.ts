import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';

import {
  Certificate,
  CertificateDocument,
} from 'src/utils/schema/certificate';
import { CreateCertificateDto } from 'src/utils/schema/DTO/certificate';
import { UpdateCertificateDto } from 'src/utils/schema/DTO/update.certtificate';


@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name)
    private readonly certificateModel: Model<CertificateDocument>,
  ) {}

// =========================
// CREATE
// =========================

async create(
  dto: {
    template: string;
    data: Record<string, any>;
    verificationToken: string;
  },
) {
  return this.certificateModel.create({
    template: dto.template,
    data: dto.data,
    verificationToken: dto.verificationToken,
  });
}

// =========================
  // GET ALL
  // =========================
  async findAll() {
    return this.certificateModel
      .find()
      .sort({ createdAt: -1 })
      .lean();
  }

  // =========================
  // GET BY TEMPLATE
  // =========================
  async findByTemplate(
    template: string,
  ) {
    return this.certificateModel
      .find({ template })
      .sort({ createdAt: -1 })
      .lean();
  }

  // =========================
  // GET ONE
  // =========================
  async findOne(id: string) {
    return this.certificateModel
      .findById(id)
      .lean();
  }

  // =========================
  // UPDATE
  // =========================
async update(
  id: string,
  dto: UpdateCertificateDto,
) {
  return this.certificateModel.findByIdAndUpdate(
    id,
    {
      $set: {
        data: dto.data,
        status: 'edited',
      },
    },
    {
      new: true,
    },
  );
}

// =========================
  // DELETE
  // =========================
  async delete(id: string) {
    return this.certificateModel.findByIdAndDelete(
      id,
    );
  }

  // =========================
  // RECENT
  // =========================
  async recent(limit = 10) {
    return this.certificateModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  // =========================
  // COUNTS
  // =========================
  async countAll() {
    return this.certificateModel.countDocuments();
  }

  async countByTemplate(
    template: string,
  ) {
    return this.certificateModel.countDocuments({
      template,
    });
  }

  // =========================
  // SEARCH
  // =========================

  async search(search?: string) {
  if (!search || search.trim() === '') {
    return await this.certificateModel
      .find()
      .sort({ createdAt: -1 })
      .lean();
  }

  return await this.certificateModel
    .find({
      $or: [
        {
          template: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          'data.equipmentOwner': {
            $regex: search,
            $options: 'i',
          },
        },
        {
          'data.client': {
            $regex: search,
            $options: 'i',
          },
        },
        {
          'data.serialNo': {
            $regex: search,
            $options: 'i',
          },
        },
        {
          'data.certificateNo': {
            $regex: search,
            $options: 'i',
          },
        },
      ],
    })
    .sort({
      createdAt: -1,
    })
    .lean();
}

  // =========================
  // SEARCH SUGGESTIONS
  // =========================


async searchSuggestions(q: string) {
  if (!q || q.trim() === '') {
    return [];
  }

  const certificates = await this.certificateModel
    .find({
      $or: [
        { template: { $regex: q, $options: 'i' } },
        { 'data.client': { $regex: q, $options: 'i' } },
        { 'data.equipmentOwner': { $regex: q, $options: 'i' } },
        { 'data.serialNo': { $regex: q, $options: 'i' } },
        { 'data.certificateNo': { $regex: q, $options: 'i' } },
      ],
    })
    .limit(8)
    .lean();

  return certificates.map(cert => ({
    id: cert._id,
    certificateNo: cert.data?.certificateNo || '',
    client: cert.data?.client || cert.data?.equipmentOwner || '',
    serialNo: cert.data?.serialNo || '',
    template: cert.template,
  }));
}


// =========================
  // SEARCH HISTORY
  // =========================

async searchHistory(filters: {
    search?: string;
    template?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
}) {
    const {
        search = '',
        template = 'all',
        status = 'all',
        from,
        to,
        page = 1,
    } = filters;

    const query: any = {};

    if (search) {
        query.$or = [
            {
                template: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                'data.equipmentOwner': {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                'data.client': {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                'data.serialNo': {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                'data.certificateNo': {
                    $regex: search,
                    $options: 'i',
                },
            },
        ];
    }

    if (template !== 'all') {
        query.template = template;
    }

    if (status !== 'all') {
        query.status = status;
    }

    if (from || to) {
        query.createdAt = {};

        if (from) {
            query.createdAt.$gte = new Date(from);
        }

        if (to) {
            query.createdAt.$lte = new Date(to);
        }
    }

    const limit = 10;
    const skip = (page - 1) * limit;

    const [certificates, total] = await Promise.all([
        this.certificateModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        this.certificateModel.countDocuments(query),
    ]);

    return {
        certificates,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
    };
}

// =========================
// FIND BY VERIFICATION TOKEN
// =========================

async findByVerificationToken(
  verificationToken: string,
) {
  return this.certificateModel
    .findOne({
      verificationToken,
    })
    .lean();
}

}