export interface IssueData {
    equipmentTypeId: number;
    equipmentBrandId: number;
    serialNumber: string;
    title: string;
    description: string;
    photos: number[];
    video?: number;
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