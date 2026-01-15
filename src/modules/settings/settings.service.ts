import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicationPricing() {
    const pricing = await this.prisma.publicationPricing.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!pricing) {
      const defaultPricing = await this.prisma.publicationPricing.create({
        data: {
          pricePerPost: new Prisma.Decimal(25000),
          currency: 'UZS',
          description: 'Default publication pricing',
        },
      });
      return {
        id: defaultPricing.id,
        pricePerPost: Number(defaultPricing.pricePerPost),
        currency: defaultPricing.currency,
        isActive: defaultPricing.isActive,
        description: defaultPricing.description,
        updatedAt: defaultPricing.updatedAt,
      };
    }

    return {
      id: pricing.id,
      pricePerPost: Number(pricing.pricePerPost),
      currency: pricing.currency,
      isActive: pricing.isActive,
      description: pricing.description,
      updatedAt: pricing.updatedAt,
    };
  }

  async getAllPublicationPricing() {
    const pricingList = await this.prisma.publicationPricing.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return pricingList.map((pricing) => ({
      id: pricing.id,
      pricePerPost: Number(pricing.pricePerPost),
      currency: pricing.currency,
      isActive: pricing.isActive,
      description: pricing.description,
      updatedBy: pricing.updatedBy,
      createdAt: pricing.createdAt,
      updatedAt: pricing.updatedAt,
    }));
  }

  async updatePublicationPrice(
    price: number,
    updatedBy?: string,
    description?: string,
  ) {
    const currentPricing = await this.prisma.publicationPricing.findFirst({
      where: { isActive: true },
    });

    if (currentPricing) {
      await this.prisma.publicationPricing.update({
        where: { id: currentPricing.id },
        data: { isActive: false },
      });
    }

    const newPricing = await this.prisma.publicationPricing.create({
      data: {
        pricePerPost: new Prisma.Decimal(price),
        currency: 'UZS',
        description: description || `Price updated to ${price} UZS`,
        updatedBy,
      },
    });

    return {
      id: newPricing.id,
      pricePerPost: Number(newPricing.pricePerPost),
      currency: newPricing.currency,
      isActive: newPricing.isActive,
      description: newPricing.description,
      updatedBy: newPricing.updatedBy,
      updatedAt: newPricing.updatedAt,
    };
  }

  async activatePricing(id: string) {
    const pricing = await this.prisma.publicationPricing.findUnique({
      where: { id },
    });

    if (!pricing) {
      throw new NotFoundException('Pricing not found');
    }

    const currentActive = await this.prisma.publicationPricing.findFirst({
      where: { isActive: true },
    });

    if (currentActive) {
      await this.prisma.publicationPricing.update({
        where: { id: currentActive.id },
        data: { isActive: false },
      });
    }

    const activated = await this.prisma.publicationPricing.update({
      where: { id },
      data: { isActive: true },
    });

    return {
      id: activated.id,
      pricePerPost: Number(activated.pricePerPost),
      currency: activated.currency,
      isActive: activated.isActive,
      description: activated.description,
      updatedAt: activated.updatedAt,
    };
  }
}
