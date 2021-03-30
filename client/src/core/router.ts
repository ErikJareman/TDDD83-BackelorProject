import $ from 'jquery';
import { enterRoomPage } from './rooms';

interface Route {
    url: string;
    onLoad?: () => void;
    // onExit?: () => void;
    templateSelector: string;
}

// Routes
const routes: Route[] = [
    { url: '/login', templateSelector: '#login', onLoad: () => console.log('Login laddad') },
    { url: '/register', templateSelector: '#register', onLoad: () => console.log('Register laddad') },
    { url: '/404', templateSelector: '#404' },
    { url: '/', templateSelector: '#home' },
    { url: '/success', templateSelector: '#view-success' },
    { url: '/cancel', templateSelector: '#view-cancel' },
    { url: '/checkout', templateSelector: '#checkout' },
    { url: '/r', templateSelector: '#view-room', onLoad: enterRoomPage },
    { url: '/buy', templateSelector: '#buy-topq-home' },
    { url: '/loginschool', templateSelector: '#school-login' },
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
