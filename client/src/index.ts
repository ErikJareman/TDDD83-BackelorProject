import $ from 'jquery';
import { createUser, logIn, logOut, isSignedIn, toggleNavbar } from './core/auth.service';
import { clickDeleteRoom, clickLeaveRoom, createTicket, submitCreateRoom, promoteMember } from './core/rooms';
import { initiateRouter } from './core/router';

const main = () => {
    initiateRouter();
    $('#SendRegister').on('click', createUser);
    $('#SendLogin').on('click', logIn);
    $('#skapa-ticket').on('click', createTicket);
    $('#create-room').on('click', submitCreateRoom);
    $('#leave-room').on('click', clickLeaveRoom);

    $('#logout-button').on('click', logOut);
    toggleNavbar();

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
