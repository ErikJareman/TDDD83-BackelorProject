import $ from 'jquery';

import { navigateTo } from './router';
import { standardPost } from './server';
import jwt_decode from 'jwt-decode';
import { User } from './User';

export interface JWTData {
    fresh: boolean;
    iat: number;
    jti: string;
    nbf: number;
    type: string;
    sub: Identity;
}

export interface Identity {
    user: number;
}

const tokenName = 'auth';

export const authHeader = (token: any) => `Bearer ${token}`;

export const saveToStorage = (data: any) => {
    sessionStorage.setItem(tokenName, JSON.stringify(data));
};

export const getToken = () => JSON.parse(sessionStorage.getItem(tokenName))?.token;

export const getUser = (): Promise<User | null> => {
    const auth = sessionStorage.getItem('auth');
    if (auth) {
        return JSON.parse(auth).user;
    }
};

async function getUserEmail(): Promise<string> {
    const email = (await getUser())?.email;
    return email;
}

async function fillEmail() {
    if (isSignedIn()) {
        $('#fillemail').html(await getUserEmail());
    }
}

export const getUserID = () => jwt_decode<JWTData>(getToken()).sub.user;

export const hasToken = () => !!getToken();

export async function createUser(event: { preventDefault: () => void }) {
    event.preventDefault();
    const email = $<HTMLInputElement>('#InputEmailRegister').val();
    const password = $<HTMLInputElement>('#InputPasswordRegister').val();
    const username = $<HTMLInputElement>('#InputUsernameRegister').val();
    const confirmedPassword = $<HTMLInputElement>('#InputPasswordRegisterConfirm').val();
    const checked = $<HTMLInputElement>('#invalidCheck2').val();
    try {
        const result = await standardPost('/register', {
            username,
            email,
            password,
            confirmedPassword,
        });
        navigateTo('/login');
    } catch (e) {
        alert('The passwords did not match. Try again!');
    }
}

export function toggleNavbar() {
    const signedIn = isSignedIn();
    const student = isStudent();

    $('#login-button').toggleClass('d-none', signedIn);
    $('#register-button').toggleClass('d-none', signedIn);
    $('#drop_down').toggleClass('d-none', !signedIn);
    $('#logout-button').toggleClass('d-none', !signedIn);
    $('#room-button').toggleClass('d-none', !student);
    $('#buying-button').toggleClass('d-none', student);
    $('#buying-button-footer').toggleClass('d-none', student);
    $('#checkout-button').toggleClass('d-none', !isSchool());
    fillEmail();
}

export function isSchool() {
    const typeOfAccount = sessionStorage.getItem(tokenName);
    if (!typeOfAccount) {
        return false;
    }
    const data = JSON.parse(typeOfAccount);
    return data.school != null;
}

export function isStudent() {
    const typeOfAccount = sessionStorage.getItem(tokenName);
    if (!typeOfAccount) {
        return false;
    }
    const data = JSON.parse(typeOfAccount);
    return data.user != null;
}

export function isSignedIn() {
    const signedIn = sessionStorage.getItem(tokenName);
    return signedIn != null;
}

export function logOut(event: { preventDefault: () => void }) {
    event.preventDefault();
    sessionStorage.removeItem(tokenName);
    toggleNavbar();
    navigateTo('/');
}

export async function logIn(event: { preventDefault: () => void }) {
    event.preventDefault();
    const email = $<HTMLInputElement>('#InputEmail').val();
    const password = $<HTMLInputElement>('#InputPassword').val();
    try {
        const result = await standardPost('/login', {
            email: email,
            password: password,
        });
        sessionStorage.setItem('auth', JSON.stringify(result));
        toggleNavbar();
        if (isStudent()) {
            navigateTo('/r');
        } else if (isSchool()) {
            if (result.school.sub_id != null) {
                navigateTo('/customer-page');
            } else {
                navigateTo('/checkout');
            }
        }
        // TODO, navigate
    } catch (e) {
        alert('Felaktig email eller lösenord. Försök igen eller registrera dig.');
    }
}

export async function createSchool(event: { preventDefault: () => void }) {
    event.preventDefault();
    const name = $<HTMLInputElement>('#schoolName').val();
    const email = $<HTMLInputElement>('#contactEmail').val();
    const password = $<HTMLInputElement>('#schoolPassword').val();
    const confirmedPassword = $<HTMLInputElement>('#schoolPasswordConfirm').val();
    console.log(name, email, password);
    try {
        const result = await standardPost('/registerschool', {
            name,
            email,
            password,
            confirmedPassword,
        });
        navigateTo('/login');
    } catch (e) {
        alert('The passwords did not match. Try again!');
    }
}
