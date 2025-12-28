package adapters

import (
	"encoding/json"
	"log"
	"net/http"

	"text-adventure-llm/app"

	"github.com/aws/aws-lambda-go/events"
)

func init() {
	log.Println("🚨 adapters/http.go COMPILED 🚨")
}

func ChatHTTPHandler(w http.ResponseWriter, r *http.Request) {
	
	log.Println("🔥 ChatHTTPHandler invoked")
	enableCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var req app.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	resp, err := app.HandleChat(req)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("An error occurred"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}


func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set(
		"Access-Control-Allow-Headers",
		"Content-Type, client-id, Authorization",
	)
}



func successResponse(body interface{}) events.APIGatewayProxyResponse {
	data, _ := json.Marshal(body)

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type":                 "application/json",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Headers": "Content-Type,Authorization",
		},
		Body: string(data),
	}
}

func errorResponse(status int, message string) events.APIGatewayProxyResponse {
	data, _ := json.Marshal(map[string]string{
		"error": message,
	})

	return events.APIGatewayProxyResponse{
		StatusCode: status,
		Headers: map[string]string{
			"Content-Type":                 "application/json",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Headers": "Content-Type,Authorization",
		},
		Body: string(data),
	}
}

