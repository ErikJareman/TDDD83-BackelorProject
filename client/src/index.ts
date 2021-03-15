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
    initiateRouter();
    $('#SendRegister').on('click', createUser);
    $('#SendLogin').on('click', logIn);
};

$(main);
