import { EndPoints } from './endpoints';
import { navigateTo } from './router';
import { getMultiple, getSingle, standardPost, Stringable } from './server.service';

export interface Room {
    id: string;
    name: string;
    tickets: Ticket[];
}

export interface Ticket {
    owner: Stringable;
}

export const getTickets = async () => {
    return getMultiple(EndPoints.Rooms);
};

function ticketTemplate(ticket: Ticket) {
    return `<div>${ticket.owner}</div>`;
}

const loadRoom = async () => {
    const room = await getRoom(getRoomIDFromURL());
    const roomList = await listRooms();
    $('h5.special').text(room.name);

    const list = $('#roomList').first();

    list.empty();
    for (const room of roomList) {
        list.append(`<button type="button" class="btn btn-outline-secondary left-button">
        ${room.name}
    </button>`);
    }

    // Add tickets
    const ticketListElement = $('#ticket-list');
    ticketListElement.empty();
    for (const ticket of room.tickets ?? []) {
        ticketListElement.append(ticketTemplate(ticket));
    }
};

export const createRoom = (room: Partial<Room>) => {
    return standardPost(EndPoints.Rooms, room);
};

export const listRooms = async () => getMultiple<Room>(EndPoints.Rooms);

const getRoomIDFromURL = (): number | null => {
    const hash = location.hash;
    if (!hash) {
        return null;
    }
    return parseInt(hash.substring(1));
};

export async function createTicket() {
    const name = $<HTMLInputElement>('#name-ticket-ref').val();
    const tag_1 = $<HTMLInputElement>('#modal-tag-1').val();
    const tag_2 = $<HTMLInputElement>('#modal-tag-2').val();
    const tag_3 = $<HTMLInputElement>('#modal-tag-3').val();
    const tag_4 = $<HTMLInputElement>('#modal-tag-4').val();
    const ticket_info = $<HTMLInputElement>('#ticket-descp').val();
    console.log('test1');
    try {
        await standardPost('/create_ticket', {
            name: name,
            tag_1: tag_1,
            tag_2: tag_2,
            tag_3: tag_3,
            tag_4: tag_4,
            ticket_info: ticket_info,
        });
        console.log('test2');
        loadRoom();
    } catch (e) {
        console.log('test3');
        // TODO
    }
    console.log('test4');
}

export const getRoom = async (id: number) => getSingle<Room>(EndPoints.Rooms, id);

export const enterRoomPage = async () => {
    loadRoom();
};
