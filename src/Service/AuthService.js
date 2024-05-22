import { httpClient } from "../Utils/HttpClient";

export const login = (data) => {
    return httpClient.post('api/Auth/Login', data);
};

export const CreateUser = (data) => {
    return httpClient.post('api/AppUser/CreateUser', data);
};

export const checkIsAdmin = (id) => {
    return httpClient.get(`api/AppUser/CheckAdmin?AdminId=${id}`);
};