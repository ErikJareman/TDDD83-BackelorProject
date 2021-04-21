import $ from "../_snowpack/pkg/jquery.js";
import env from "../shared/env.js";
import {authHeader, getToken} from "./auth.js";
const defaultHeaders = () => {
  const headers = {
    "Content-Type": "application/json"
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = authHeader(token);
  }
  return headers;
};
const addHost = (endpoint) => {
  return `${env.backendURL}${endpoint}`;
};
const addParameters = (baseURL, parameters) => {
  if (!parameters) {
    return baseURL;
  }
  const url = new URL(baseURL);
  for (const key in parameters) {
    url.searchParams.set(key, parameters[key].toString());
  }
  return url.toString();
};
export const getMultiple = async (endpoint, parameters) => {
  const data = await standardGet(endpoint, parameters);
  return data;
};
export const getSingle = async (endpoint, id, parameters) => {
  const data = await standardGet(`${endpoint}/${id}`, parameters);
  return data;
};
export const standardPost = async (endpoint, data) => {
  const requestSettings = {
    data: JSON.stringify(data),
    type: "POST",
    url: addHost(endpoint),
    headers: defaultHeaders()
  };
  return $.ajax(requestSettings);
};
export const standardPut = async (endpoint, id, data) => {
  const requestSettings = {
    data: JSON.stringify(data),
    type: "PUT",
    url: `${addHost(endpoint)}/${id}`,
    headers: defaultHeaders()
  };
  return $.ajax(requestSettings);
};
export const standardGet = async (endpoint, parameters) => {
  const requestSettings = {
    type: "GET",
    url: addParameters(addHost(endpoint), parameters),
    headers: defaultHeaders()
  };
  return $.ajax(requestSettings);
};
export const standardDelete = async (endpoint, data) => {
  const requestSettings = {
    url: addHost(endpoint),
    type: "DELETE",
    headers: defaultHeaders(),
    data: JSON.stringify(data)
  };
  return $.ajax(requestSettings);
};
