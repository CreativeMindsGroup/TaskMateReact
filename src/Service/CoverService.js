import { httpClient } from "../Utils/HttpClient";

export const CreateCover = (data) => {
    try {
        const Result = httpClient.post("/api/CardCover/CreateCardCover", data)
        return Result
    } catch (error) {
    }
}
