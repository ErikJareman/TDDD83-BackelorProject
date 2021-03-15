import $ from 'jquery';
import { initiateRouter, navigateTo } from './core/router';
import { standardPost } from './core/server.service';

// Interfaces är lite annorlunda från Java
// Här används de ofta för att beskriva ett object {}
interface testType {
    test: string;
    age: number;
}

// Arrow function med typer för parametrar och output
const createHTML = (input: testType): string => {
    return `
    <p>${input.test}</p>
    <p>Jag är ${input.age} år gammal.</p>
    `;
};

async function createUser(){
    var email = document.getElementById("InputEmailRegister").value;
    var password = document.getElementById("InputPasswordRegister").value;
    var username = document.getElementById("InputUsernameRegister").value;
    var checked = document.getElementById("invalidCheck2").value;
    try{
        const result = await standardPost("/register", {
            "username": username,
            "email": email,
            "password": password
        })
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
        const result = await standardPost('/login', {
            email: email,
            password: password,
        });
        sessionStorage.setItem('auth', JSON.stringify(result));
        console.log(result);
        // TODO, navigate
    } catch(e) {
        window.location.reload();
        alert("Felaktig email eller lösenord. Försök igen eller registrera dig.");
    }  
}

const main = () => {
    loadQueueRoom();
    initiateRouter();
    $('#SendRegister').on('click', createUser);
    $('#SendLogin').on('click', logIn);
};

function injectHTML(selector: any) {
    const HTML = $(selector).html();
    $('#container').html(HTML);
}

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
