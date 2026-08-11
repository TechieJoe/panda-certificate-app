import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CertificatesService } from './certificate.service';

describe('CertificatesService', () => {
  let service: CertificatesService;

  const mockCertificateModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          CertificatesService,
          {
            provide: getModelToken('Certificate'),
            useValue: mockCertificateModel,
          },
        ],
      }).compile();

    service = module.get<CertificatesService>(
      CertificatesService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a certificate', async () => {
      const data = {
        customer: 'Shell',
      };

      mockCertificateModel.create.mockResolvedValue({
        _id: '123',
        template: 'drill-pipe',
        data,
      });

      const result = await service.create(
        'drill-pipe',
        data,
      );

      expect(
        mockCertificateModel.create,
      ).toHaveBeenCalledWith({
        template: 'drill-pipe',
        type: 'drill-pipe',
        data,
      });

      expect(result._id).toBe('123');
    });
  });

  describe('findOne', () => {
    it('should return a certificate', async () => {
      mockCertificateModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: '123',
        }),
      });

      const result =
        await service.findOne('123');

      expect(result._id).toBe('123');
    });
  });

  describe('update', () => {
    it('should update a certificate', async () => {
      mockCertificateModel.findByIdAndUpdate.mockResolvedValue(
        {
          _id: '123',
          data: {
            customer: 'Updated',
          },
        },
      );

      const result =
        await service.update(
          '123',
          {
            customer: 'Updated',
          },
        );

      expect(
        mockCertificateModel.findByIdAndUpdate,
      ).toHaveBeenCalled();

      expect(result.data.customer).toBe(
        'Updated',
      );
    });
  });

  describe('delete', () => {
    it('should delete a certificate', async () => {
      mockCertificateModel.findByIdAndDelete.mockResolvedValue(
        {
          _id: '123',
        },
      );

      const result =
        await service.delete('123');

      expect(
        mockCertificateModel.findByIdAndDelete,
      ).toHaveBeenCalledWith('123');

      expect(result._id).toBe('123');
    });
  });
});