import $ from 'jquery';
import { initiateRouter, navigateTo } from './core/router';
import { standardPost } from './core/server.service';

async function createUser() {
    const email = $<HTMLInputElement>('#InputEmailRegister').val();
    const password = $<HTMLInputElement>('#InputPasswordRegister').val();
    const username = $<HTMLInputElement>('#InputUsernameRegister').val();
    try {
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
        const result = await standardPost('/login', {
            email: email,
            password: password,
        });
        sessionStorage.setItem('auth', JSON.stringify(result));
        console.log(result);
        // TODO, navigate
    } catch (e) {
        // TODO
    }
}

const main = () => {
    initiateRouter();
    $('#SendRegister').on('click', createUser);
    $('#SendLogin').on('click', logIn);
};

$(main);
