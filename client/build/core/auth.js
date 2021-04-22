import {navigateTo} from "./router.js";
import {standardPost} from "./server.js";
import jwt_decode from "../_snowpack/pkg/jwt-decode.js";
const tokenName = "auth";
export const authHeader = (token) => `Bearer ${token}`;
export const saveToStorage = (data) => {
  sessionStorage.setItem(tokenName, JSON.stringify(data));
};
export const getToken = () => JSON.parse(sessionStorage.getItem(tokenName))?.token;
export const getUser = () => {
  const auth = sessionStorage.getItem("auth");
  if (auth) {
    return JSON.parse(auth).user;
  }
};
async function getUserEmail() {
  const email = (await getUser())?.email;
  return email;
}
async function fillEmail() {
  if (isSignedIn()) {
    $("#fillemail").html(await getUserEmail());
  }
}
export const getUserID = () => jwt_decode(getToken()).sub.user;
export const hasToken = () => !!getToken();
export async function createUser(event) {
  event.preventDefault();
  const email = $("#InputEmailRegister").val();
  const password = $("#InputPasswordRegister").val();
  const username = $("#InputUsernameRegister").val();
  const confirmedPassword = $("#InputPasswordRegisterConfirm").val();
  const checked = $("#invalidCheck2").val();
  try {
    const result = await standardPost("/register", {
      username,
      email,
      password,
      confirmedPassword
    });
    navigateTo("/login");
  } catch (e) {
    alert("The passwords did not match. Try again!");
  }
}
export function toggleNavbar() {
  const signedIn = isSignedIn();
  const student = isStudent();
  $("#login-button").toggleClass("d-none", signedIn);
  $("#register-button").toggleClass("d-none", signedIn);
  $("#drop_down").toggleClass("d-none", !signedIn);
  $("#logout-button").toggleClass("d-none", !signedIn);
  $("#room-button").toggleClass("d-none", !student);
  $("#buying-button").toggleClass("d-none", student);
  $("#buying-button-footer").toggleClass("d-none", student);
  $("#checkout-button").toggleClass("d-none", !isSchool());
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
export function logOut(event) {
  event.preventDefault();
  sessionStorage.removeItem(tokenName);
  toggleNavbar();
  navigateTo("/");
}
export async function logIn(event) {
  event.preventDefault();
  const email = $("#InputEmail").val();
  const password = $("#InputPassword").val();
  try {
    const result = await standardPost("/login", {
      email,
      password
    });
    sessionStorage.setItem("auth", JSON.stringify(result));
    toggleNavbar();
    if (isStudent()) {
      navigateTo("/r");
    } else if (isSchool()) {
      if (result.school.sub_id != null) {
        navigateTo("/customer-page");
      } else {
        navigateTo("/checkout");
      }
    }
  } catch (e) {
    alert("Felaktig email eller l\xF6senord. F\xF6rs\xF6k igen eller registrera dig.");
  }
}
export async function createSchool(event) {
  event.preventDefault();
  const name = $("#schoolName").val();
  const email = $("#contactEmail").val();
  const password = $("#schoolPassword").val();
  const confirmedPassword = $("#schoolPasswordConfirm").val();
  console.log(name, email, password);
  try {
    const result = await standardPost("/registerschool", {
      name,
      email,
      password,
      confirmedPassword
    });
    navigateTo("/login");
  } catch (e) {
    alert("The passwords did not match. Try again!");
  }
}
