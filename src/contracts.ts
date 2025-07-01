export type MediaFileInfo = {
    filePath?: string;
    mimeType?: string;
    telegramFileId: string;
    fileUniqueId: string;
}

export type VideoFileInfo = MediaFileInfo & {
    thumbnail?: MediaFileInfo;
}

export type UploadWarnings = { photo_upload?: string, video_upload?: string };

export interface MediaHandleResult {
    success: boolean;
    warning?: string;
}

export interface IssueData {
    equipmentTypeId: number;
    equipmentBrandId: number;
    serialNumber: string;
    title: string;
    description: string;
    images: MediaFileInfo[];
    video?: VideoFileInfo;
    filled: boolean;
}

export interface UserContact {
    name: string;
    phone_number: string;
    email: string;
    filled: boolean;
}

export interface IssueCreatedData {
    id: number;
    number: string;
    url: string;
}

export interface AuthorizationData {
    type: 'Basic' | 'Bearer';
    token?: string;
}