import { parseJSON } from 'jquery';
import { getUser, getUserID } from './auth.service';
import { EndPoints } from './endpoints';
import { navigateTo } from './router';
import { getMultiple, getSingle, standardDelete, standardPost } from './server.service';
import { User } from './User';
import copy from 'copy-to-clipboard';

//TODO
//Lägg till isAdmin(userID) metod / liknande och använd där det behövs (TODO finns på dessa ställen)
//Se till så att isAdmin fältet är uppdaterat på varje user (dvs user.email finns i "premiumdatabasen")
//Delete-room knappen har fukkat ur(?)

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
    ticket_zoom: string;
    room: number;
    creator: User;
}

export const getTickets = async () => {
    return getMultiple(EndPoints.Rooms);
};

function ticketTemplate(ticket: Ticket, position: number, room: Room) {
    const userID = getUserID();
    const selfAdmin = room.admins.findIndex((member) => member.id === userID);
    if (selfAdmin !== -1 || ticket.creator.id == userID) {
        return `<div class="ticket-ticket">
                    <div id=ticket_number>
                        ${position}.
                    </div>
                    <div id=ticket_creator>
                        ${ticket.creator.username}
                    </div> 
                    <div id=ticket_info>
                        ${ticket.ticket_info}
                    </div>
                        <a href='${ticket.ticket_zoom}' id="ticket-zoom-admin" target="_blank">ZOOM</a>
                    <button type="button" class="btn close delete-ticket-button" data-id=${ticket.id}>
                        x
                    </button>
                </div>`;
    } else {
        return `<div class="ticket-ticket">
            <div id=ticket_number>
                ${position}.
            </div>
            <div id=ticket_creator>
                ${ticket.creator.username}
            </div> 
            <div id=ticket_info>
                ${ticket.ticket_info}
            </div>
                <a href='${ticket.ticket_zoom}' id="ticket_zoom" target="_blank">ZOOM</a>
            </div>`;
    }
}

const noRoomSelected = async () => {
    const roomList = await listRooms();
    if (roomList.length !== 0) {
        loadRoom(roomList[0].id);
    }
};

const memberTemplate = (member: User, room: Room) => {
    const userID = getUserID();
    const selfAdmin = room.admins.findIndex((member) => member.id === userID);
    if (selfAdmin == -1 || !member.is_premium) {
        return `<div class="card right-side-room-card">${member.username}</div>`;
    } else {
        return `<div class="dropdown">
                    <button class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split dropdownMenuRightRoomSide" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        ${member.username}
                    </button>
                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuPromote">
                        <button class="dropdown-item button-admin-promote" type="button" data-id=${member.id}>Promote</button>
                        <button class="dropdown-item" type="button">Ban user</button>
                    </div>
                </div>`;
    }
};

const adminTemplate = (member: User, room: Room) => {
    const userID = getUserID();
    const selfAdmin = room.admins.findIndex((member) => member.id === userID);
    if (selfAdmin == -1 || room.admins.length === 1) {
        return `<div class="card right-side-room-card">${member.username}</div>`;
    } else {
        return `<div class="dropdown">
                    <button class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split dropdownMenuRightRoomSide" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span id="superSpan">${member.username}</span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuDemote">
                        <button class="dropdown-item button-admin-demote" type="button" data-id=${member.id}>Demote</button>
                        <button class="dropdown-item" type="button">Ban user</button>
                    </div>
                </div>`;
    }
};

const isPremiumUser = async () => {
    return (await getUser()).is_premium;
};

const ifIsAdmin = () => {
    $('#delete-room').removeClass('d-none');
};

const ifNotAdmin = () => {
    $('#delete-room').addClass('d-none');
};

