import { EndPoints } from './endpoints';
import { navigateTo } from './router';
import { getMultiple, getSingle, standardPost } from './server.service';

export interface Room {
    id: string;
    name: string;
}

export const getTickets = async () => {
    return getMultiple(EndPoints.Rooms);
};

function ticketTemplate(ticket) {
    return `<div>Testtext</div>`;
}

export async function displayTickets() {
    const tickets = await getTickets();
    //console.log(tickets);
    const ticketListElement = $('#ticket-list');
    ticketListElement.empty();
    for (const ticket of tickets) {
        ticketListElement.append(ticketTemplate(ticket));
    }
}

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
        navigateTo('/rooms');
        displayTickets();
    } catch (e) {
        console.log('test3');
        // TODO
    }
    console.log('test4');
}
