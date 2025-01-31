import { AxiosResponse } from 'axios';
import API from 'config/baseURL';
import { useCallback } from 'react';
import { IUser } from 'types';
import apiURL from 'utils/api-url';
import { isStatusNotFound, isStatusSuccess } from 'utils/payload-status';

export type TErrorCallback = (type: 'error' | 'not-found' | 'not-admin') => void;
export interface IOrgData {
    verified: boolean;
    id: number;
    name: string;
}

export interface IData {
    user: IUser;
    organisation: IOrgData;
}

export const useOrganisation = (onError?: TErrorCallback) => {
    return useCallback(
        async (orgId?: string) => {
            const userResponse: AxiosResponse<IUser> = await API.get(apiURL.user);
            if (isStatusSuccess(userResponse.status)) {
                const orgResponse: AxiosResponse<IOrgData> = await API.get(apiURL.getOrganization(orgId));
                if (isStatusSuccess(orgResponse.status)) {
                    if (userResponse.data.organizationId.toString() !== orgId?.toString() || !userResponse.data.isAdmin) {
                        return onError?.('not-admin');
                    }
                    return {
                        organisation: { ...orgResponse.data },
                        user: { ...userResponse.data },
                    };
                } else if (isStatusNotFound(orgResponse.status)) {
                    onError?.('not-found');
                } else {
                    onError?.('error');
                }
            } else {
                onError?.('not-admin');
            }
        },
        [onError],
    );
};
