package app

import (
	"fmt"
)

func HandleChat(req ChatRequest) (ChatResponse, error) {
	if req.Message == "" {
		return ChatResponse{}, fmt.Errorf("empty prompt")
	}

	reply, err := CallCloudflare(req.Message)
	if err != nil {
		return ChatResponse{}, err
	}

	return ChatResponse{
		Reply:     reply,
		ModelUsed: "@cf/meta/llama-3.1-8b-instruct",
	}, nil
}
