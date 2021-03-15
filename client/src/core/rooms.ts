import { EndPoints } from './endpoints';
import { getSingle } from './server.service';

export interface Room {
    id: string;
    name: string;
}

export const getRoom = async (id: string): Promise<Room> => {
    return getSingle<Room>(EndPoints.Rooms, id);
};
