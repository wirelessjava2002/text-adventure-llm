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
	// 🎲 DICE GAP — resume AFTER a dice roll
	// =========================================================
	if req.Event == "DICE_RESULT" {
		log.Printf(
			"🎲 Dice result received: %s = %d (%s)\n",
			req.Dice, req.Result, req.Reason,
		)

		// STEP 5️⃣ — record dice result as SYSTEM memory
		memory.AddTurn(
			"System",
			fmt.Sprintf(
				"Dice roll result: %d (%s) for %s",
				req.Result,
				req.Dice,
				req.Reason,
			),
		)

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

		// STEP 4️⃣ — record GM narrative AFTER dice outcome
		memory.AddTurn("GM", llmResp.Narrative)

		return ChatResponse{
			Narrative: llmResp.Narrative,
			Actions:   []protocol.GameAction{},
			ModelUsed: modelName,
		}, nil
	}

	// =========================================================
	// 🧠 NORMAL CHAT FLOW (player input)
	// =========================================================
	if req.Input == "" {
		return ChatResponse{}, fmt.Errorf("empty input")
	}

	// STEP 4️⃣ — record Player input BEFORE calling LLM
	memory.AddTurn("Player", req.Input)

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

	// STEP 4️⃣ — record GM narrative
	memory.AddTurn("GM", llmResp.Narrative)

	// Prepare response
	response := ChatResponse{
		Narrative: llmResp.Narrative,
		Actions:   []protocol.GameAction{},
		ModelUsed: modelName,
	}

	// =========================================================
	// 🎯 Action filtering / Dice request pause
	// =========================================================
	for _, action := range llmResp.Actions {
		switch action.Type {

		case protocol.ActionRequestDiceRoll:
			// 🔒 Pause turn — do NOT record GM twice
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

