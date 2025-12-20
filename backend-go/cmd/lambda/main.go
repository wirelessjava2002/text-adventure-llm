package main

import (
	"text-adventure-llm/adapters"
	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	lambda.Start(adapters.ChatLambdaHandler)
}
