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

export const authHeader = (token: any) => `Bearer ${token}`;

export const saveToStorage = (data: any) => {
    sessionStorage.setItem(tokenName, JSON.stringify(data));
};

export const getToken = () => JSON.parse(sessionStorage.getItem(tokenName))?.token;

export const getUser = () => {
    // TODO
};

export const getUserID = () => jwt_decode<JWTData>(getToken()).sub.user;

export const hasToken = () => !!getToken();

export async function createUser(event: { preventDefault: () => void; }) {
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

export function logOut(event: { preventDefault: () => void; }) {
    event.preventDefault();
    sessionStorage.removeItem(tokenName);
    navigateTo('/');
}

export async function logIn(event: { preventDefault: () => void; }) {
    event.preventDefault();
    const email = $<HTMLInputElement>('#InputEmail').val();
    const password = $<HTMLInputElement>('#InputPassword').val();
    try {
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

export async function createSchool(event: { preventDefault: () => void; }) {
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

export async function loginSchool(event: { preventDefault: () => void; }) {
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

export async function writeAdmins() {
    checkSubscription();
    $('#admins').empty();
    try {
        const result = await fetch('http://127.0.0.1:5000/school_admin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
            },
        });
        const admins = await result.json();
        let number_of = 0;
        console.log(admins);
        admins.forEach((School_Admin) => {
            number_of++;
            $('#admin-admin').append(` 
            <tr>
              <th scope="row">${number_of}</th>
              <td>${School_Admin.admin_email}</td>
              <td> <button type="button" class="btn btn-primary btn-sm" id="delete-admin-button" onclick="deleteAdmin(${School_Admin.admin_email})">Delete</button></td>
              </tr>`);
        });
    } catch (e) {
        // TODO
    }
}

export async function deleteAdmin(result) {
    alert('hej');
    //  $('#admins').append(`<p>Do you want to delete admin with ID ${result}?</p>`);
    //  $('#transaction-modal').modal('show');
    // document.getElementById('save-deleted-transaction').addEventListener("click", function(){
    await fetch('http://127.0.0.1:5000/school_admin', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
        },
        body: JSON.stringify({
            admin_email: result,
        }),
    });
    alert(result);
    writeAdmins();
}

export function checkSubscription() {
    try {
        fetch('http://127.0.0.1:5000/update-school', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
            },
        });
    } catch (e) {
        // TODO
    }
}
