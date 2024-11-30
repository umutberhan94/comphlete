![readme](https://private-user-images.githubusercontent.com/48595229/391294195-68942a51-6584-4915-9579-86460d24e177.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzMwMDUwMDUsIm5iZiI6MTczMzAwNDcwNSwicGF0aCI6Ii80ODU5NTIyOS8zOTEyOTQxOTUtNjg5NDJhNTEtNjU4NC00OTE1LTk1NzktODY0NjBkMjRlMTc3LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDExMzAlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQxMTMwVDIyMTE0NVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTI0MzRlYTU0OGFmYTYwY2I1OWIxZTBhMDgzYzVjMGQyMDFjYzAzYWI1OGYwNDc3YTJjOGQ4NjY4OTcyNGZmZDImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.Nxsv14Z4XURdzOwI-2X3hZWqoN3dB0ORJ9bYDi3eX7Q)

### This extension leverages AI models that are executed locally, providing fast and privacy-conscious code completions.

## Requirements

1. Ollama
2. Qwen2.5-coder model

## Setting up Ollama

1. Download the latest version of Ollama from the [official website](https://ollama.com/).
2. After installation, open your terminal and run the following command to fetch the model:

   ```bash
   ollama run qwen2.5-coder:1.5b
   ```
After the download is complete, you should start seeing completions as you code.

## Extension Settings

Debounce Delay: The delay (in milliseconds) before triggering completion after typing stops.
Enable Inline Completion: Enable or disable inline completion functionality.

## Extension Commands
Toggle Inline Completion: Toggle inline completion functionality.
