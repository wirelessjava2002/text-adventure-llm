package main

import (
	"log"
	"net/http"
	
	"text-adventure-llm/adapters"
	"github.com/joho/godotenv"
)

func main() {
	log.Println("🚨 LOCAL MAIN FILE EXECUTED 🚨")

	_ = godotenv.Load()

	http.HandleFunc("/api/chat", adapters.ChatHTTPHandler)

	log.Println("🚀 Local Go backend on http://localhost:10000")
	log.Fatal(http.ListenAndServe(":10000", nil))
}
