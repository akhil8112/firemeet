# 🔥 FireMeet

FireMeet is a modern, full-stack web application designed to manage meeting transcripts, AI summaries, and actionable tasks. Built with performance and beautiful UI/UX in mind, FireMeet seamlessly synchronizes audio playback with interactive transcripts.

## 🚀 Features

- **Meetings Dashboard:** View all your past meetings in a clean, searchable, grid layout.
- **Interactive Transcripts:** Play meeting audio while the transcript automatically highlights and scrolls. Click on any transcript line to instantly seek the audio!
- **AI Summaries & Topics:** Quickly review AI-generated meeting overviews and key topics.
- **Action Items Tracking:** Track assigned tasks directly from the meeting and mark them as complete with optimistic UI updates.
- **Transcript Search:** Instantly search through transcript text with native yellow highlighting.
- **Ask AI:** Query an AI directly from the meeting page to quickly extract decisions or notes.
- **Dark Mode Support:** Beautifully designed theme switching.
- **Exporting:** Download your meeting transcripts locally as `.txt` files.

## 🛠️ Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/) (App Router)
- React 18
- TypeScript
- Tailwind CSS
- `lucide-react` (Icons)
- `react-hot-toast` (Notifications)
- `next-themes` (Dark Mode)
- `axios` (API Client)

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- SQLite (Database)
- SQLAlchemy (ORM)
- Pydantic (Data Validation)

## 📁 Architecture & Folder Structure

We follow a clean, modular architecture separating the frontend from the backend. The backend utilizes an MVC-style pattern with routers, services, and schemas.

```text
firemeet/
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # App Router Pages & Layouts
│   │   ├── components/       # Reusable UI Components
│   │   └── lib/              # API and Utility functions
│   └── package.json
│
└── backend/                  # FastAPI Application
    ├── app/
    │   ├── main.py           # Application Entry Point
    │   ├── database.py       # SQLite & SQLAlchemy Config
    │   ├── models/           # DB Table Definitions
    │   ├── schemas/          # Pydantic Validation Models
    │   ├── routes/           # API Endpoints
    │   └── services/         # Core Business Logic (CRUD)
    ├── seed.py               # Database Seeding Script
    └── requirements.txt
```

## 🗄️ Database Schema

The SQLite database is structured with the following models and relationships:
- **Meeting:** Core entity (Title, Date, Duration).
- **Participant:** Users in the system.
- **MeetingParticipant:** Many-to-many join table for meetings and participants.
- **TranscriptSegment:** Belongs to a meeting (Speaker, Timestamp, Text).
- **Summary:** One-to-one with a meeting. Contains **Topics**.
- **ActionItem:** Tasks assigned to users.

## 🔌 API Endpoints

The API is fully documented via Swagger UI at `http://localhost:8000/docs`.
Key endpoints include:
- `GET /api/meetings` - Fetch all meetings
- `GET /api/meetings/{id}` - Fetch a specific meeting with its nested transcript, summary, and actions.
- `POST /api/meetings` - Create a new meeting
- `POST /api/meetings/{id}/transcript/raw` - Parse and upload a raw text transcript.
- `PUT /api/actions/{id}` - Toggle action item completion status.

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/firemeet.git
cd firemeet
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Seed the Database
To populate the database with realistic sample data:
```bash
python seed.py
```

### 4. Run the Backend
```bash
uvicorn app.main:app --reload
```
The API will be running on `http://localhost:8000`.

### 5. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The web application will be running on `http://localhost:3000`.

## ☁️ Deployment

- **Frontend (Vercel):** Connect your GitHub repository to Vercel. Vercel will automatically detect the Next.js framework and configure the build settings. Ensure you set the environment variable for your backend API URL if changed.
- **Backend (Render / Railway):** Deploy the FastAPI application using a standard Python environment. You may want to swap SQLite for PostgreSQL in a production environment by simply changing the `SQLALCHEMY_DATABASE_URL` in `database.py`.

## 🔮 Future Improvements
- Implement real OAuth Authentication (Google/GitHub).
- Swap the placeholder audio player for real S3 bucket audio hosting.
- Connect a real LLM (like OpenAI or Gemini) to the "Ask AI" endpoint.
- Add support for `.vtt` and `.json` transcript uploads.
