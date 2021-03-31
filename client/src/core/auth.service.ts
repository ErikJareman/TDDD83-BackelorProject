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

export function writeAdmins() {
    checkSubscription();
    try {
        const result = fetch('http://127.0.0.1:5000/school-admin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
            },
        });
        $('#admins').append(`
        <table class="table table-bordered table-striped mb-0">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Email</th>
              <th scope="col">Course</th>
              <th scope="col">Delete admin</th>
            </tr>
          </thead>`);

        result.forEach((School_Admin) => {
            $('#admins').append(` <div class="table-wrapper-scroll-y my-custom-scrollbar">
        <table class="table table-bordered table-striped mb-0">
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>${School_Admin.email}</td>
              <td>${School_Admin.course}</td>
              <td> 
              <button type="button" id="button-row" class="btn btn-outline-secondary btn-sm" onclick="deleteAdmin(${School_Admin.id})>Ta bort</button>
              </td>
          </tbody>
        </table>
      </div>`);
        });
        console.log('funkar');
    } catch (e) {
        // TODO
    }
}

function deleteAdmin(result) {
    $('#admins').empty();
    //  $('#admins').append(`<p>Do you want to delete admin with ID ${result}?</p>`);
    //  $('#transaction-modal').modal('show');
    // document.getElementById('save-deleted-transaction').addEventListener("click", function(){
    fetch('http://127.0.0.1:5000/school-admin', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
        },
        body: JSON.stringify({
            admin_email: result.email,
        }),
    });
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
