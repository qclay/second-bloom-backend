export interface SocketDeviceMetadata {
  userId: string;
  socketId: string;
  connectedAt: number;
  lastActivity: number;
  deviceInfo: {
    userAgent?: string;
    ipAddress?: string;
    deviceId?: string;
    platform?: string;
  };
}
