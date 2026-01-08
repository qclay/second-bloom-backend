export interface IAwsService {
    uploadFile(file: Buffer, key: string, contentType: string): Promise<string>;
    deleteFile(key: string): Promise<boolean>;
    getFileUrl(key: string): string;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}
