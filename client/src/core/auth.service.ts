import { navigateTo } from './router';
import { standardPost } from './server.service';
import jwt_decode from 'jwt-decode';

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

export const authHeader = (token) => `Bearer ${token}`;

export const saveToStorage = (data) => {
    sessionStorage.setItem(tokenName, JSON.stringify(data));
};

export const getToken = () => JSON.parse(sessionStorage.getItem(tokenName))?.token;

export const getUser = () => {
    // TODO
};

export const getUserID = () => jwt_decode<JWTData>(getToken()).sub.user;

export const hasToken = () => !!getToken();

export async function createUser(event) {
    event.preventDefault();
    const email = $<HTMLInputElement>('#InputEmailRegister').val();
    const password = $<HTMLInputElement>('#InputPasswordRegister').val();
    const username = $<HTMLInputElement>('#InputUsernameRegister').val();
    const checked = $<HTMLInputElement>('#invalidCheck2').val();
    try {
        const result = await standardPost('/register', {
            username,
            email,
            password,
        });
        navigateTo('/login');
    } catch (e) {
        // TODO
        // Kan det skapas en med samma mail?
    }
}

export function isSignedIn() {
    const signedIn = sessionStorage.getItem(tokenName);
    return signedIn != null;
}

export function logOut(event) {
    event.preventDefault();
    sessionStorage.removeItem(tokenName);
    navigateTo('/');
}

export async function logIn(event) {
    event.preventDefault();
    const email = $<HTMLInputElement>('#InputEmail').val();
    const password = $<HTMLInputElement>('#InputPassword').val();
    try {
        console.log('hej');
        const result = await standardPost('/login', {
            email: email,
            password: password,
        });
        sessionStorage.setItem('auth', JSON.stringify(result));
        console.log(result);
        navigateTo('/r');

        // TODO, navigate
    } catch (e) {
        alert('Felaktig email eller lösenord. Försök igen eller registrera dig.');
    }
}

export async function createSchool(event) {
    event.preventDefault();
    const name = $<HTMLInputElement>('#schoolName').val();
    const email = $<HTMLInputElement>('#contactEmail').val();
    const password = $<HTMLInputElement>('#schoolPassword').val();
    try {
        const result = await standardPost('/registerschool', {
            name,
            email,
            password,
        });
        navigateTo('/loginschool');
    } catch (e) {
        // TODO
        // Kan det skapas en med samma mail?
    }
}

export async function loginSchool(event) {
    event.preventDefault();
    const email = $<HTMLInputElement>('#contactEmailLogin').val();
    const password = $<HTMLInputElement>('#schoolLoginP').val();
    try {
        const result = await standardPost('/loginschool', {
            email,
            password,
        });
        sessionStorage.setItem('auth', JSON.stringify(result));
        if (result.school.sub_id != null) {
            navigateTo('/customer-page'); //om subscription
        } else {
            navigateTo('/checkout'); //om subscription
        }
    } catch (e) {
        alert('Something went wrong. Try again!');
    }
}
