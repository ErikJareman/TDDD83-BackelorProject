export enum Endpoints {
    Cars = 'cars',
}

export const getRequest = (endpoint: Endpoints, parameters?: string) => {
    return $.ajax();
};
