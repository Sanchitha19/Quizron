# QuizAI – AI Powered Learning Platform 🚀

QuizAI is a full-stack learning platform that generates AI-powered quizzes based on any topic a user chooses. The system allows users to take quizzes, track their performance, review their answers, and generate AI-based cheatsheets that focus on the areas where they performed poorly.

The goal of the project was to design a system that combines AI-generated content, structured data storage, and a clean user experience while maintaining a reliable backend architecture.

---

# Live Deployment

Frontend:  
https://quizai-frontend.vercel.app  

Backend:  
https://quizai-backend.onrender.com  

---

# Tech Stack

## Backend
- Django
- Django REST Framework
- PostgreSQL
- Redis (optional caching / async tasks)

## Frontend
- Next.js 14
- Tailwind CSS
- Axios
- React Query

## AI Integration
- Groq API (Llama 3.3 70B)
- Gemini 1.5 Flash (fallback)

## Authentication
- JWT Authentication

## Media Handling
- Cloudinary / WhiteNoise

---

# How to Run the Project Locally

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis (optional)

---

# Backend Setup

Clone the repository

```bash
git clone <repo_url>
cd quizai
```

Create virtual environment

```bash
python -m venv venv
```

Activate environment

Mac/Linux

```bash
source venv/bin/activate
```

Windows

```bash
.\venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create `.env` file inside the backend folder

```env
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=postgres://user:password@localhost:5432/quizai_db
GROQ_API_KEY=your_groq_api_key
REDIS_URL=redis://localhost:6379/0
```

Run migrations

```bash
python manage.py migrate
```

Start backend server

```bash
python manage.py runserver
```

Backend will run on

```
http://localhost:8000
```

---

# Frontend Setup

Navigate to frontend folder

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Start frontend server

```bash
npm run dev
```

Frontend will run on

```
http://localhost:3000
```

---

# Database Design Decisions

The database was designed to support quiz sessions, question storage, user answers, and performance tracking.

## User
A custom Django user model is used for authentication and profile management.

It stores:

- username
- email
- authentication credentials

---

## QuizSession

Represents a single quiz attempt by a user.

Fields include:

- topic
- difficulty
- number of questions
- score
- session status

This model connects questions and answers and tracks the progress of each quiz.

---

## Question

Stores AI-generated questions for each quiz session.

Fields include:

- question text
- multiple choice options
- correct answer
- reference to QuizSession

---

## UserAnswer

Tracks the answers submitted by the user.

Fields include:

- selected option
- correctness
- linked question
- linked user

This enables detailed performance tracking and answer review.

---

## CheatSheet

Stores AI-generated study guides based on the user's weak areas.

Fields include:

- topic
- generated content
- PDF file location

Users can view or download the generated study material later.

---

# API Structure

The backend follows a modular RESTful API structure.

---

## Authentication APIs

```
/api/auth/
```

Endpoints include:

- register
- login
- refresh token
- profile

JWT tokens are used to authenticate users.

---

## Quiz APIs

```
/api/quiz/
```

Create a quiz

```
POST /api/quiz/create
```

User provides:

- topic
- difficulty
- number of questions

The AI generates quiz questions.

---

Retrieve quiz session

```
GET /api/quiz/{id}
```

Returns questions, options, and quiz progress.

---

Submit answer

```
POST /api/quiz/{id}/answer
```

Used to validate answers and track user responses.

---

Finish quiz

```
POST /api/quiz/{id}/finish
```

Calculates final score and performance summary.

---

## Profile APIs

```
/api/profile/
```

Returns:

- quiz history
- performance statistics
- topic-wise scores

---

# Challenges Faced and Solutions

## AI Response Reliability

Problem:

Large language models sometimes return malformed JSON or incomplete outputs.

Solution:

A centralized AI client was implemented with:

- automatic retries
- exponential backoff
- schema validation

If the Groq API fails, the system automatically falls back to Gemini.

This ensures quizzes are always generated successfully.

---

## Handling Slow AI Operations

Problem:

Generating cheatsheets can take more than 10 seconds.

Solution:

Cheatsheet generation is triggered manually after quiz completion.

A loading state is shown while the AI generates the study material, keeping the quiz flow fast and responsive.

---

## Performance Analytics

Problem:

Generating statistics for user performance efficiently.

Solution:

Django ORM aggregation functions were used:

- Count
- Avg
- annotations

This allows fast performance summaries without complex queries.

---

# Features Implemented

- User registration and login
- JWT authentication
- AI-generated quizzes
- Topic-based quiz creation
- Difficulty selection
- Quiz progress tracking
- Answer review after completion
- AI-generated cheatsheets
- Downloadable PDF study guides
- Quiz history
- Performance analytics dashboard
- Deployed backend and frontend

---

# Features Skipped (and Why)

## Multiplayer Quizzes

Multiplayer competitions were suggested in the requirements.

However, implementing multiplayer requires:

- WebSocket communication
- real-time synchronization
- matchmaking logic

To ensure a stable MVP, the focus was placed on the core quiz generation and learning features.

---

## Leaderboard System

Leaderboards depend on competitive scoring between multiple users.

Since multiplayer functionality was not implemented, leaderboards were postponed.

---

## Reward / Points System

A reward system was considered but skipped to prioritize:

- quiz generation
- learning analytics
- cheatsheet generation

---

# Future Improvements

Possible improvements include:

- Multiplayer quizzes using WebSockets
- Global leaderboard system
- Reward and achievement system
- Adaptive difficulty levels
- Spaced repetition learning
- Mobile optimized UI
