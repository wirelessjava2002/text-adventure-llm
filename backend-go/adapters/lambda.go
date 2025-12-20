package adapters

import (
	"context"
	"encoding/json"
	
	"text-adventure-llm/app"
	"github.com/aws/aws-lambda-go/events"
)

func ChatLambdaHandler(
	ctx context.Context,
	req events.APIGatewayProxyRequest,
) (events.APIGatewayProxyResponse, error) {

	var chatReq app.ChatRequest
	json.Unmarshal([]byte(req.Body), &chatReq)

	resp, err := app.HandleChat(chatReq)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       "An error occurred",
		}, nil
	}

	body, _ := json.Marshal(resp)

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type":                 "application/json",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Headers": "Content-Type, client-id",
		},
		Body: string(body),
	}, nil
}
