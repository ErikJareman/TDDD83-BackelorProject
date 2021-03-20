import $ from 'jquery';
import { createUser, logIn } from './core/auth.service';
import { clickDeleteRoom, createTicket, submitCreateRoom } from './core/rooms';
import { initiateRouter } from './core/router';

const main = () => {
    initiateRouter();
    $('#SendRegister').on('click', createUser);
    $('#SendLogin').on('click', logIn);
    $('#skapa-ticket').on('click', createTicket);
    $('#create-room').on('click', submitCreateRoom);
    $('#delete-room').on('click', clickDeleteRoom);
    const mobileBtn = document.getElementById('mobile-cta');
    const nav = document.querySelector('nav');
    const mobileBtnExit = document.getElementById('mobile-exit');

    mobileBtn.addEventListener('click', () => {
        nav.classList.add('menu-btn');
    });

    mobileBtnExit.addEventListener('click', () => {
        nav.classList.remove('menu-btn');
    });
};

$(main);
