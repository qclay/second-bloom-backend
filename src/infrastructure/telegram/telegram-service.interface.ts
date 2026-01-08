export interface ITelegramService {
  sendOtp(phoneNumber: string, code: string): Promise<boolean>;
  sendMessage(message: string): Promise<boolean>;
  sendFormattedMessage(phoneNumber: string, code: string): Promise<boolean>;
}
