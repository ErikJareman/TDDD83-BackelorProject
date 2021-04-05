import { getUserID } from './auth';
import { EndPoints } from './endpoints';
import { getMultiple, getSingle, standardDelete, standardPost } from './server';
import { User } from './User';
import $ from 'jquery';

export interface Room {
    id: number;
    name: string;
    tickets: Ticket[];
    members: User[];
    admins: User[];
}

export interface Ticket {
    id: number;
    ticket_info: string;
    room: number;
    creator: User;
}

export const getTickets = async () => {
    return getMultiple(EndPoints.Rooms);
};

function ticketTemplate(ticket: Ticket, position: number) {
    return `<div class="ticket-ticket">
    <div id=ticket_number>
        ${position}.
    </div>
    <div id=ticket_creator>
        ${ticket.creator.username}
    </div> 
    <div class="grid", id=ticket_tags>
        <div class="tags_1">
            <span class="badge badge-info tags-badge1">New</span>
        </div>
        <div class="tags_2">
            <span class="badge badge-info tags-badge2">New</span>
        </div>
        <div class="tags_3">
            <span class="badge badge-info tags-badge3">New</span>
        </div>
        <div class="tags_4">
            <span class="badge badge-info tags-badge4">New</span>
        </div>
    </div>
    <div id=ticket_meta_data>
        dattaaaaaaa
    </div>
</div>`;
}

const noRoomSelected = async () => {
    const roomList = await listRooms();
    if (roomList.length !== 0) {
        loadRoom(roomList[0].id);
    }
};

const memberTemplate = (member: User) => `<div class="card ">${member.username}</div>`;

const ifIsAdmin = () => {
    $('#delete-room').removeClass('d-none');
};

const ifNotAdmin = () => {
    $('#delete-room').addClass('d-none');
};

const loadRoom = async (id: number) => {
    const hash = `#${id}`;
    if (history.pushState) {
        history.pushState(null, null, hash);
    } else {
        location.hash = hash;
    }
    const buttons = $('button.left-button');
    buttons.removeClass('btn-secondary').addClass('btn-outline-secondary');

    buttons
        .filter(function () {
            return $(this).data('id') == id;
        })
        .addClass('btn-secondary')
        .removeClass('btn-outline-secondary');

    const res = await getRoom(id);

    const room = res.room;

    if (res.joined) {
        loadRoomList();
    }

    console.log({ room });
    $('h5.special').text(room.name);
    // Add tickets
    const ticketListElement = $('#ticket-list');
    ticketListElement.empty();
    room.tickets.forEach((ticket, index) => ticketListElement.append(ticketTemplate(ticket, index + 1)));

    const memberListElement = $('#member-list');
    memberListElement.empty();
    room.members.forEach((member) => memberListElement.append(memberTemplate(member)));

    const adminMemberListElement = $('#admin-list');
    adminMemberListElement.empty();
    room.admins.forEach((member) => adminMemberListElement.append(memberTemplate(member)));

    const userID = getUserID();
    const selfAdmin = room.admins.findIndex((member) => member.id === userID);
    if (selfAdmin !== -1) {
        ifIsAdmin();
    } else {
        ifNotAdmin();
    }
};

const loadRoomList = async () => {
    const roomList = await listRooms();
    const list = $('#roomList').first();

    list.empty();
    for (const room of roomList) {
        list.append(`<button type="button" class="btn btn-outline-secondary left-button" data-id=${room.id}>
        ${room.name}
    </button>`);
    }
    const buttons = $<HTMLButtonElement>('button.left-button');
    buttons.off();
    buttons.on('click', clickLeftButton);
};

export const loadRoomPage = async () => {
    loadRoomList();
    const selectedRoom = getRoomIDFromURL();
    if (!selectedRoom) {
        noRoomSelected();
    } else {
        loadRoom(selectedRoom);
    }
};

export const submitCreateRoom = async (event: JQuery.ClickEvent) => {
    const name = $<HTMLInputElement>('#room-name-input').val() as string;

    const res = await createRoom({ name });
    loadRoom(res.id);
    loadRoomList();
};

export const createRoom = (room: Partial<Room>): Promise<Room> => {
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
    const roomID = getRoomIDFromURL();
    const name = $<HTMLInputElement>('#name-ticket-ref').val();
    const tag_1 = $<HTMLInputElement>('#modal-tag-1').val();
    const tag_2 = $<HTMLInputElement>('#modal-tag-2').val();
    const tag_3 = $<HTMLInputElement>('#modal-tag-3').val();
    const tag_4 = $<HTMLInputElement>('#modal-tag-4').val();
    const ticket_info = $<HTMLInputElement>('#ticket-descp').val();
    console.log('test1');

    await standardPost(EndPoints.Tickets, {
        room: roomID,
        ticket_info,
    });
    loadRoom(roomID);
}

export const getRoom = async (id: number): Promise<{ room: Room; joined: boolean }> => getSingle(EndPoints.Rooms, id);

export const enterRoomPage = async () => {
    loadRoomPage();
};

export function clickLeftButton(event: JQuery.ClickEvent<HTMLButtonElement>) {
    event.preventDefault();
    const id = $(this).data('id');
    loadRoom(id);
}

export const clickDeleteRoom = async () => {
    await standardDelete(EndPoints.Rooms, getRoomIDFromURL());
    noRoomSelected();
    loadRoomList();
};

export const clickLeaveRoom = async () => {
    await standardPost(`/${EndPoints.LeaveRoom}/${getRoomIDFromURL()}`);
    noRoomSelected();
    loadRoomList();
};
