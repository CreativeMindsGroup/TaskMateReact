import { useQueryClient } from "react-query";
import { httpClient } from "../Utils/HttpClient";
export const CreateChecklist = async (formData) => {
    try {
        const response = await httpClient.post('/api/Checklists', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const CreateChecklistitem = async (formData) => {
    try {
        const response = await httpClient.post('/api/Checkitems', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// export const UpdateChecklistItem = async (formData) => {
//     try {
//         const response = await httpClient.put('/api/CardLists/update', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data'
//             }
//         });
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };

export const UpdateChecklistItem = (data) => {
    return httpClient.put(`/api/CardLists/update`, data);
};
export const RemoveCardList = ({ CardlistId, userId, workspaceId }) => {
    return httpClient.delete(`/api/CardLists/remove?CardlistId=${CardlistId}&WorkspaceId=${workspaceId}&UserId=${userId}`, {
    });
};

export const GetAllChecklist = async (Id) => {
    try {
        const response = await httpClient.get(`/api/Checklists?CardId=${Id}`)
        return response.data;
    } catch (error) {
    }
};
export const DeleteChecklistItem = async (Id) => {
    try {
        const response = await httpClient.delete(`/api/Checkitems?CheckItemId=${Id}`)
        return response.data;
    } catch (error) {
    }
};
export const DeleteChecklist = async (Id, UserId, WorkspaceId) => {
    try {
        const response = await httpClient.delete(`/api/Checklists?CheckListId=${Id}&WorkspaceId=${WorkspaceId}&UserId=${UserId}`)
        return response.data;
    } catch (error) {
    }
};
export const CheckItemUpdate = async (Id, data) => {
    try {
        const response = await httpClient.put(`/api/Checkitems/${Id}`, data);
        return response.data;
    } catch (error) {
        console.error('Failed to update checklist item:', error);
        throw error;
    }
};

