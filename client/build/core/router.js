import $ from "../_snowpack/pkg/jquery.js";
import {createSchool, createUser, isStudent, logIn, toggleNavbar} from "./auth.js";
import {clickDeleteRoom, clickLeaveRoom, enterRoomPage} from "../features/rooms.js";
import {addEventListeners, writeAdmins} from "../features/subscription.js";
const routes = [
  {
    url: "/login",
    templateSelector: "#login",
    onLoad: () => {
      const form = $("#loginForm");
      form.off();
      form.on("submit", logIn);
    }
  },
  {
    url: "/register",
    templateSelector: "#register",
    onLoad: () => {
      const form = $("#registerForm");
      form.off();
      form.on("submit", createUser);
    }
  },
  {url: "/404", templateSelector: "#404"},
  {
    url: "/",
    templateSelector: "#home",
    onLoad: () => {
      toggleNavbar();
    }
  },
  {url: "/success", templateSelector: "#success"},
  {url: "/cancel", templateSelector: "#cancel"},
  {url: "/about", templateSelector: "#about-us"},
  {
    url: "/checkout",
    templateSelector: "#checkout",
    onLoad: () => {
      addEventListeners();
      console.log("efter addEventListener");
    }
  },
  {
    url: "/r",
    templateSelector: "#view-room",
    onLoad: () => {
      enterRoomPage();
      $("#leave-room").on("click", clickLeaveRoom);
      $("#delete-room").on("click", clickDeleteRoom);
      $("#room-button").toggleClass("d-none", !!isStudent);
    }
  },
  {
    url: "/buy",
    templateSelector: "#buy-topq-home",
    onLoad: () => {
      const form = $("#school-registerForm");
      form.off();
      form.on("submit", createSchool);
    }
  },
  {
    url: "/customer-page",
    templateSelector: "#customer-page",
    onLoad: () => {
      writeAdmins();
    }
  }
];
export const navigateTo = async (url) => {
  history.pushState(null, null, url);
  checkRoute();
};
const overrideLinkActions = () => {
  $("a").on("click", (event) => {
    if (event.target.classList.contains("outbound")) {
      return true;
    }
    event.preventDefault();
    navigateTo(event.target.href);
  });
};
const checkRoute = async () => {
  const path = location.pathname;
  const routeToLoad = routes.find((route) => route.url === path);
  if (!routeToLoad) {
    return navigateTo("/404");
  }
  const htmlToLoad = $(routeToLoad.templateSelector).html();
  $("#router").html(htmlToLoad);
  if (routeToLoad.onLoad) {
    routeToLoad.onLoad();
  }
};
export const initiateRouter = () => {
  checkRoute();
  overrideLinkActions();
};
