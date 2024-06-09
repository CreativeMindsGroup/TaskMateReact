import { useQueryClient } from "react-query";
import { httpClient } from "../Utils/HttpClient";

export const CreateBoard = async (data) => {
  try {
    const result = await httpClient.post("/api/Boards/CreateBoard", data);
    return result;
  } catch (error) {
    return error;
  }
};

export const UpdateBoard = async (data) => {
  try {
    const result = await httpClient.put("/api/Boards", data);
    return result;
  } catch (error) {
    return error;
  }
};

export const getBoardById = (id) => {
  return httpClient.get(`api/Boards/${id}`);
};
export const getbyWokrspaceInBoard = (AppUserId, WorkspaceId) => {
  return httpClient.get(`api/Boards?AppUserId=${AppUserId}&WorkspaceId=${WorkspaceId}`);
};

export const moveCard = (data) => {
  return httpClient.post(`/api/Boards/moveCard`, data);
};
export const moveCardList= (Id,data) => {
  return httpClient.post(`/api/Boards/moveCardList?boardId=${Id}`,data);
};


export const getDeletebyId = async (data) => {  
  try {
    const result = await httpClient.delete(`/api/Boards`, { data }); 
    return result.data; 
  } catch (error) {
    throw error; 
  }
};


//https://localhost:7101/api/Boards/e94d0eb9-df9e-4222-58c7-08dc4536cb6c
//get ele
