package adapters

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
)

type AuthRequest struct {
	Code string `json:"code"`
}

func AuthTokenHandler(
	ctx context.Context,
	req events.APIGatewayProxyRequest,
) (events.APIGatewayProxyResponse, error) {

	var body AuthRequest
	if err := json.Unmarshal([]byte(req.Body), &body); err != nil {
		return errorResponse(400, "Invalid request body"), nil
	}

	// TODO:
	// exchange body.Code with Cognito /oauth2/token
	// return tokens to React

	return successResponse(map[string]interface{}{
		"message": "token exchange not implemented yet",
	}), nil
}
