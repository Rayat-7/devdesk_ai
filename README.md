# DevDesk AI

> An AI-powered developer assistant built from scratch using Node.js, Express, TypeScript, and OpenRouter.

DevDesk AI is a learning-focused AI engineering project. The goal is to build a developer-support assistant while understanding how modern AI applications work behind the scenes — from connecting to an LLM API to managing conversation memory, streaming responses, processing documents, and eventually building more advanced AI features.

Rather than relying on a prebuilt AI chatbot framework, this project is being developed step by step to understand the architecture and core engineering concepts behind AI-powered applications.

---

## Project Goals

The main goal is to understand how to build a real-world AI application, not simply how to send prompts to an AI model.

Throughout this project, I am learning how to:

- Integrate Large Language Models (LLMs) into a backend application.
- Build REST APIs using Express and TypeScript.
- Manage conversation history and session-based memory.
- Stream AI responses instead of waiting for the entire response.
- Work with external AI providers through APIs.
- Validate and manage user input.
- Understand how AI applications process context.
- Build a foundation for document understanding and Retrieval-Augmented Generation (RAG).
- Develop good backend architecture and software engineering practices.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for the backend |
| Express.js | Backend framework for building REST APIs |
| TypeScript | Type safety and maintainable code |
| OpenRouter | Access to different LLMs through one API |
| OpenAI JavaScript SDK | Communicating with OpenRouter using a compatible API |
| Zod | Request validation and data safety |
| dotenv | Managing environment variables |
| Postman / cURL | Testing API endpoints |
| Git & GitHub | Version control and project hosting |

### AI Provider

This project uses **OpenRouter** as its AI provider.

OpenRouter provides access to multiple language models through a unified API. This makes it possible to experiment with different models without completely changing the backend integration.

The project uses the OpenAI JavaScript SDK with OpenRouter's compatible API endpoint:

`https://openrouter.ai/api/v1`

The selected model is configured through an environment variable, making it easier to switch models.

---

## Current Project Architecture

The backend follows a simple separation-of-concerns structure.

```text
devdesk-ai/
│
├── src/
│   │
│   ├── config/
│   │   └── ai.ts
│   │
│   ├── routes/
│   │   └── chat.routes.ts
│   │
│   ├── controllers/
│   │   └── chat.controller.ts
│   │
│   ├── services/
│   │   └── memory.service.ts
│   │
│   └── server.ts
│
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

### Understanding the folders

**`config/ai.ts`**

Responsible for configuring the AI client.

- Connects the backend to OpenRouter.
- Reads the API key from environment variables.
- Reads the selected AI model from environment variables.
- Exports a reusable AI client.

**`routes/chat.routes.ts`**

Defines the API endpoints and connects them to their controllers.

**`controllers/chat.controller.ts`**

Handles incoming chat requests.

- Receives user messages.
- Validates incoming data.
- Retrieves conversation history.
- Sends context to the AI model.
- Processes the AI response.
- Returns the response to the client.

**`services/memory.service.ts`**

Manages temporary conversation history using JavaScript's `Map`.

- Retrieves previous messages using a session ID.
- Stores user and assistant messages.
- Limits stored history to the most recent 20 messages.

**`server.ts`**

Initializes the Express application, configures middleware, registers routes, and starts the server.

---

# Development Progress

## Milestone 1 — Basic LLM Integration

<status>Completed</status>

The first milestone was to connect a backend application to an actual Large Language Model.

### What I built

- Created a Node.js project with TypeScript.
- Set up an Express server.
- Configured OpenRouter.
- Connected the OpenAI JavaScript SDK to OpenRouter.
- Created a chat API endpoint.
- Sent user messages to an AI model.
- Returned the generated response through the backend.

### API endpoint

`POST /api/chat`

### Example request

```json
{
  "message": "Explain what React is."
}
```

### Example response

```json
{
  "success": true,
  "reply": "React is a JavaScript library..."
}
```

### What I learned

**1. How an LLM API works**

An LLM does not automatically connect to my application. My backend sends an HTTP request to an AI provider, which processes the prompt and returns a generated response.

**2. The role of an SDK**

The OpenAI JavaScript SDK handles much of the HTTP communication and response parsing. OpenRouter provides the API endpoint and the model access.

**3. System and user messages**

- `system`: Defines the AI assistant's behavior.
- `user`: Contains the user's actual question.
- `assistant`: Represents the AI-generated response.

**4. Backend request flow**

```text
Client
  |
  v
