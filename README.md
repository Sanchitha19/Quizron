# QuizAI - AI-Powered Learning Platform

QuizAI is a full-stack application that leverages advanced AI to generate personalized quizzes and study guides. Built with a robust Django backend and a modern Next.js frontend, it provides a seamless learning experience with features like real-time feedback, performance tracking, and automated study material generation.

## 🚀 Deployment

- **Frontend**: [Vercel](https://quizai-frontend.vercel.app)
- **Backend**: [Render/Railway](https://quizai-backend.onrender.com)

## 🛠️ Tech Stack

- **Backend**: Django, Django REST Framework, PostgreSQL, Redis (for caching/queues)
- **Frontend**: Next.js 14, Tailwind CSS, Axios, React Query
- **AI Integration**: Groq API (Llama-3.3-70b) with Gemini 1.5 Flash as fallback
- **Authentication**: JWT (JSON Web Tokens)
- **Static/Media**: WhiteNoise / Cloudinary

## 📖 Database Design

The database is designed to handle user progress, quiz sessions, and AI-generated content efficiently:

- **User**: Custom user model for authentication.
- **QuizSession**: Tracks a user's attempt at a specific topic, including score, difficulty, and status.
- **Question**: Stores individual quiz questions linked to a session, including text, options, and the correct answer.
- **UserAnswer**: records the user's choice for each question and whether it was correct.
- **CheatSheet**: Stores AI-generated study guides and links to generated PDF files for offline study.

## 🏗️ API Structure

The API follows a modular structure focused on the core quiz flow:

- `/api/auth/`: Registration, Login, Token Refresh, and Profile management.
- `/api/quiz/`: 
    - `POST /create/`: Initiates a new AI-generated quiz session.
    - `GET /[id]/`: Retrieves session details and questions.
    - `POST /[id]/answer/`: Submits an answer for real-time validation.
    - `POST /[id]/finish/`: Completes the session and calculates the final score.
- `/api/profile/`: history and performance statistics.

## 🏃 Setup Instructions (Local)

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis (optional for local)

### Backend Setup
1. Clone the repository.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` directory:
   ```env
   SECRET_KEY=your_secret_key
   DEBUG=True
   DATABASE_URL=postgres://user:pass@localhost:5432/quizai_db
   GROK_API_KEY=your_groq_api_key
   REDIS_URL=redis://localhost:6379/0
   ```
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🧠 Architectural Decisions & Challenges

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

## ✅ Implemented vs. Skipped

- **Implemented**: Full quiz lifecycle, JWT Auth, AI provider fallback, PDF generation (via weasyprint), responsive dashboard.
- **Skipped**: WebSocket-based multiplayer (prioritized rock-solid core quiz flow for MVP), Email notifications (kept it local to focus on deployment reliability).
