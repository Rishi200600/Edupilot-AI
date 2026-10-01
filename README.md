# EduPilot AI frontend

React + Vite dashboard for creating learning plans, reviewing daily tasks and resources, tracking progress, and chatting with the learning guide.

## Run locally

Start the FastAPI server from the project root in one terminal:

~~~bash
uvicorn backend.main:app --reload
~~~

In another terminal:

~~~bash
cd frontend
npm install
npm run dev
~~~

Open the Vite URL shown in the terminal (normally http://localhost:5173).

## Configure the backend URL

The frontend uses http://localhost:8000 by default. To configure another URL, create frontend/.env.local:

~~~dotenv
VITE_API_URL=https://api.example.com
~~~

Restart the Vite server after changing environment variables.

## Frontend structure

- src/pages/Home.jsx — roadmap request form and saved plans
- src/pages/Dashboard.jsx — progress summary, ML estimate, plan, and resources
- src/pages/Chat.jsx — chat page and suggested prompts
- src/components/Sidebar.jsx — navigation and roadmap history
- src/components/Navbar.jsx — responsive page header
- src/components/ChatBox.jsx — conversation UI
- src/components/RoadmapCard.jsx — week and task display, prediction, resource list
- src/api.js — configurable fetch client for the FastAPI routes

The dashboard calls POST /generate-roadmap, POST /predict, GET /roadmaps, GET /roadmaps/{id}/progress, and PUT /roadmaps/{id}/tasks/{task_id}. Chat calls POST /chat. Chat messages are retained in session storage for the current browser tab session.
