package app

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"text-adventure-llm/internal/memory"
	"text-adventure-llm/internal/protocol"
)

const modelName = "@cf/meta/llama-3.1-8b-instruct"

func HandleChat(req ChatRequest) (ChatResponse, error) {
	log.Println("🔥 HandleChat invoked")

	// =========================================================
	// 🎲 DICE GAP — resume AFTER dice roll
	// =========================================================
	if req.Event == "DICE_RESULT" {
		log.Printf(
			"🎲 Dice result received: %s = %d (%s)",
			req.Dice, req.Result, req.Reason,
		)

		// 🧠 Record dice as system memory
		memory.AddTurn(
			"System",
			fmt.Sprintf(
				"Dice roll result: %d (%s) for %s",
				req.Result,
				req.Dice,
				req.Reason,
			),
		)

		// Build prompt with context
		context := memory.GetContext()
		promptBuilder := DungeonMasterSystemPrompt + "\n\n"
		for _, turn := range context {
			promptBuilder += turn.Role + ": " + turn.Content + "\n"
		}
		finalPrompt := promptBuilder

		raw, err := CallCloudflare(finalPrompt)
		if err != nil {
			return ChatResponse{}, err
		}

		log.Printf("🔍 Raw LLM output (after dice):\n%s\n", raw)

		llmResp, ok := parseLLMJSON(raw)
		if !ok {
			return ChatResponse{
				Narrative: "⚠️ LLM JSON parse failed after dice roll.",
				Actions:   []protocol.GameAction{},
				ModelUsed: modelName,
			}, nil
		}

		// 🧠 Record GM narrative
		memory.AddTurn("GM", llmResp.Narrative)

		// 🎯 Filter & convert actions
		return buildResponseFromLLM(llmResp), nil
	}

	// =========================================================
	// 🧠 NORMAL CHAT FLOW (player input)
	// =========================================================
	if req.Input == "" {
		return ChatResponse{}, fmt.Errorf("empty input")
	}

	// 🧠 Record player input
	memory.AddTurn("Player", req.Input)

	// Build prompt with rolling context
	context := memory.GetContext()
	promptBuilder := DungeonMasterSystemPrompt + "\n\n"
	for _, turn := range context {
		promptBuilder += turn.Role + ": " + turn.Content + "\n"
	}
	finalPrompt := promptBuilder

	raw, err := CallCloudflare(finalPrompt)
	if err != nil {
		return ChatResponse{}, err
	}

	log.Printf("🔍 Raw LLM output:\n%s\n", raw)

	llmResp, ok := parseLLMJSON(raw)
	if !ok {
		return ChatResponse{
			Narrative: "⚠️ LLM JSON parse failed. Check logs.",
			Actions:   []protocol.GameAction{},
			ModelUsed: modelName,
		}, nil
	}

	// 🧠 Record GM narrative
	memory.AddTurn("GM", llmResp.Narrative)

	return buildResponseFromLLM(llmResp), nil
}

//
// ======================= HELPERS =======================
//

// Robust JSON normalisation + parsing
func parseLLMJSON(raw string) (protocol.LLMResponse, bool) {
	raw = strings.TrimSpace(raw)

	// Handle quoted JSON
	if strings.HasPrefix(raw, "\"") {
		var unquoted string
		if err := json.Unmarshal([]byte(raw), &unquoted); err == nil {
			raw = strings.TrimSpace(unquoted)
		}
	}

	var llmResp protocol.LLMResponse
	if err := json.Unmarshal([]byte(raw), &llmResp); err != nil {
		log.Printf("❌ JSON parse error: %v\nRaw:\n%s\n", err, raw)
		return protocol.LLMResponse{}, false
	}

	return llmResp, true
}

// Convert LLM actions into safe engine actions
func buildResponseFromLLM(llmResp protocol.LLMResponse) ChatResponse {
	response := ChatResponse{
		Narrative: llmResp.Narrative,
		Actions:   []protocol.GameAction{},
		ModelUsed: modelName,
	}

	for _, action := range llmResp.Actions {
		switch action.Type {

		case protocol.ActionRequestDiceRoll:
			// 🔒 Pause turn and wait for dice
			return ChatResponse{
				Narrative: llmResp.Narrative,
				Actions:   []protocol.GameAction{action},
				ModelUsed: modelName,
			}

		case protocol.ActionAwardXP:
			response.Actions = append(response.Actions, action)

		case protocol.ActionSuggestAction:
			// Pass through suggested actions from the LLM unchanged
			response.Actions = append(response.Actions, action)

		default:
			// 🔗 Convert ANY unknown action into a clickable suggestion
			desc, _ := action.Payload["reason"].(string)
			if desc == "" {
				desc, _ = action.Payload["description"].(string)
			}
			if desc == "" {
				desc, _ = action.Payload["target"].(string)
			}

			if desc != "" {
				response.Actions = append(response.Actions, protocol.GameAction{
					Type: protocol.ActionSuggestAction,
					Payload: map[string]interface{}{
						"label": desc,
						"input": strings.ToLower(desc),
					},
				})
			}
		}
	}

	return response
}
