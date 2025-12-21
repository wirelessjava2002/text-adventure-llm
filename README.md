# 🧙‍♂️ Dungeon Master — Serverless AI RPG (Go + AWS)

A cloud-native, serverless **AI Dungeon Master** that delivers a Dungeons & Dragons–style role-playing experience through a modern web UI.  
This project is both a **learning platform for AWS serverless architecture** and a **fully functional game engine** driven by large language models.

---

## ✨ Project Goals

- Build a **fully serverless backend** using AWS
- Learn and apply **AWS Lambda, API Gateway, DynamoDB, SAM, CloudWatch**
- Implement a **clean Go backend** that runs both locally and in Lambda
- Integrate a **low-cost LLM provider (Cloudflare Workers AI)** via REST
- Create a **React-based frontend** hosted on S3
- Maintain a professional, production-style architecture
- Keep everything **re-deployable via Infrastructure as Code** (monthly account resets)

---

## 🏗️ High-Level Architecture

React Frontend (S3)
|
v
API Gateway (REST API)
|
v
AWS Lambda (Go)
|
v
Cloudflare Workers AI (LLM)


> No EC2.  
> No VPC.  
> No Bedrock dependency.  
> Minimal cost, maximum learning.

---

## 🖥️ Frontend

- **React** (Create React App)
- Hosted on **Amazon S3** (static website hosting)
- Local dev via `npm start`
- Production build via `npm run build`
- Communicates with backend via REST (`/api/chat`)

### Key UI Features
- Chat-based Dungeon Master interface
- Dice rolling with **3D animated dice**
- D&D 5e-style character panel
- Inventory and stat tracking
- Clean two-panel layout (no scrolling issues)

---

## ⚙️ Backend (Go)

The backend is written entirely in **Go**, designed with **clean separation of concerns**:


### Key Backend Features
- Runs **locally** (`go run ./cmd/local`)
- Runs in **AWS Lambda** (same code)
- Cloudflare Workers AI integration via REST
- Explicit CORS handling for browser clients
- Structured logging (CloudWatch-ready)
- Secrets stored in **AWS SSM Parameter Store**

---

## ☁️ AWS Services Used

| Service | Purpose |
|------|--------|
| S3 | Host React frontend |
| API Gateway (REST) | Public HTTP API |
| Lambda (Go) | Serverless backend |
| CloudWatch Logs | Observability & debugging |
| SSM Parameter Store | Secure secrets |
| SAM | Infrastructure as Code |

> DynamoDB, Cognito, EventBridge are planned next.

---

## 🤖 LLM Integration

- **Provider:** Cloudflare Workers AI  
- **Model:** `@cf/meta/llama-3.1-8b-instruct`  
- **Access:** REST API (no Bedrock dependency)
- **Reason:** Low cost, reliable, cloud-agnostic

The backend calls Cloudflare directly from Lambda using standard HTTPS — no VPC or NAT required.

---

## 🚀 Running Locally

### Backend (Go)
```bash
cd backend-go
go run ./cmd/local


``bash
http://localhost:10000/api/chat
npm start
```

Local Lambda
```bash
sam build
sam local start-api
```

Deploying to AWS

One time
```bash
aws ssm put-parameter --name /dm/cloudflare/account_id --type String --value "<ACCOUNT_ID>"
aws ssm put-parameter --name /dm/cloudflare/api_token --type SecureString --value "<API_TOKEN>"
```
Deploy
```bash
sam deploy --guided
```
SAM will output an API Gateway URL such as:
```bash
https://xxxx.execute-api.eu-west-2.amazonaws.com/Prod/api/chat
```

🔮 Planned Enhancements

DynamoDB session persistence

Multi-agent NPC personas

Dice modifiers & combat resolution

Cognito authentication

Rate limiting / usage caps

EventBridge for async tasks

CloudFront for frontend CDN

Step Functions for complex orchestration