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

export const getBoardData = (id) => {
  return httpClient.get(`/api/Cards/board/${id}`);
};

export const getAllCardsByCardListId = (cardListId) => {
  return httpClient.get(`/api/Cards/GetAllCardsByCardListId?cardListId=${cardListId}`);
};
export const reorderCards = (data) => {
  return httpClient.post(`/api/Cards/reorder`, data);
};
export const UpdateCardDesctiontion = (data) => {
  return httpClient.put(`/api/Cards/update-description`, data);
};