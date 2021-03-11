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
    var name = document.getElementById("register-name").value;
    var email = document.getElementById("register-email").value;
    var password = document.getElementById("register-password").value;
    $.ajax({
        url: env.backendURL + '/sign-up',
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({
            "name": name,
            "email": email,
            "password": password
        }),
        success: function(){
            $(".container").html($("#view-home").html());
        }
    })
}

function logIn(){
    var email = document.getElementById("register-email").value;
    var password = document.getElementById("register-password").value;
    $.ajax({
        url: host + '/login',
        type: 'POST',
        dataType: "json",
        contenttype: 'application/json',
        data: JSON.stringify({
            "email": email,
            "password": password
        }),
        success: function(result){
            sessionStorage.setItem('auth', JSON.stringify(result));
            window.location.reload();
            console.log(result);
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
