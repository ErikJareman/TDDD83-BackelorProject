import { EndPoints } from './endpoints';
import { standardDelete, standardGet, standardPost } from './server';

export interface JWTData {
    fresh: boolean;
    iat: number;
    jti: string;
    nbf: number;
    type: string;
}

export function addAdmin() {
    const email = $<HTMLInputElement>('#inputemail').val();

    standardPost(EndPoints.SchoolAdmin, { admin_email: email });
    writeAdmins();
}

export function deleteAdmin() {
    const email = $<HTMLInputElement>('#Admin-delete').val();
    try {
        standardDelete(EndPoints.SchoolAdmin, { admin_email: email });
        writeAdmins();
    } catch (e) {
        alert('This is not one of your admins. Try again.');
    }
}

export async function modalDelete() {
    const admins = await standardGet(EndPoints.SchoolAdmin);
    $('#Admin-delete').append(`<option selected>Current admins</option>`);
    admins.forEach((School_Admin) => {
        $('#Admin-delete').append(`<option>${School_Admin.admin_email}</option>`);
    });
}

export async function writeAdmins() {
    document.getElementById('delete-admin').addEventListener('click', modalDelete, true);

    const max_admin = await checkSubscription();
    $('#admin-admin').empty();
    if (max_admin > 0) {
        try {
            const admins = await standardGet(EndPoints.SchoolAdmin);
            //    console.log(max_admin);
            let number_of = 0;
            // console.log(admins);
            admins.forEach((School_Admin) => {
                ++number_of;
                $('#admin-admin').append(` 
                <tr>
                  <th scope="row">${number_of}</th>
                  <td>${School_Admin.admin_email}</td>
                  </tr>`);
            });
        } catch (e) {
            // TODO
        }
    } else {
        alert('You need to renew your collaboration plan');
    }
}

export async function checkSubscription() {
    try {
        const subscription = await standardPost(EndPoints.UpdateSchool);

        return subscription.School;
    } catch (e) {
        // TODO
    }
}
