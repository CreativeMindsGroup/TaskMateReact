import { httpClient } from "../Utils/HttpClient";

export const CreateWorkSpace = async (data) => {
    try {
        const response = await httpClient.post('/api/Workspaces/CreateWorkspace', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const AcceptInvite = async (token,mail) => {
    try {
        const response = await httpClient.post(`/api/Workspaces/accept-invite?token=${token}&UserEmail=${mail}` );
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const AddUserToWorkspace = async (data) => {
    try {
        const response = await httpClient.post('/api/Workspaces/AddUserToWorkspace', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const ChangeUserRoleInWorkspace = async (data) => {
    try {
        const response = await httpClient.post('/api/Workspaces/changeUserRole', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const GenerateLinkToJoinWorkspace = async (data) => {
    try {
        const response = await httpClient.post('/api/Workspaces/generate-invite', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const UpdateWorkSpace = async  (data) => {
    try {
        const response =await  httpClient.put('/api/Workspaces', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const DeleteUserFromWorkspace = async (data) => {
    try {
      const response = await httpClient.delete('/api/Workspaces/RemoveUserFromWorkspace', {
        headers: {
          'Content-Type': 'application/json' // Ensuring content type is set to application/json
        },
        data: JSON.stringify(data) // Make sure to stringify the data
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
export const GetAllWorkspaces = async (AppUserId) => {
    try {
        const result = await httpClient.get(`/api/Workspaces/GetAllbyUserId?AppUserId=${AppUserId}`)
        return result
    }
    catch (error) {
        return error
    }
}
export const GetWorkSpaceById = async (WorkspaceId) => {
    try {
        const result = await httpClient.get(`/api/Workspaces/${WorkspaceId}`)
        return result
    }
    catch (error) {
        return error
    }
}
export const getAllUsersCount = async (WorkspaceId) => {
    try {
        const result = await httpClient.get(`/api/Workspaces/GetAllUsersInWorkspaceCount?workspaceId=${WorkspaceId}`)
        return result
    }
    catch (error) {
        return error
    }
}
export const GetAllUsersOfWorkspace = async (WorkspaceId,page = 1,pageSize = 10) => {
    try {
        const result = await httpClient.get(`/api/Workspaces/GetAllUsersInWorkspace?WorkspaceId=${WorkspaceId}&page=${page}&pageSize=${pageSize}`)
        return result
    }
    catch (error) {
        return error
    }
}
export const DeleteWorkSpace = async (AppUserId, WorkspaceId) => {
    try {
        const result = await httpClient.delete(`/api/Workspaces?AppUserId=${AppUserId}&WorkspaceId=${WorkspaceId}`)
        return result
    }
    catch (error) {
        return error
    }
}


