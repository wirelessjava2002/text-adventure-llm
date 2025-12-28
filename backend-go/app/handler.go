package app

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"text-adventure-llm/internal/protocol"
)

const modelName = "@cf/meta/llama-3.1-8b-instruct"

func HandleChat(req ChatRequest) (ChatResponse, error) {
	log.Println("🔥 HandleChat invoked")

	// 🎲 DICE GAP: resume after dice roll
	if req.Event == "DICE_RESULT" {
		log.Printf("🎲 Dice result received: %s = %d (%s)\n",
			req.Dice, req.Result, req.Reason)

		finalPrompt := DungeonMasterSystemPrompt +
			"\n\nSYSTEM EVENT:\n" +
			fmt.Sprintf(
				"Dice roll result: %d (%s) for %s",
				req.Result,
				req.Dice,
				req.Reason,
			)

		raw, err := CallCloudflare(finalPrompt)
		if err != nil {
			return ChatResponse{}, err
		}

		log.Printf("🔍 Raw LLM output (after dice):\n%s\n", raw)

		raw = strings.TrimSpace(raw)
		if strings.HasPrefix(raw, "\"") {
			var unquoted string
			if err := json.Unmarshal([]byte(raw), &unquoted); err == nil {
				raw = strings.TrimSpace(unquoted)
			}
		}

		var llmResp protocol.LLMResponse
		if err := json.Unmarshal([]byte(raw), &llmResp); err != nil {
			return ChatResponse{
				Narrative: "⚠️ LLM JSON parse failed after dice roll.",
				Actions:   []protocol.GameAction{},
				ModelUsed: modelName,
			}, nil
		}

		return ChatResponse{
			Narrative: llmResp.Narrative,
			Actions:   []protocol.GameAction{}, // dice already resolved
			ModelUsed: modelName,
		}, nil
	}

	// 🧠 NORMAL CHAT FLOW
	if req.Input == "" {
		return ChatResponse{}, fmt.Errorf("empty input")
	}

	finalPrompt := DungeonMasterSystemPrompt +
		"\n\nPlayer: " + req.Input

	raw, err := CallCloudflare(finalPrompt)
	if err != nil {
		return ChatResponse{}, err
	}

	log.Printf("🔍 Raw LLM output:\n%s\n", raw)

	raw = strings.TrimSpace(raw)
	if strings.HasPrefix(raw, "\"") {
		var unquoted string
		if err := json.Unmarshal([]byte(raw), &unquoted); err == nil {
			raw = strings.TrimSpace(unquoted)
		}
	}

	var llmResp protocol.LLMResponse
	if err := json.Unmarshal([]byte(raw), &llmResp); err != nil {
		return ChatResponse{
			Narrative: "⚠️ LLM JSON parse failed. Check logs.",
			Actions:   []protocol.GameAction{},
			ModelUsed: modelName,
		}, nil
	}

	// ✅ Always return narrative
	response := ChatResponse{
		Narrative: llmResp.Narrative,
		Actions:   []protocol.GameAction{},
		ModelUsed: modelName,
	}

	// 🔍 Filter actions
	for _, action := range llmResp.Actions {
		switch action.Type {

		case protocol.ActionRequestDiceRoll:
			// 🔒 Pause turn, wait for dice
			return ChatResponse{
				Narrative: llmResp.Narrative,
				Actions:   []protocol.GameAction{action},
				ModelUsed: modelName,
			}, nil

		case protocol.ActionAwardXP:
			response.Actions = append(response.Actions, action)
		}
	}

	return response, nil
}

