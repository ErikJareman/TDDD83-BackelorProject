/* eslint-disable prettier/prettier */
import $ from 'jquery';

import { logOut, toggleNavbar, isStudent } from './core/auth';
import { clickDeleteRoom, clickLeaveRoom, createTicket, submitCreateRoom, joinRoomByID } from './features/rooms';
import { initiateRouter, navigateTo } from './core/router';
import { addAdmin, deleteAdmin } from './features/subscription';



const main = () => {
    // TODO lite oklart vilka grejer som ska ligga här eller i addEventListener
    toggleNavbar();
    initiateRouter();

    //$('#SendRegister').on('click', createUser);
    //$('#schoolReg').on('click', createSchool);
    //$('#schoolLogin').on('click', loginSchool);
    //$('#SendLogin').on('click', logIn);
    $('#join-room').on('click', joinRoomByID);
    $('#skapa-ticket').on('click', createTicket);
    $('#create-room').on('click', submitCreateRoom);
    $('#leave-room').on('click', clickLeaveRoom);
    $('#customer-page').on('click', function () {
        navigateTo('/customer-page');
        window.location.reload();
    });
    $('#delete-room').on('click', clickDeleteRoom);
    $('#logout-button').on('click', logOut);
    $('#add-admin-modal').on('click', addAdmin);
    $('#delete-admin-modal').on('click', deleteAdmin);

    $('.goHome').on('click', function () {
        $('#hero-button').toggleClass('d-none', isStudent());
    });
    $('#hero-button').toggleClass('d-none', isStudent());

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
