import $ from 'jquery';
import { addEventListener } from '../index';
import { authHeader, createSchool, createUser, logIn, loginSchool } from './auth.service';
import { clickDeleteRoom, clickLeaveRoom, enterRoomPage } from './rooms';
import { writeAdmins } from './subscription';

interface Route {
    url: string;
    onLoad?: () => void;
    // onExit?: () => void;
    templateSelector: string;
}

// Routes
const routes: Route[] = [
    {
        url: '/login',
        templateSelector: '#login',
        onLoad: () => {
            const form = $('#loginForm');
            form.off();
            form.on('submit', logIn);
        },
    },
    {
        url: '/register',
        templateSelector: '#register',
        onLoad: () => {
            const form = $('#registerForm');
            form.off();
            form.on('submit', createUser);
        },
    },

    // { url: '/login', templateSelector: '#login', onLoad: () => console.log('Login laddad') },
    //{ url: '/register', templateSelector: '#register', onLoad: () => console.log('Register laddad') },
    { url: '/404', templateSelector: '#404' },
    { url: '/', templateSelector: '#home' },
    { url: '/success', templateSelector: '#success' },
    { url: '/cancel', templateSelector: '#cancel' },
    {
        url: '/checkout',
        templateSelector: '#checkout',
        onLoad: () => {
            addEventListener();
            console.log('efter addEventListener');
        },
    },
    // { url: '/r', templateSelector: '#view-room', onLoad: enterRoomPage },
    {
        url: '/r',
        templateSelector: '#view-room',
        onLoad: () => {
            enterRoomPage();
            $('#leave-room').on('click', clickLeaveRoom);
            $('#delete-room').on('click', clickDeleteRoom);
        },
    },
    {
        url: '/buy',
        templateSelector: '#buy-topq-home',
        onLoad: () => {
            const form = $('#school-registerForm');
            form.off();
            form.on('submit', createSchool);
        },
    },
    {
        url: '/loginschool',
        templateSelector: '#school-login',
        onLoad: () => {
            const form = $('#school-loginForm');
            form.off();
            form.on('submit', loginSchool);
        },
    },
    {
        url: '/customer-page',
        templateSelector: '#customer-page',
        onLoad: () => {
            writeAdmins();
        },
    },
];

// Programatic navigate
export const navigateTo = async (url: string) => {
    history.pushState(null, null, url);
    checkRoute();
};

const overrideLinkActions = () => {
    $<HTMLAnchorElement>('a').on('click', (event) => {
        // links with outbound class normal instead
        if (event.target.classList.contains('outbound')) {
            // Dont handle
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
        return navigateTo('/404');
    }

    // Inject html
    const htmlToLoad = $(routeToLoad.templateSelector).html();
    $('#router').html(htmlToLoad);

    // Run onload
    if (routeToLoad.onLoad) {
        routeToLoad.onLoad();
    }
};

export const initiateRouter = () => {
    checkRoute();
    overrideLinkActions();
};
