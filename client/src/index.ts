import $ from 'jquery';
import { initiateRouter, navigateTo } from './core/router';
import { standardPost } from './core/server.service';

async function createUser() {
    const email = $<HTMLInputElement>('#InputEmailRegister').val();
    const password = $<HTMLInputElement>('#InputPasswordRegister').val();
    const username = $<HTMLInputElement>('#InputUsernameRegister').val();
    try {
        alert('hej');
        const result = await standardPost('/register', {
            username: username,
            email: email,
            password: password,
        });
        console.log(result);
        navigateTo('/login');
    } catch (e) {
        // TODO
    }
}

async function logIn() {
    const email = $<HTMLInputElement>('#InputEmail').val();
    const password = $<HTMLInputElement>('#InputPassword').val();
    try {
        alert('hej');
        console.log('hej');
        const result = await standardPost('/login', {
            email: email,
            password: password,
        });
        sessionStorage.setItem('auth', JSON.stringify(result));
        console.log(result);
        // TODO, navigate
        navigateTo('/rooms');
    } catch (e) {
        window.location.reload();
        alert('Felaktig email eller lösenord. Försök igen eller registrera dig.');
    }
}

const main = () => {
    //loadQueueRoom();
    initiateRouter();
    $('#SendRegister').on('click', createUser);
    $('#SendLogin').on('click', logIn);
};

function injectHTML(selector: any) {
    const HTML = $(selector).html();
    $('#container').html(HTML);
}

//Function for creating ticket
async function createTicket() {
    const name = $<HTMLInputElement>('#ticket-name').val();
    const tag1 = $<HTMLInputElement>('#modal-tag-1').val();
    const tag2 = $<HTMLInputElement>('#modal-tag-2').val();
    const tag3 = $<HTMLInputElement>('#modal-tag-3').val();
    const tag4 = $<HTMLInputElement>('#modal-tag-4').val();
    const description = $<HTMLInputElement>('#description').val();

    try {
        alert('hej');
        const result = await standardPost('/create_ticket', {
            name: name,
            tag1: tag1,
            tag2: tag2,
            tag3: tag3,
            tag4: tag4,
            description: description,
        });
        console.log(result);
        navigateTo('/rooms');
    } catch (e) {
        // TODO
    }
}/*






/*function ticketTemplate(ticket: any) {
    return `<div class="card car-card">
    <table>
        <tr>
            <td>Märke:</td><td>${car.make}</td>
        </tr>
        <tr>
            <td>Modell:</td><td>${car.model}</td>
        </tr>
        <tr>
            <td>Kund:</td><td>${car.customer ? car.customer.name: 'Kund saknas'}</td>
        </tr>
    </table>
    <br>
    <span>
        <button data-id=${car.id} class="btn btn-primary edit-car" data-toggle="modal" data-target="#editModal">Redigera</button>
        <button data-id=${car.id} class="btn btn-danger delete-car">Ta bort</button>
    </span>
</div>`;
}
function loadTickets() {
    const tickets = server.getTickets();
    const ticketListElement = $("#ticket-list")
    ticketListElement.empty();
    for (ticket of tickets) {
        ticketListElement.append(ticketTemplate(ticket));
    }
    //$(".delete-car").click(clickDelete); add listeners like this...
}


const submitTicketForm = async (event: any) => {
    event.preventDefault();
    const ticket = {
        name: $("#name-input").val(),
        tag_1: $("#tag_1-input").val(),
        tag_2: $("#tag_2-input").val(),
        tag_3: $("#tag_3-input").val(),
        tag_4: $("#tag_4-input").val(),
        ticket_info: $("#ticket-info-input").val()
    }
    //inject-html kö-rum
}*/
function onOpenEdit() {
    //
}

function loadQueueRoom() {
    injectHTML('#view-room');

    $('#editModal').on('show.bs.modal', onOpenEdit);
    //skapa on-click-lyssnare
    //modal-lyssnare som öppnar ticketModal

    //$("#goto-queue-up").click(function (e: any) {
    injectHTML('#view-ticket-form');
    onOpenEdit();
    //    $("#ticket-form").submit(submitTicketForm);
    //})
}

$(main);
