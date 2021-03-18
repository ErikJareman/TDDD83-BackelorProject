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

async function createUser(event){
    event.preventDefault();
    const email = $<HTMLInputElement>('#InputEmailRegister').val();
    const password = $<HTMLInputElement>('#InputPasswordRegister').val();
    const username = $<HTMLInputElement>('#InputUsernameRegister').val();
    const checked = $<HTMLInputElement>('#invalidCheck2').val();
    try {
        const result = await standardPost('/register', {
            username: username,
            email: email,
            password: password,
        });
        navigateTo('/login');
    } catch (e) {
        // TODO
        // Kan det skapas en med samma mail?
    }
}

function isSignedIn(){
    const signedIn = sessionStorage.getItem('auth');
    return signedIn != null;
}

function logOut(event){
    event.preventDefault();
    sessionStorage.removeItem('auth');
    navigateTo('/');
}

async function logIn(event) {
    event.preventDefault();
    const email = $<HTMLInputElement>('#InputEmail').val();
    const password = $<HTMLInputElement>('#InputPassword').val();
    try {
        const result = await standardPost('/login', {
            email: email,
            password: password,
        });
        sessionStorage.setItem('auth', JSON.stringify(result));
        console.log(result);
        navigateTo('/');

        // TODO, navigate
    } catch (e) {
        alert('Felaktig email eller lösenord. Försök igen eller registrera dig.');
    }
}

const main = () => {
    initiateRouter();
    $('#SendRegister').on('click', createUser);
    $('#SendLogin').on('click', logIn);
};

$(main);
