# Quizron – AI Powered Learning Platform 

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

##  Architectural Decisions & Challenges

### AI Reliability Engine
**Challenge**: LLM APIs can occasionally time out or provide malformed JSON.
**Solution**: I implemented a centralized `ai_client` with:
- **Automatic Retries**: 3 attempts with exponential backoff.
- **Provider Fallback**: If Groq fails, the system automatically falls back to Gemini.
- **Schema Validation**: Robust regex-based JSON extraction to ensure the data always fits the database models.

### User Experience
**Challenge**: Large study guides can take 10+ seconds to generate.
**Solution**: Implemented a "Generate Cheatsheet" trigger on the results page with a client-side loading state, ensuring the initial quiz flow remains snappy while the heavy lifting is done on demand.

### Performance Tracking
**Challenge**: Complex aggregations for student statistics.
**Solution**: Leveraged Django's aggregation framework (`Count`, `Avg`) to provide real-time performance summaries without overloading the database.

## Implemented vs. Skipped

- **Implemented**: Full quiz lifecycle, JWT Auth, AI provider fallback, PDF generation (via weasyprint), responsive dashboard.
- **Skipped**: WebSocket-based multiplayer (prioritized rock-solid core quiz flow for MVP), Email notifications (kept it local to focus on deployment reliability).
