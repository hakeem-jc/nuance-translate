# Nuance Translate

AI-powered translation application that captures linguistic nuance by allowing users to control **dialect, tone (formal/informal), plurality (singular/plural), and optional gender context** — going beyond literal translation.

---

## Overview

Nuance Translate is a full-stack Next.js application that integrates with the OpenAI API to generate context-aware translations. Unlike traditional translators, it enables users to fine-tune how translations are rendered by specifying:

* Target dialect (e.g., Castilian Spanish vs. Mexican Spanish)
* Tone (formal vs. informal)
* Plurality preferences
* Optional gender context

The goal is to simulate real-world linguistic decision-making rather than one-to-one word substitution.

---

## Technical Stack

**Frontend**

* Next.js (App Router)
* TypeScript
* React
* Tailwind CSS
* Lucide Icons
* React Toastify

**Backend**

* Next.js Route Handlers (App Router API)
* OpenAI API integration
* Structured prompt construction

**Deployment**

* Vercel

---

## Key Technical Highlights

### 1. Structured Prompt Engineering

Instead of sending raw user input directly to the LLM, the API layer builds a deterministic instruction set:

* Explicit source/target language definition
* Conditional inclusion of dialect
* Conditional tone injection
* Optional plurality and gender logic
* Guardrails for output formatting

This reduces ambiguity and improves response consistency.

---

### 2. Dynamic UI/UX Behavior

* Character count tracking (max 5,000 chars)
* Speech-to-text input
* Text-to-speech output with cancellation support
* Mobile-first responsive design
* Conditional rendering for mobile vs desktop
* LocalStorage persistence for user preferences

---

### 3. API Design

**POST /api/translate**

Request structure:

```ts
type TranslateRequest = {
  text: string
  from: string
  to: string
  options?: {
    dialect?: string
    tone?: "formal" | "informal"
    plurality?: "singular" | "plural"
    gender?: string
  }
}
```

The API constructs a controlled instruction prompt before forwarding to OpenAI.

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nuance-translate.git
cd nuance-translate
```

### 2. Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

---

### 3. Create an OpenAI API Key

1. Go to: [https://platform.openai.com/](https://platform.openai.com/)
2. Sign in or create an account.
3. Navigate to **API Keys**.
4. Generate a new secret key.
5. Copy the key (it will not be shown again).

---

### 4. Configure Environment Variables

Create a `.env.local` file in the root of the project:

```bash
touch .env.local
```

Add the following:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Important:

* Do **not** commit `.env.local`.
* Ensure `.env.local` is listed in `.gitignore`.

---

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at:

```
http://localhost:3000
```

---

## Environment Variables

| Variable       | Description           | Required |
| -------------- | --------------------- | -------- |
| OPENAI_API_KEY | OpenAI API secret key | Yes      |

---

## Engineering Considerations

* Deterministic prompt structure to reduce hallucination
* Clean separation between UI state and translation logic
* Defensive handling for speech recognition edge cases
* SSR-compatible metadata configuration
* Scalable architecture for adding history, authentication, or usage tracking

---

## Future Improvements

* Persistent translation history (database-backed)
* User accounts and saved preferences
* Rate limiting + usage tracking
* Streaming responses
* Multi-model comparison
* Evaluation harness for translation quality benchmarking


---

## Author

Hakeem Clarke
Senior Software Engineer
Kingston, Jamaica
