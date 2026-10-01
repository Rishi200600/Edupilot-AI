# EduPilot AI

EduPilot AI turns a learning goal such as “I want to learn Machine Learning in 2 months” into a weekly roadmap with daily tasks, useful resources, a difficulty estimate, and progress tracking.

## Features

- A multi-step planning agent parses a goal and schedule, retrieves relevant resources, creates weekly and daily study steps, estimates difficulty, and stores the plan.
- Optional open-weight language-model planning through the Hugging Face Inference API. The default model is mistralai/Mistral-7B-Instruct-v0.3. Without a token, the local plan generator works without network access.
- A keyword retrieval pipeline ranks a curated JSON catalog and attaches up to three relevant resources.
- A PyTorch neural regression model estimates plan difficulty from study hours, experience, goal complexity, and duration.
- A responsive React dashboard shows task completion, progress, weekly focus, resources, and the prediction explanation.
- FastAPI endpoints provide roadmap generation, predictions, chat guidance, and task progress.
- SQLite stores roadmaps and completion state locally.

## Architecture

    React + Vite dashboard
          | REST / JSON
          v
       FastAPI
       ├── Goal parser → planner → daily task builder
       ├── JSON keyword retriever → learning resources
       ├── Optional Hugging Face open-weight model
       ├── PyTorch difficulty model → calibrated difficulty band
       └── SQLite roadmap + task progress

The application is organized so the planner can run deterministically on a local machine. When HF_TOKEN is configured, it asks the selected instruction model for weekly focus areas; output is validated and the local planner still constructs the task schedule.

## Tech stack

- Frontend: React 18, Vite, Tailwind CSS, Lucide icons
- Backend: Python 3.10+, FastAPI, Pydantic, SQLite
- AI: Hugging Face Inference API (Mistral default, configurable); custom lightweight agent loop
- Retrieval: transparent token overlap ranking over data/resources.json
- ML: PyTorch feed-forward regression model

## Setup

### 1. Backend

From the project directory:

~~~bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cd ..
python -m ml_model.train
uvicorn backend.main:app --reload
~~~

The API is available at http://localhost:8000, with interactive docs at http://localhost:8000/docs. The database is created automatically at backend/edupilot.db.

### 2. Optional Hugging Face model

Copy .env.example to .env in the project root, then add a Hugging Face access token with Inference Providers access:

~~~dotenv
HF_TOKEN=hf_your_token
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
~~~

The model service is optional; without it, EduPilot uses its local multi-step planner. If a remote request fails or returns malformed output, the agent safely uses the local weekly plan.

### 3. Frontend

In another terminal:

~~~bash
cd frontend
npm install
npm run dev
~~~

Open http://localhost:5173. To point the frontend at a different API URL, set VITE_API_URL before starting Vite (default: http://localhost:8000).

## How AI is used (MLH)

EduPilot combines generative AI, retrieval, and a supervised ML model as separate steps:

1. **Goal parsing:** The agent extracts the topic, timeframe, learner level, and weekly time budget from structured user input.
2. **Retrieval:** The query is matched against resource titles, topics, and descriptions. The top three matching resources are attached to the plan and supplied as context to the language model.
3. **Plan generation:** When configured, Mistral produces a JSON list of weekly focus areas. The backend validates that response, then creates dated daily Learn, Practice, and Reflect activities. A deterministic local planner ensures a complete plan even when no model is configured.
4. **Difficulty inference:** A PyTorch multilayer perceptron predicts a 0–1 difficulty score. The score is presented as Gentle, Steady, or Intensive with the factors that affect the estimate. Training examples are synthetic and encode a transparent teaching signal; this score is a planning aid, not a promise of learning outcomes.
5. **Feedback loop:** SQLite persists task completion, and the dashboard recalculates progress as learners mark tasks done.

The model is intentionally lightweight. To retrain it or regenerate the checkpoint, run python -m ml_model.train from this directory. The dataset at ml_model/dataset.csv is a small inspectable sample; training generates a larger synthetic dataset when the CSV contains fewer than 200 examples.

## Demo steps

1. Start the API and Vite frontend using the commands above.
2. Enter “I want to learn Machine Learning in 2 months,” select a level and weekly hours, then create the roadmap.
3. Explore week one, check off a daily task, and see the progress card update.
4. Review the difficulty estimate and open a recommended resource.
5. Ask the learning guide a question in the chat panel. The API returns relevant resources and points the learner to roadmap creation.
6. Refresh the page: the active plan and task completion are loaded from SQLite.

## API

- POST /generate-roadmap — goal, level, hours per week, optional duration
- POST /predict — feature inputs for the difficulty regressor
- POST /chat — learning guidance and retrieved resources
- GET /roadmaps — recent saved plans
- GET /roadmaps/{id}/progress — completion map and percentage
- PUT /roadmaps/{id}/tasks/{task_id} — update a daily task
- GET /health — service health check

## Project layout

~~~text
EduPilot-AI/
├── backend/                       FastAPI app, planning agent, retrieval, SQLite, inference
├── frontend/
│   ├── src/components/             Navbar, sidebar, chat box, roadmap cards
│   ├── src/pages/                  Home, dashboard, chat
│   ├── src/App.jsx                 Navigation and shared application state
│   ├── src/api.js                  Configurable backend fetch client
│   └── package.json                React, Vite, Tailwind, and icon dependencies
├── ml_model/                       PyTorch model, training, sample CSV, checkpoint
├── data/resources.json             Curated retrieval catalog
├── .env.example                    Optional model configuration
├── LICENSE                         MIT
└── README.md
~~~

## Notes

- Remote LLM use requires a Hugging Face token and network access; the deterministic agent works locally.
- The default CORS origins support the Vite development server. Set appropriate origins before exposing the API publicly.
- The SQLite database is local application data and is excluded from Git.

## License

MIT. See LICENSE.
