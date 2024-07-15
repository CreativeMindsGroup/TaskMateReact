import { httpClient } from "../Utils/HttpClient";

export const GetUserById = (userId,WorkspaceId) => {
    return httpClient.get(`/api/Workspaces/getuserRoleInWorkspace?userId=${userId}&workspaceId=${WorkspaceId}`);
};
export const SeachUsers = (value) => {
    return httpClient.get(`/api/AppUser/SearchUserByEmailorUsername?value=${value}`);
};