package app

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Reply     string `json:"reply"`
	ModelUsed string `json:"modelUsed"`
}
