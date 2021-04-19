import $ from 'jquery';
import env from '../shared/env';
import { authHeader, getToken } from './auth.service';
import { EndPoints } from './endpoints';

export type Stringable = number | string;

const defaultHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = getToken();
    if (token) {
        headers['Authorization'] = authHeader(token);
    }
    return headers;
};

const addHost = (endpoint: string): string => {
    return `${env.backendURL}${endpoint}`;
};

const addParameters = (baseURL: string, parameters?: Record<string, Stringable>) => {
    if (!parameters) {
        return baseURL;
    }
    const url = new URL(baseURL);
    for (const key in parameters) {
        url.searchParams.set(key, parameters[key].toString());
    }
    return url.toString();
};

export const getMultiple = async <T>(endpoint: EndPoints, parameters?: Record<string, Stringable>): Promise<T[]> => {
    const data = await standardGet(endpoint, parameters);
    return data;
};

export const getSingle = async <T>(
    endpoint: EndPoints,
    id: Stringable,
    parameters?: Record<string, Stringable>,
): Promise<T> => {
    const data = await standardGet(`${endpoint}/${id}`, parameters);
    return data;
};

export const standardPost = async (endpoint: EndPoints | string, data?: any) => {
    const requestSettings = {
        data: JSON.stringify(data),
        type: 'POST',
        url: addHost(endpoint),
        headers: defaultHeaders(),
    };
    return $.ajax(requestSettings);
};

export const standardPut = async (endpoint: EndPoints | string, id: Stringable, data?: any) => {
    const requestSettings = {
        data: JSON.stringify(data),
        type: 'PUT',
        url: `${addHost(endpoint)}/${id}`,
        headers: defaultHeaders(),
    };
    return $.ajax(requestSettings);
};

export const standardGet = async (endpoint: EndPoints | string, parameters?: Record<string, Stringable>) => {
    const requestSettings = {
        type: 'GET',
        url: addParameters(addHost(endpoint), parameters),
        headers: defaultHeaders(),
    };
    return $.ajax(requestSettings);
};

export const standardDelete = async (endpoint: string, data?: any) => {
    const requestSettings = {
        url: addHost(endpoint),
        type: 'DELETE',
        headers: defaultHeaders(),
        data: JSON.stringify(data),
    };
    return $.ajax(requestSettings);
};
