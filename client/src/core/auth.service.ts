const tokenName = 'auth';

export const authHeader = (token) => `Bearer ${token}`;

export const saveToStorage = (data) => {
    sessionStorage.setItem(tokenName, JSON.stringify(data));
};

export const getToken = () => {
    // TODO
    return '';
};

export const getUser = () => {
    // TODO
};

export const hasToken = () => !!getToken();
