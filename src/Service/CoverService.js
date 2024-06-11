import { httpClient } from "../Utils/HttpClient";

export const CreateCover = (data) => {
    try {
        const Result = httpClient.post("/api/Cards/updateCover", data)
        return Result
    } catch (error) {
    }
}
