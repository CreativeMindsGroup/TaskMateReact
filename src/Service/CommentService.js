import { httpClient } from "../Utils/HttpClient";

export const GetCardInComments = (id) => {
  return httpClient.get(`api/Comments/${id}`);
};