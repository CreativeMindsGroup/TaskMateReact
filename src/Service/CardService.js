import { httpClient } from "../Utils/HttpClient";

export const createCardList = (data) => {
  return httpClient.post(`/api/CardLists/add`, data);
};

export const getCardListByBoardId = (id) => {
  return httpClient.get(`/api/CardLists/GetAllCardListbyBoardId?boardId=${id}`);
};

export const dragAndDropCard = (data) => {
  return httpClient.post(`/api/Cards/dragAndDrop`, data);
};

export const reOrderColumns = (data) => {
  return httpClient.post(`/api/CardLists/updateOrders`, data);
};

export const createTask = (data) => {
  return httpClient.post(`/api/Cards/add`, data);
};

export const getByCard = (id) => {
  return httpClient.get(`api/Cards/${id}`);
};
export const DownloadFile = async (fileName, cardId) => {
  try {
    const response = await httpClient.get(`/api/Cards/download/${cardId}/${fileName}`, {
      responseType: 'blob', // Set the response type to 'blob' for file downloads
    });
    return response.data; // Return the blob data
  } catch (error) {
    throw new Error('Error downloading file:', error);
  }
};

export const getBoardData = (id) => {
  return httpClient.get(`/api/Cards/board/${id}`);
};
export const RemoveCard = (cardId, userId, WorkspaceId) => {
  return httpClient.delete(`/api/Cards/remove?appUserId=${userId}&cardId=${cardId}&WorkspaceId=${WorkspaceId}`);
};
export const RemoveFile = (AttacmentId, userId, WorkspaceId) => {
  return httpClient.delete(`/api/Cards/RemoveFile?attachmentId=${AttacmentId}&userId=${userId}&workspaceId=${WorkspaceId}`, {
  });
};
export const getAllCardsByCardListId = (cardListId) => {
  return httpClient.get(`/api/Cards/GetAllCardsByCardListId?cardListId=${cardListId}`);
};
export const getCardListItomCount = (cardListId) => {
  return httpClient.get(`/api/Checkitems/GetChecklistItemCount?CardId=${cardListId}`);
};
export const GetAttachments = (cardListId) => {
  return httpClient.get(`/api/Cards/GetUploads?CardId=${cardListId}`);
};
export const GetCustomFields = (CardId) => {
  return httpClient.get(`/api/CustomFields?cardId=${CardId}`);
};
export const UpdateChecklistCustomField = (CardId, value,userId,workspaceId) => {
  return httpClient.put(`/api/CustomFields/UpdateChecklist?value=${value}&id=${CardId}&UserId=${userId}&WorkspaceId=${workspaceId}`);
};
export const RemoveCustomField = ({ fieldId, userId, workspaceId }) => {
  return httpClient.delete('/api/CustomFields/RemoveCustomField', {
    data: { fieldId, userId, workspaceId },
  });
};
export const reorderCards = (data) => {
  return httpClient.post(`/api/Cards/reorder`, data);
};
export const UpdateCardDesctiontion = (data) => {
  return httpClient.put(`/api/Cards/update-description`, data);
};
export const UpdateTitle = (data) => {
  return httpClient.put(`/api/Cards/UpdateTitle`, data);
};
export const AddCardDueDate = (data) => {
  return httpClient.put(`/api/Cards/AddCardDueDate`, data);
};
export const UpdateDateTime = (data) => {
  return httpClient.put(`/api/Cards/DueDateUpdated`, data);
};
export const UploadFile = (formData, cardId, FileName,userId,workspaceId) => {
  return httpClient.post(`/api/Cards/UploadAttacment?CardId=${cardId}&FileName=${FileName}&UserId=${userId}&WorkspaceId=${workspaceId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const ArchiveCard = (formData) => {
  return httpClient.put(`/api/Cards/ChangeArchiceStatus`, formData, {
  });
};
export const AddUserToCard = (formData) => {
  return httpClient.post(`/api/Cards/addUserToCard`, formData, {
  });
};
export const CreateNumberCustomFiled = (data) => {
  return httpClient.post(`/api/CustomFields/CreateNumber`, data, {
  });
};
export const RemoveUserFromCard = (data) => {
  return httpClient.post(`/api/Cards/removeUserFromCard`, data, {
  });
};
export const CreateCheckListCustomFiled = (data) => {
  return httpClient.post(`/api/CustomFields/addChecklist`, data, {
  });
};
export const GetArchivedCards = (BoardId) => {
  return httpClient.get(`/api/Boards/GetArchivedCards?boardId=${BoardId}`);
};