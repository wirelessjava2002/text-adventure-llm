package protocol

type LLMResponse struct {
	Narrative string       `json:"narrative"`
	Actions   []GameAction `json:"actions"`
}

type GameAction struct {
	Type    string                 `json:"type"`
	Payload map[string]interface{} `json:"payload"`
}

