import $ from 'jquery';

export enum Endpoints {
    Rooms = 'rooms',
}

export const getRequest = async (endpoint: Endpoints, parameters?: string) => {
    return $.ajax();
};
