import axios, { CancelToken } from "axios";

export class OllamaClient {
    private serverUrl: string;

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
    }

    async getCompletion(
        model: string,
        prompt: string,
    ): Promise<any> {
        const params = {
            model,
            prompt,
            stream: false,
            raw: true,
            options: {
                temperature: 0.2,
            }
        };

        console.log("Request parameters:", params);

        try {
            const response = await axios.post(
                `${this.serverUrl}/api/generate`,
                params,
            );
            console.log("API Response:", response.data);
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Request was canceled");
                throw error;
            }
            console.error("Error occurred:", error);
            throw error;
        }
    }
}
