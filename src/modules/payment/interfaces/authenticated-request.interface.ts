import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  phoneNumber: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
