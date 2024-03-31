import { httpClient } from "../Utils/HttpClient";

export const GetBoardInUserActivity = (appUserId, boardId) => {
  return httpClient.get(
    `api/UserActivitys?AppUserId=${appUserId}&BoardId=${boardId}`
  );
};

export const GetCardInActivity = (cardId) => {
  return httpClient.get(
    `api/UserActivitys/GetCardInActivity?CardId=${cardId}`
  );
};


///UserActivitys?AppUserId=5808b652-c043-4de4-811f-81cd7e4abb1d&BoardId=34BE87CD-06D3-45F1-C70C-08DC4F8CB15F
