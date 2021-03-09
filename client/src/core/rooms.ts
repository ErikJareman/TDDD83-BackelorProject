import $ from 'jquery';
import { Endpoints, getRequest } from './server';

export interface Room {
    id: string;
    name: string;
}

export const getRoom = async (id: string): Promise<Room> => {
    return getRequest(Endpoints.Rooms);
};