Express Server
  |
  v
Chat Route
  |
  v
Chat Controller
  |
  v
OpenRouter API
  |
  v
LLM
  |
  v
AI Response
  |
  v
Client
```

**5. Other concepts learned**

- REST APIs
- HTTP requests and responses
- `async/await`
- Environment variables
- TypeScript imports and exports
- Express middleware
- Zod request validation

---

## Milestone 2 — Conversation Memory

<status>Completed</status>

A basic chatbot can answer questions, but it does not automatically remember previous messages.

The second milestone was to implement conversation memory on the backend.

### What I built

- Created a memory service.
- Used JavaScript's `Map` to store conversations.
- Introduced session IDs.
- Retrieved previous messages using a session ID.
- Sent previous conversation history along with new user messages.
- Stored both user messages and AI responses.
- Limited stored history to the latest 20 messages.

### Example request

```json
{
  "sessionId": "user-001",
  "message": "My favorite framework is Next.js."
}
```

A second request using the same session ID:

```json
{
  "sessionId": "user-001",
  "message": "What is my favorite framework?"
}
```

The AI can answer "Next.js" because the backend retrieves and sends the previous conversation as context.

### How conversation memory works

```text
User sends a message
        |
        v
Backend receives sessionId
        |
        v
Retrieve previous conversation
        |
        v
Combine:
- System message
- Previous messages
- New user message
        |
        v
Send everything to the LLM
        |
        v
Receive AI response
        |
        v
Save user message and AI response
        |
        v
Return response
```

### What I learned

**1. An LLM does not automatically remember previous API requests.**

Each request is processed using the messages and context supplied to the model.

**2. Backend-managed memory**

The backend stores conversation history and sends it to the model whenever a new message arrives.

**3. Session IDs**

A session ID identifies a particular conversation. It allows the backend to retrieve the correct conversation history.

A session ID is not authentication or proof of a user's identity.

**4. JavaScript Map**

I learned how to use `Map` to store and retrieve data using keys.

For this project:

- Key = Session ID
- Value = Conversation history

**5. Context management**

I learned that previous messages become part of the model's context, and that sending too much history can increase token usage.

### Current limitation

Conversation history is currently stored in memory using a JavaScript `Map`.

This means:

- Restarting the server deletes conversation history.
- Multiple server instances do not share the same memory.
- The current implementation is suitable for learning, not production persistence.

A database will be introduced in a later milestone.

---

## Milestone 3 — Streaming AI Responses

<status>In Progress</status>

The next milestone is to make AI responses appear progressively instead of waiting for the entire response.

### Why streaming?

In a normal API request, the client waits until the model finishes generating the entire response.

With streaming, the backend forwards generated content to the client as it arrives.

### Normal response vs streaming

**Normal response**

```text
User asks a question
       |
       v
AI generates complete response
       |
       v
Backend returns response
       |
       v
User sees the answer
```

**Streaming response**

```text
User asks a question
       |
       v
AI starts generating
       |
       v
Backend receives first chunk
       |
       v
Client receives first chunk
       |
       v
More chunks arrive
       |
       v
