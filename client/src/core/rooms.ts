import $ from 'jquery';

export interface Room {
    id: string;
    name: string;
}

export const getRoom = async (id: string): Promise<Room> => {
    return $.ajax();
};
