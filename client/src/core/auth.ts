import { navigateTo } from './router';
import { standardPost } from './server';
import jwt_decode from 'jwt-decode';
import { User } from './User';
import { EndPoints } from './endpoints';
import $ from 'jquery';

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

interface LoginResponse {
    token: string;
    user: User;
}

const tokenName = 'auth';

// Detta e lite coolt, med denna metod kan jag bryta ut storagen så om vi t.ex. skulle vilja byta till localstorage är det enkelt
const storage: Storage = sessionStorage;

export const authHeader = (token: any) => `Bearer ${token}`;

const saveToStorage = (data: any) => {
    storage.setItem(tokenName, JSON.stringify(data));
};

export const getToken = () => JSON.parse(storage.getItem(tokenName))?.token;

export const getUser = async () => {
    // TODO
};

export const getUserID = () => jwt_decode<JWTData>(getToken()).sub.user;

export const hasToken = () => !!getToken();

export const isLoggedIn = hasToken;

export function isSignedIn() {
    const signedIn = storage.getItem(tokenName);
    return signedIn != null;
}

export const login = async (email: string, password: string) => {
    const result = await standardPost<LoginResponse>(EndPoints.Login, { email, password });
    saveToStorage(result);
    return result;
};

export const register = async (user: Partial<User> | { password: string }) => {
    const result = await standardPost(EndPoints.Register, user);
    return result;
};

export function toggleNavbar() {
    const signedIn = isSignedIn();
    $('#login-button').toggleClass('d-none', signedIn);
    $('#register-button').toggleClass('d-none', signedIn);
    $('#room-button').toggleClass('d-none', !signedIn);
    $('#logout-button').toggleClass('d-none', !signedIn);
}

export const logout = () => {
    storage.removeItem(tokenName);
    toggleNavbar();
};

const afterAuth = () => {
    toggleNavbar();
    navigateTo('/r');
};

const afterRegister = () => {
    navigateTo('/login');
};

export async function clickRegister(event: JQuery.SubmitEvent) {
    event.preventDefault();
    const email = $<HTMLInputElement>('#InputEmailRegister').val() as string;
    const password = $<HTMLInputElement>('#InputPasswordRegister').val() as string;
    const username = $<HTMLInputElement>('#InputUsernameRegister').val() as string;

    await register({ email, password, username });
    afterRegister();

    return false;
}

export async function clickLogin(event: JQuery.SubmitEvent) {
    event.preventDefault();

    const email = $<HTMLInputElement>('#InputEmail').val() as string;
    const password = $<HTMLInputElement>('#InputPassword').val() as string;

    // TODO: add error handling
    await login(email, password);
    afterAuth();

    return false;
}

export async function createSchool(event: { preventDefault: () => void }) {
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

export async function loginSchool(event: { preventDefault: () => void }) {
    event.preventDefault();
    const email = $<HTMLInputElement>('#contactEmailLogin').val();
    const password = $<HTMLInputElement>('#schoolLoginP').val();
    try {
        const result = await standardPost<any>('/loginschool', {
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
