import {loadStripe} from "../_snowpack/pkg/@stripe/stripe-js.js";
import {EndPoints} from "../core/endpoints.js";
import {navigateTo} from "../core/router.js";
import {standardDelete, standardGet, standardPost} from "../core/server.js";
import $ from "../_snowpack/pkg/jquery.js";
export async function addAdmin() {
  const email = $("#inputemail").val();
  await standardPost(EndPoints.SchoolAdmin, {admin_email: email});
  writeAdmins();
}
export async function deleteAdmin() {
  const email = $("#Admin-delete").val();
  try {
    await standardDelete(EndPoints.SchoolAdmin, {admin_email: email});
    writeAdmins();
  } catch (e) {
    alert("This is not one of your admins. Try again.");
  }
}
export async function modalDelete() {
  const admins = await standardGet(EndPoints.SchoolAdmin);
  $("#Admin-delete").append(`<option selected>Current admins</option>`);
  admins.forEach((School_Admin) => {
    $("#Admin-delete").append(`<option>${School_Admin.admin_email}</option>`);
  });
}
export async function writeAdmins() {
  $("#customer_portal").off();
  $("#customer_portal").on("click", customerPortal);
  document.getElementById("delete-admin").addEventListener("click", modalDelete, true);
  const max_admin = await checkSubscription();
  $("#admin-admin").empty();
  if (max_admin > 0) {
    try {
      const admins = await standardGet(EndPoints.SchoolAdmin);
      let number_of = 0;
      admins.forEach((School_Admin) => {
        ++number_of;
        $("#admin-admin").append(` 
                <tr>
                  <th scope="row">${number_of}</th>
                  <td>${School_Admin.admin_email}</td>
                  </tr>`);
      });
    } catch (e) {
    }
  } else {
    alert("You need to renew your collaboration plan");
  }
}
export async function checkSubscription() {
  try {
    const subscription = await standardPost(EndPoints.UpdateSchool);
    return subscription.School;
  } catch (e) {
  }
}
const price_p_plus = "price_1IZul8C7I9l3XQtcLw7OrDIH";
const price_p = "price_1IZujvC7I9l3XQtc72Uq6LU0";
const price_s_plus = "price_1IZuj4C7I9l3XQtctx3PtUWs";
const price_s = "price_1IZuh5C7I9l3XQtcrkJwn759";
export async function createCheckoutSession(priceId) {
  try {
    const stripe = await loadStripe("pk_test_51IZucCC7I9l3XQtcR3FGS1YEe7UL8EKRsjyToCtFDD8RRQscOLlcoYbFHuIiTieCyj0K0rtLLPU6x74rLtqbzOlo00ODxOZOmn");
    const session = await standardPost(EndPoints.CreateCheckout, {
      priceId
    });
    const result = await stripe.redirectToCheckout({sessionId: session.sessionId});
    if (result.error) {
      alert(result.error.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
export function addEventListeners() {
  $("#premium_plus").off();
  $("#premium").off();
  $("#standard_plus").off();
  $("#standard").off();
  $("#premium_plus").on("click", function() {
    createCheckoutSession(price_p_plus);
  });
  $("#premium").on("click", function() {
    createCheckoutSession(price_p);
  });
  $("#standard_plus").on("click", function() {
    createCheckoutSession(price_s_plus);
  });
  $("#standard").on("click", function() {
    createCheckoutSession(price_s);
  });
  $("#customer_portal").on("click", customerPortal);
  console.log("lagt till alla k\xF6pknappar");
}
function customerPortal(e) {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");
  e.preventDefault();
  standardPost(EndPoints.CustomerPortal, {
    sessionId
  }).then((data) => {
    window.location.href = data.url;
  }).catch((error) => {
    console.error("Error:", error);
    alert("You have no current collaboration plan");
    navigateTo("/checkout");
  });
}
