package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

func CallCloudflare(prompt string) (string, error) {
	cfAccountID := os.Getenv("CLOUDFLARE_ACCOUNT_ID")
	cfAPIToken := os.Getenv("CLOUDFLARE_API_TOKEN")

	if cfAccountID == "" || cfAPIToken == "" {
		return "", fmt.Errorf("Cloudflare env vars not set")
	}

	modelName := "@cf/meta/llama-3.1-8b-instruct"

	url := fmt.Sprintf(
		"https://api.cloudflare.com/client/v4/accounts/%s/ai/run/%s",
		cfAccountID,
		modelName,
	)

	payload := map[string]interface{}{
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": prompt,
			},
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+cfAPIToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf(
			"Cloudflare error (%d): %s",
			resp.StatusCode,
			string(respBody),
		)
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal(respBody, &parsed); err != nil {
		return "", err
	}

	result, ok := parsed["result"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("unexpected Cloudflare response format")
	}

	responseText, _ := result["response"].(string)
	if responseText == "" {
		responseText = "(No response)"
	}

	return responseText, nil
}
