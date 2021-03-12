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

async function createUser(){
    var email = document.getElementById("InputEmailRegister").value;
    var password = document.getElementById("InputPasswordRegister").value;
    var username = document.getElementById("InputUsernameRegister").value;
    try{
        alert("hej")
        const result = await standardPost("/register", {
            "username": username,
            "email": email,
            "password": password
        })
        console.log(result);
        navigateTo("/login")
    } catch(e) {
        // TODO
    }
    
}

async function logIn(){
    console.log("hej");
    var email = document.getElementById("InputEmail").value;
    var password = document.getElementById("InputPassword").value;
    try{
        const result = await standardPost("/login", {
            "email": email,
            "password": password
        })
        sessionStorage.setItem('auth', JSON.stringify(result));
        console.log(result);
        // TODO, navigate
    } catch(e) {
        // TODO
    }
}

const main = () => {
    initiateRouter();
    $("#SendRegister").on("click",createUser);
    $("#SendLogin").on("click",logIn);
};

$(main);



