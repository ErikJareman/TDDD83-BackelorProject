import $ from 'jquery';

export enum Endpoints {
    Cars = 'cars',
}

export const getRequest = async (endpoint: Endpoints, parameters?: string) => {
    return $.ajax();
};
