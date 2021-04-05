import $ from 'jquery';
import { clickLogin, clickRegister } from './auth';
import { enterRoomPage } from './rooms';

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
            form.on('submit', clickLogin);
        },
    },
    {
        url: '/register',
        templateSelector: '#register',
        onLoad: () => {
            const form = $('#registerForm');
            form.off();
            form.on('submit', clickRegister);
        },
    },
    { url: '/404', templateSelector: '#404' },
    { url: '/', templateSelector: '#home' },
    { url: '/r', templateSelector: '#view-room', onLoad: () => enterRoomPage() },
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
