package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"

)

// ----------------------
// Config
// ----------------------


var modelName = "@cf/meta/llama-3.1-8b-instruct"


// ----------------------
// Request / Response models
// ----------------------

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Reply     string `json:"reply"`
	ModelUsed string `json:"modelUsed"`
}

// ----------------------
// Cloudflare LLM call
// ----------------------

func callCloudflareAI(prompt string) (string, error) {
	cfAccountID := os.Getenv("CLOUDFLARE_ACCOUNT_ID")
	cfAPIToken := os.Getenv("CLOUDFLARE_API_TOKEN")

	if cfAccountID == "" || cfAPIToken == "" {
		return "", fmt.Errorf("Cloudflare env vars not set")
	}

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
		return "", fmt.Errorf("Cloudflare error (%d): %s", resp.StatusCode, string(respBody))
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

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, client-id")
}



// ----------------------
// HTTP handler
// ----------------------

func chatHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	// Handle preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("Method not allowed"))
		return
	}

	timestamp := time.Now().UTC().Format(time.RFC3339)

	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[%s] Invalid body: %v\n", timestamp, err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	log.Printf("[%s] Prompt: %s\n", timestamp, req.Message)

	if req.Message == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Empty prompt"))
		return
	}

	reply, err := callCloudflareAI(req.Message)
	if err != nil {
		log.Printf("[%s] Error: %v\n", timestamp, err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("An error occurred"))
		return
	}

	log.Printf("[%s] Reply: %s\n", timestamp, reply)

	resp := ChatResponse{
		Reply:     reply,
		ModelUsed: modelName,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}



// ----------------------
// Main
// ----------------------

func main() {
	// Load .env file for local development
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ No .env file found (this is OK in AWS)")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "10000"
	}

	log.Println("🔥 Using Cloudflare Account ID:", os.Getenv("CLOUDFLARE_ACCOUNT_ID"))
	log.Println("🔥 Using Cloudflare API Token:", func() string {
		if os.Getenv("CLOUDFLARE_API_TOKEN") != "" {
			return "Loaded"
		}
		return "NOT LOADED"
	}())

	http.HandleFunc("/api/chat", chatHandler)

	log.Printf("🚀 Go backend running on http://localhost:%s\n", port)
	log.Printf("💡 Using Cloudflare Workers AI model: %s\n", modelName)

	log.Fatal(http.ListenAndServe(":"+port, nil))
}

