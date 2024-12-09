import axios from "axios";
import { getTemperature } from "./config";

export class OllamaClient {
    private serverUrl: string;
    private controller?: AbortController; // To manage cancellation of ongoing requests

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
    }

    async getCompletion(
        model: string,
        prompt: string,
        timeoutMs: number = 5000
    ): Promise<any> {
        // Cancel the previous request if it exists
        if (this.controller) {
            this.controller.abort();
        }

        this.controller = new AbortController();

        const timeoutSignal = AbortSignal.timeout(timeoutMs);
        const combinedSignal = AbortSignal.any([this.controller.signal, timeoutSignal]);

        const params = {
            model,
            prompt,
            stream: false,
            raw: true,
            options: {
                temperature: getTemperature(),
                num_predict: 512
            },
        };

        try {
            const response = await axios.post(
                `${this.serverUrl}/api/generate`,
                params,
                { signal: combinedSignal }
            );
            return response.data;
        } catch (error: any) {
            if (!axios.isCancel(error)) {
                throw error;
            }
        }
    }
}
