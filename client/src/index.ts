import $ from 'jquery';
import { clickLogin, clickRegister } from './core/auth';
import { clickLeaveRoom, createTicket, submitCreateRoom } from './core/rooms';
import { initiateRouter } from './core/router';

const setupEventListeners = () => {
    $('#skapa-ticket').on('click', createTicket);
    $('#create-room').on('click', submitCreateRoom);
    $('#leave-room').on('click', clickLeaveRoom);

    const nav = $('nav');
    $('#mobile-cta').on('click', () => nav.addClass('menu-btn'));
    $('#mobile-exit').on('click', () => nav.removeClass('menu-btn'));
};

const main = () => {
    initiateRouter();
    setupEventListeners();
};

$(main);
