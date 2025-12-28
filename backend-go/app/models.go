package app

import "text-adventure-llm/internal/protocol"

type ChatRequest struct {
	Input  string `json:"input,omitempty"`

	Event  string `json:"event,omitempty"`  // e.g. "DICE_RESULT"
	Dice   string `json:"dice,omitempty"`   // e.g. "1d20"
	Result int    `json:"result,omitempty"` // e.g. 14
	Reason string `json:"reason,omitempty"`
}

type ChatResponse struct {
	Narrative string                `json:"narrative"`
	Actions   []protocol.GameAction `json:"actions"`
	ModelUsed string                `json:"modelUsed"`
}
