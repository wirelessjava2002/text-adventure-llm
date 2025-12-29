package memory

import "sync"

var (
	mu      sync.Mutex
	history = []Turn{}
)

func AddTurn(role, content string) {
	mu.Lock()
	defer mu.Unlock()

	history = append(history, Turn{
		Role:    role,
		Content: content,
	})

	// Keep only last N turns
	if len(history) > 10 {
		history = history[len(history)-10:]
	}
}

func GetContext() []Turn {
	mu.Lock()
	defer mu.Unlock()

	cpy := make([]Turn, len(history))
	copy(cpy, history)
	return cpy
}