const createNewRoomButtonTemplate = () => {
    return `<button id="create_room" class="btn primary-button" data-toggle="modal" data-target="#newRoomModal">Create room</button>`;
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

    //TODO
    //Fixa så att rums-knappen är "intryckt" på reload av page, inte bara efter varje funktion
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

    $('h5.special').text(room.name);

    const ticketListElement = $('#ticket-list');
    ticketListElement.empty();
    room.tickets.forEach((ticket, index) => ticketListElement.append(ticketTemplate(ticket, index + 1, room)));

    const memberListElement = $('#member-list');
    memberListElement.empty();
    room.members.forEach((member) => memberListElement.append(memberTemplate(member, room)));

    const adminMemberListElement = $('#admin-list');
    adminMemberListElement.empty();
    room.admins.forEach((member) => adminMemberListElement.append(adminTemplate(member, room)));

    const shareLinkButton = $<HTMLButtonElement>('#room-link');
    shareLinkButton.off();
    shareLinkButton.on('click', onShareModalOpen);

    const copyLinkButton = $<HTMLButtonElement>('#copy-link-button');
    copyLinkButton.off();
    copyLinkButton.on('click', copyRoomLink);

    const promotebuttons = $<HTMLButtonElement>('.button-admin-promote');
    promotebuttons.off();
    promotebuttons.on('click', promoteMember);

    const demotebuttons = $<HTMLButtonElement>('.button-admin-demote');
    demotebuttons.off();
    demotebuttons.on('click', demoteMember);

    const deleteTicketButtons = $<HTMLButtonElement>('.delete-ticket-button');
    deleteTicketButtons.off();
    deleteTicketButtons.on('click', deleteTicket);

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
    buttons.removeClass('btn-secondary').addClass('btn-outline-secondary');

    buttons
        .filter(function () {
            return $(this).data('id') == getRoomIDFromURL();
        })
        .addClass('btn-secondary')
        .removeClass('btn-outline-secondary');
    buttons.off();
    buttons.on('click', clickLeftButton);
};

const loadRoomPage = async () => {
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
    const ticket_zoom = $<HTMLInputElement>('#modal-zoom').val() as string;
    const ticket_info = $<HTMLInputElement>('#ticket-descp').val() as string;

    await standardPost(EndPoints.Tickets, {
        room: roomID,
        ticket_info,
        ticket_zoom,
    });
    loadRoom(roomID);
}

export const getRoom = async (id: number): Promise<{ room: Room; joined: boolean }> => getSingle(EndPoints.Rooms, id);

export const enterRoomPage = async () => {
    if (await isPremiumUser()) {
        $('#create-room-modal-toggle-button').removeClass('d-none');
    } else {
        $('#create-room-modal-toggle-button').addClass('d-none');
    }

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
    await standardPost(`${EndPoints.LeaveRoom}/${getRoomIDFromURL()}`);
    noRoomSelected();
    loadRoomList();
};

export const onShareModalOpen = () => {
    const url = window.location.href;
    const element = $('.room-link-label');
    element.text(url);
};

export const copyRoomLink = () => {
    copy(window.location.href);
};

export async function promoteMember(event: JQuery.ClickEvent<HTMLButtonElement>) {
    event.preventDefault();
    const memberID = $(this).data('id');
    const roomID = getRoomIDFromURL();
    await standardPost(EndPoints.PromoteMember, {
        room: roomID,
        member: memberID,
    });
    loadRoom(roomID);
}

export async function demoteMember(event: JQuery.ClickEvent<HTMLButtonElement>) {
    event.preventDefault();
    const memberID = $(this).data('id');
    const roomID = getRoomIDFromURL();
    await standardPost(EndPoints.DemoteMember, {
        room: roomID,
        member: memberID,
    });
    loadRoom(roomID);
}

export async function deleteTicket(event: JQuery.ClickEvent<HTMLButtonElement>) {
    event.preventDefault();
    const ticketID = $(this).data('id');
    const roomID = getRoomIDFromURL();
    await standardPost(EndPoints.DeleteTicket, {
        ticket: ticketID,
        room: roomID,
    });
    loadRoom(roomID);
}
