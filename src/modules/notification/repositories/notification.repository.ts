import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { INotificationRepository } from '../interfaces/notification-repository.interface';
import { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.NotificationUpdateInput,
  ): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Notification> {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async findMany(
    args: Prisma.NotificationFindManyArgs,
  ): Promise<Notification[]> {
    return this.prisma.notification.findMany(args);
  }

  async count(args: Prisma.NotificationCountArgs): Promise<number> {
    return this.prisma.notification.count(args);
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}
