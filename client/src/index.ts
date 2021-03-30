/* eslint-disable prettier/prettier */
import $ from 'jquery';
import { createUser, logIn } from './core/auth.service';
import { clickDeleteRoom, clickLeaveRoom, createTicket, submitCreateRoom } from './core/rooms';
import { initiateRouter } from './core/router';
import { loadStripe } from '@stripe/stripe-js';
import env from './shared/env';

const price_p_plus = 'price_1IZul8C7I9l3XQtcLw7OrDIH';
const price_p = 'price_1IZujvC7I9l3XQtc72Uq6LU0';
const price_s_plus = 'price_1IZuj4C7I9l3XQtctx3PtUWs';
const price_s = 'price_1IZuh5C7I9l3XQtcrkJwn759';

async function createCheckoutSession(priceId: string) {
    const stripe = await loadStripe('pk_test_51IZucCC7I9l3XQtcR3FGS1YEe7UL8EKRsjyToCtFDD8RRQscOLlcoYbFHuIiTieCyj0K0rtLLPU6x74rLtqbzOlo00ODxOZOmn');

    fetch(env.backendURL + 'create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
            body: JSON.stringify({
            priceId: priceId,
            }),
    }).then(function (response) {
            return response.json();
        })
        .then(function (session) {
            console.log(session.sessionId);
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
    const sessionId = urlParams.get("session_id")
   // let customerId;
    
    // if (sessionId) {
    //   fetch(env.backendURL + "checkout-session?sessionId=" + sessionId)
    //     .then(function(result){
    //       return result.json()
    //     })
    //     .then(function(session){
    //       // We store the customer ID here so that we can pass to the
    //       // server and redirect to customer portal. Note that, in practice
    //       // this ID should be stored in your database when you receive
    //       // the checkout.session.completed event. This demo does not have
    //       // a database, so this is the workaround. This is *not* secure.
    //       // You should use the Stripe Customer ID from the authenticated
    //       // user on the server.
    //       customerId = session.customer;
    
    //       const sessionJSON = JSON.stringify(session, null, 2);
    //       document.querySelector("pre").textContent = sessionJSON;
    //     })
    //     .catch(function(err){
    //       console.log('Error when fetching Checkout session', err);
    //     });
    // }
    
      // In production, this should check CSRF, and not pass the session ID.
      // The customer ID for the portal should be pulled from the 
      // authenticated user on the server.
      
        e.preventDefault();
        fetch(env.backendURL + 'customer-portal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            window.location.href = data.url;
          })
          .catch((error) => {
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
    $('#premium_plus').on('click', function(){
        createCheckoutSession(price_p_plus)
    })
    $('#premium').on('click', function(){
        createCheckoutSession(price_p)
    })
    $('#standard_plus').on('click', function(){
        createCheckoutSession(price_s_plus)
    })
    $('#standard').on('click', function(){
        createCheckoutSession(price_s)
    })
    $('#customer_portal').on('click', customerPortal);


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
