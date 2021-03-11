import $ from 'jquery';
import env from './shared/env';

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
    var email = document.getElementById("InputEmailRegister").value;
    var password = document.getElementById("InputPasswordRegister").value;
    var username = document.getElementById("InputUsernameRegister").value;
    $.ajax({
        url: env.backendURL + '/sign-up',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({
            "username": username,
            "email": email,
            "password": password
        }),
        success: function(){
            console.log("hej");
            //flippa till logga in sidan
        }
    })
}

function logIn(){
    var email = document.getElementById("InputEmail").value;
    var password = document.getElementById("InputPassword").value;
    $.ajax({
        url: env.backendURL + '/login',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({
            "email": email,
            "password": password
        }),
        success: function(result){
            sessionStorage.setItem('auth', JSON.stringify(result));
            window.location.reload();
            console.log(result);
            //flippa till rummen
        }
    })
}

const main = () => {
    const data: testType = {
        test: 'Hello World!',
        age: 12,
    };

    $('#app').html(createHTML(data));
};

$(main);
