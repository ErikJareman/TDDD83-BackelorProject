export interface JWTData {
    fresh: boolean;
    iat: number;
    jti: string;
    nbf: number;
    type: string;
}

export function addAdmin() {
    const email = $<HTMLInputElement>('#inputemail').val();
    try {
        const result = fetch('http://127.0.0.1:5000/school_admin', {
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

export function deleteAdmin() {
    const email = $<HTMLInputElement>('#Admin-delete').val();
    try {
        const result = fetch('http://127.0.0.1:5000/school_admin', {
            method: 'DELETE',
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
        alert('This is not one of your admins. Try again.');
    }
}

export async function modalDelete() {
    try {
        const result = await fetch('http://127.0.0.1:5000/school_admin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
            },
        });
        const admins = await result.json();
        $('#Admin-delete').append(`<option selected>Current admins</option>`);
        admins.forEach((School_Admin) => {
            $('#Admin-delete').append(`<option>${School_Admin.admin_email}</option>`);
        });
    } catch (e) {
        //TODO
    }
}

export async function writeAdmins() {
    document.getElementById('delete-admin').addEventListener('click', modalDelete, true);

    const max_admin = await checkSubscription();
    $('#admin-admin').empty();
    if (max_admin > 0) {
        try {
            const result = await fetch('http://127.0.0.1:5000/school_admin', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
                },
            });
        //    console.log(max_admin);
            const admins = await result.json();
            let number_of = 0;
           // console.log(admins);
            admins.forEach((School_Admin) => {
                number_of++;
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
        const result = await fetch('http://127.0.0.1:5000/update-school', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('auth')).token,
            },
        });
        const subscription = await result.json();
        return subscription.School;
    } catch (e) {
        // TODO
    }
}
