import axios, { CancelTokenSource } from "axios";
import { getTemperature } from "./config";

export class OllamaClient {
    private serverUrl: string;
    private cancelTokenSource: CancelTokenSource | null = null;

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
    }

    async getCompletion(
        model: string,
        prompt: string,
    ): Promise<any> {
        const temperature = getTemperature();

        const params = {
            model,
            prompt,
            stream: false,
            raw: true,
            options: {
                temperature,
            },
        };

        if (this.cancelTokenSource) {
            this.cancelTokenSource.cancel("New request triggered");
        }

        this.cancelTokenSource = axios.CancelToken.source();

        try {
            const response = await axios.post(
                `${this.serverUrl}/api/generate`,
                params,
                { cancelToken: this.cancelTokenSource.token }
            );
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) {
                return null;
            } else {
                console.error("Error occurred:", error);
                throw error;
            }
        }


    }
}