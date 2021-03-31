/* eslint-disable prettier/prettier */
import $ from 'jquery';

import { createUser, logIn, createSchool, loginSchool, writeAdmins } from './core/auth.service';
import { clickDeleteRoom, clickLeaveRoom, createTicket, submitCreateRoom } from './core/rooms';
import { initiateRouter, navigateTo } from './core/router';
import { loadStripe } from '@stripe/stripe-js';
import env from './shared/env';

const price_p_plus = 'price_1IZul8C7I9l3XQtcLw7OrDIH';
const price_p = 'price_1IZujvC7I9l3XQtc72Uq6LU0';
const price_s_plus = 'price_1IZuj4C7I9l3XQtctx3PtUWs';
const price_s = 'price_1IZuh5C7I9l3XQtcrkJwn759';

async function createCheckoutSession(priceId: string) {
    const stripe = await loadStripe(
        'pk_test_51IZucCC7I9l3XQtcR3FGS1YEe7UL8EKRsjyToCtFDD8RRQscOLlcoYbFHuIiTieCyj0K0rtLLPU6x74rLtqbzOlo00ODxOZOmn',
    );

    fetch(env.backendURL + 'create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
        },
        body: JSON.stringify({
            priceId: priceId,
        }),
    })
        .then(function (response) {
            console.log(response);
            return response.json();
        })
        .then(function (session) {
            console.log(session.session_id);
            return stripe.redirectToCheckout({ sessionId: session.sessionId });
        })
        .then(function (result) {
            // If redirectToCheckout fails due to a browser or network
            // error, you should display the localized error message to your
            // customer using error.message.
            if (result.error) {
                alert(result.error.message);
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

function customerPortal(e) {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    // In production, this should check CSRF, and not pass the session ID.
    // The customer ID for the portal should be pulled from the
    // authenticated user on the server.

    e.preventDefault();
    fetch(env.backendURL + 'customer-portal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
        },
        body: JSON.stringify({
            sessionId: sessionId,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            window.location.href = data.url;
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('You have no current collaboration plan');
            navigateTo('/checkout');
        });
}

function addAdmin() {
    const email = $<HTMLInputElement>('#inputemail').val();

    try {
        const result = fetch(env.backendURL + 'school_admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
            },
            body: JSON.stringify({
                admin_email: email,
            }),
        });
        writeAdmins();
    } catch (e) {
        // TODO
    }
}

const main = () => {
    initiateRouter();
    $('#SendRegister').on('click', createUser);
    $('#schoolReg').on('click', createSchool);
    $('#schoolLogin').on('click', loginSchool);
    $('#SendLogin').on('click', logIn);
    $('#skapa-ticket').on('click', createTicket);
    $('#create-room').on('click', submitCreateRoom);
    $('#leave-room').on('click', clickLeaveRoom);
    $('#premium_plus').on('click', function () {
        createCheckoutSession(price_p_plus);
    });
    $('#premium').on('click', function () {
        createCheckoutSession(price_p);
    });
    $('#standard_plus').on('click', function () {
        createCheckoutSession(price_s_plus);
    });
    $('#standard').on('click', function () {
        createCheckoutSession(price_s);
    });
    $('#customer_portal').on('click', customerPortal);
    $('#add-admin-modal').on('click', addAdmin);

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
