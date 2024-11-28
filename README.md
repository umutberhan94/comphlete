# Complethe

Inline Code Completions with AI. This extension leverages AI models that are executed locally, providing fast and privacy-conscious code completions.

## Requirements

1. Ollama
2. Qwen2.5-coder model

## Setting up Ollama

1. Download the latest version of Ollama from the [official website](https://ollama.com/).
2. After installation, open your terminal and run the following command to fetch the model:

   ```bash
   ollama run qwen2.5-coder:1.5b
   ```
After the download is complete, you should start seeing completions in VS Code.

## Extension Settings

Debounce Time: The delay before making a request after typing stops.