Complete response
```

### What I am implementing

- A separate streaming endpoint.
- OpenRouter streaming using `stream: true`.
- Async iteration using `for await...of`.
- Server-Sent Events (SSE) to deliver response chunks.
- Accumulation of chunks into a complete response.
- Saving the completed conversation to the existing memory service.

### Planned endpoint

`POST /api/chat/stream`

### What I am learning

- Streaming APIs
- Async iterators
- JavaScript `for await...of`
- Server-Sent Events (SSE)
- HTTP response headers
- Progressive response delivery
- The difference between model streaming and SSE transport

The existing normal chat endpoint will remain available.

---

# Upcoming Learning Roadmap

The following milestones are planned as the project grows.

## Milestone 4 — Document and Image Intelligence

Teach the assistant to understand user-provided files instead of only text messages.

Planned features:

- Upload PDF documents.
- Extract text from PDF files.
- Process DOCX and TXT files.
- Understand image inputs using a vision-capable model.
- Validate file types and file sizes.
- Send extracted content or supported image inputs to the AI model.
- Ask questions about uploaded documents.

**Concepts to learn:**

- File uploads
- Multipart form data
- File validation
- Document parsing
- Vision models
- Multimodal AI

## Milestone 5 — Database and Persistent Memory

Replace temporary JavaScript `Map` storage with persistent database storage.

Planned features:

- Store users and conversations.
- Save individual messages.
- Retrieve previous conversations.
- Keep conversation history after server restarts.

**Concepts to learn:**

- Database design
- Database relationships
- CRUD operations
- Persistent storage
- Conversation management

## Milestone 6 — Embeddings and RAG

Build a system that can answer questions using information from uploaded documents.

Planned features:

- Split documents into smaller chunks.
- Generate embeddings.
- Store embeddings in a vector database.
- Search for relevant document sections.
- Send retrieved context to the LLM.
- Generate answers grounded in the retrieved information.

**Concepts to learn:**

- Embeddings
- Vector databases
- Semantic search
- Chunking
- Retrieval-Augmented Generation (RAG)
- Context injection

## Milestone 7 — AI Agent Capabilities

Move beyond a chatbot that only responds to messages.

Planned features:

- Tool calling.
- Structured outputs.
- Multi-step task execution.
- Developer-focused tools.
- Error analysis and debugging assistance.

**Concepts to learn:**

- AI agents
- Function/tool calling
- Planning and execution
- Structured data
- Agent workflows
- Tool result handling

## Milestone 8 — Frontend Integration

Build a proper user interface for DevDesk AI.

Planned frontend features:

- Chat interface using React or Next.js.
- Streaming text display.
- Conversation history.
- File uploads.
- Markdown rendering.
- Code syntax highlighting.
- Responsive design.

**Concepts to learn:**

- Frontend/backend integration
- Fetch API
- Readable streams
- UI state management
- Loading and error states
- Chat interface architecture

## Milestone 9 — Production Readiness

Improve the application so it is closer to a real-world deployable product.

Planned improvements:

- Authentication and authorization.
- Database-backed sessions.
- Rate limiting.
- Secure file handling.
- Better error handling.
- Logging and monitoring.
- API security.
- Deployment.

---

# Running the Project Locally

## 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd devdesk-ai
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000

OPENROUTER_API_KEY=your_openrouter_api_key

OPENROUTER_MODEL=your_selected_model_id
```

Replace the placeholder values with your own credentials and model ID.

**Never commit your `.env` file or expose your API key.**

## 4. Start the development server

```bash
npm run dev
```

The backend should run at:

`http://localhost:5000`

## 5. Check server health

```http
GET http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "message": "DevDesk AI server is running"
}
```

---

# Current API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check server status |
| POST | `/api/chat` | Send a normal chat request |
| POST | `/api/chat/stream` | Receive a progressively streamed response (in progress) |

### Normal chat request

```json
{
  "sessionId": "user-001",
  "message": "Explain how Node.js works."
}
```

### Streaming chat request

```json
{
  "sessionId": "user-001",
  "message": "Explain how an AI agent works."
}
```

---

# Important Engineering Principles I Am Practicing

1. **Build incrementally:** Each milestone adds a new capability to an already working application.
2. **Understand before implementing:** Learn why each technology and code component is needed.
3. **Keep responsibilities separate:** Routes, controllers, services, and configuration have different responsibilities.
4. **Protect credentials:** API keys belong in environment variables, never in source code.
5. **Validate incoming data:** Never blindly trust client input.
6. **Think about limitations:** A working prototype is not automatically production-ready.
7. **Learn the underlying concepts:** Understand how LLMs, memory, context, streaming, and retrieval work rather than relying entirely on frameworks.

---

# Project Status

| Milestone | Status |
|---|---|
| Node.js + TypeScript setup | Completed |
| Express server | Completed |
| OpenRouter integration | Completed |
| Basic AI chat endpoint | Completed |
| Request validation with Zod | Completed |
| Session-based conversation memory | Completed |
| Streaming responses with SSE | In Progress |
| Document and image understanding | Planned |
| Persistent database memory | Planned |
| Embeddings and RAG | Planned |
| AI agent and tool calling | Planned |
| React / Next.js frontend | Planned |
| Production deployment | Planned |

---

## Final Objective

The long-term objective of DevDesk AI is to become a developer-focused AI assistant capable of understanding code-related questions, analyzing documents and images, remembering conversations, retrieving relevant information, and executing useful developer tasks through tools.

This project is also my practical journey into AI engineering — learning how AI applications are designed, developed, and improved from the backend fundamentals to more advanced AI systems.

**Built step by step, with a focus on understanding the engineering behind AI.**
