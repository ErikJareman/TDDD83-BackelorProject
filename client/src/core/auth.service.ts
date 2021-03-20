import { navigateTo } from './router';
import { standardPost } from './server.service';

const tokenName = 'auth';

export const authHeader = (token) => `Bearer ${token}`;

export const saveToStorage = (data) => {
    sessionStorage.setItem(tokenName, JSON.stringify(data));
};

export const getToken = () => JSON.parse(sessionStorage.getItem(tokenName))?.token;

export const getUser = () => {
    // TODO
};

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
