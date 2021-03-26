import $ from 'jquery';
import { createUser, logIn } from './core/auth.service';
import { clickDeleteRoom, clickLeaveRoom, createTicket, submitCreateRoom } from './core/rooms';
import { initiateRouter } from './core/router';
import { loadStripe } from '@stripe/stripe-js';
import env from './shared/env';

async function checkOut() {
    alert('hej');
    const stripe = await loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

    // Create an instance of the Stripe object with your publishable API key

    fetch(env.backendURL + '/create-checkout-session', {
        method: 'POST',
    })
        .then(function (response) {
            console.log(response);
            return response.json();
        })
        .then(function (session) {
            return stripe.redirectToCheckout({ sessionId: session.id });
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

const main = () => {
    initiateRouter();
    $('#SendRegister').on('click', createUser);
    $('#SendLogin').on('click', logIn);
    $('#skapa-ticket').on('click', createTicket);
    $('#create-room').on('click', submitCreateRoom);
    $('#leave-room').on('click', clickLeaveRoom);
    $('#checkout-button').on('click', checkOut);
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
