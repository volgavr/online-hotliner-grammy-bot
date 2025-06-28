/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { AuthorizationData, IssueCreatedData, IssueData, UserContact } from "./contracts";
import helper from "./helper";
import { ENDPOINT_BASE_URL } from "./consts";

interface HttpRequestResult<T> {
    success: boolean,
    data: T,
    status?: string,
    error?: string, 
    requestError?: string
}

export async function tryGetBrand(brand_name: string): Promise<HttpRequestResult<{id?:number, title?: string}>> {
    try {
        const response = await axios.get(`${ENDPOINT_BASE_URL}/IssueApi/GetBrand/${brand_name}`);
        return {
            success: helper.isStatusOk(response.status),
            data: response.data,
            status: response.statusText,
        }
    } catch (error: any) {
        return {
            success: false,
            data: {},
            error: error.message
        };
    }
}

export async function trySendVerificationCode(phone_number: string): Promise<HttpRequestResult<object>> {
    try {
        const response = await axios.post(`${ENDPOINT_BASE_URL}/IssueApi/SendVerificationCode?number=${phone_number}`); //Отправляем через query params!
        return {
            success: helper.isStatusOk(response.status) && response.data['success'],
            data: response.data,
            status: response.statusText,
        }
    } catch (error: any) {
        return {
            success: false,
            data: {},
            error: error.message
        };
    }
}

export async function tryVerifyPhoneNumber(phone_number: string, code: string): Promise<HttpRequestResult<object>> {
    try {
        const response = await axios.post(`${ENDPOINT_BASE_URL}/IssueApi/VerifyNumber?number=${phone_number}&code=${code}`); //Отправляем через query params!
        return {
            success: helper.isStatusOk(response.status) && response.data['success'],
            data: response.data,
            status: response.statusText
        }
    } catch (error: any) {
        return {
            success: false,
            data: {},
            error: error.message
        };
    }
}

export async function tryCreateIssue(issue: IssueData, user: UserContact, auth: AuthorizationData ): Promise<HttpRequestResult<IssueCreatedData | null>> {
    try {
        const response = await axios.post(`${ENDPOINT_BASE_URL}/IssueApi/CreateIssue`,
            {...issue, user: user },
            {
                headers: {
                    Authorization: `${auth.type} ${auth.token}`,
                },
            }
        );
        return {
            success: helper.isStatusOk(response.status) && response.data['success'],
            data: response.data['data'],
            status: response.statusText
        }
    } catch (error: any) {
        return {
            success: false,
            data: null,
            error: error.message
        };
    }
}