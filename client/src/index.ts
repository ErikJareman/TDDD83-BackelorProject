import $ from 'jquery';
import env from './shared/env';
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

function createUser(){
    const email = $<HTMLInputElement>('#InputEmailRegister').val();
    const password = $<HTMLInputElement>('#InputPasswordRegister').val();
    const username = $<HTMLInputElement>('#InputUsernameRegister').val();
    const checked = $<HTMLInputElement>('#invalidCheck2').val();
    try{
        const result = standardPost("/register", {
            "username": username,
            "email": email,
            "password": password
        })
      
        navigateTo("/login")
    } catch(e) {
        // TODO
    }   
}

function logIn(){
    const email = $<HTMLInputElement>('#InputEmail').val();
    const password = $<HTMLInputElement>('#InputPassword').val();
    try{
        const result = standardPost("/login", {
            "email": email,
            "password": password
        })
        sessionStorage.setItem('auth', JSON.stringify(result));
        console.log(result);
        navigateTo("/")

        // TODO, navigate
    } catch(e) {
        window.location.reload();
        alert("Felaktig email eller lösenord. Försök igen eller registrera dig.");
    }  
}

const main = () => {
    initiateRouter();
    $("#SendRegister").on("click",createUser);
    $("#SendLogin").on("click",logIn);
};

$(main);



