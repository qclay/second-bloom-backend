import { Notification, Prisma } from '@prisma/client';

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  create(data: Prisma.NotificationCreateInput): Promise<Notification>;
  update(
    id: string,
    data: Prisma.NotificationUpdateInput,
  ): Promise<Notification>;
  delete(id: string): Promise<Notification>;
  findMany(args: Prisma.NotificationFindManyArgs): Promise<Notification[]>;
  count(args: Prisma.NotificationCountArgs): Promise<number>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<number>;
  getUnreadCount(userId: string): Promise<number>;
}
