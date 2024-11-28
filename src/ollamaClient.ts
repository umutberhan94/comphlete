import axios, { CancelToken, options } from "axios";

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
                num_predict: 42
            }
        };

        console.log("Requesting...");

        try {
            const response = await axios.post(
                `${this.serverUrl}/api/generate`,
                params,
            );
            console.log(response.data.response);
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
