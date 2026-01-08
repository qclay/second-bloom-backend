export interface ISmsService {
    sendOtp(phoneNumber: string, code: string): Promise<boolean>;
    sendMessage(phoneNumber: string, message: string): Promise<boolean>;
}
