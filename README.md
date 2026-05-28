# Support CRM

A full-stack customer support ticketing system built with FastAPI, SQLite, and React.

## Stack

- **Backend**: Python 3.11+ / FastAPI / SQLAlchemy / SQLite
- **Frontend**: React 18 / Vite / Tailwind CSS
- **Deployment**: Railway (backend) / Vercel or Railway (frontend)

## Project Structure

```
support-crm/
├── backend/
│   ├── main.py          # FastAPI app, CORS, router registration
│   ├── database.py      # SQLAlchemy engine and session
│   ├── models.py        # ORM models: Ticket, Note
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── routers/
│   │   └── tickets.py   # All /api/tickets endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js          # Axios API client
│   │   ├── components/
│   │   │   ├── Layout.jsx         # Sidebar + page shell
│   │   │   └── StatusBadge.jsx    # Status and priority pills
│   │   └── pages/
│   │       ├── Dashboard.jsx      # Ticket list, search, stats
│   │       ├── CreateTicket.jsx   # New ticket form
│   │       └── TicketDetail.jsx   # Detail view + update panel
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── Procfile
├── railway.json
├── .env.example
└── .gitignore
```

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

The Vite dev server proxies `/api` requests to `http://localhost:8000` automatically.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tickets` | Create a new ticket |
| GET | `/api/tickets` | List tickets (supports `status`, `priority`, `search`, `page`, `limit` query params) |
| GET | `/api/tickets/stats` | Aggregate counts by status |
| GET | `/api/tickets/{ticket_id}` | Get ticket detail with notes |
| PUT | `/api/tickets/{ticket_id}` | Update status, priority, or add a note |
| DELETE | `/api/tickets/{ticket_id}` | Delete a ticket |

### Example Requests

```bash
# Create a ticket
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Jane Smith","customer_email":"jane@example.com","subject":"Login issue","description":"Cannot log in since yesterday","priority":"High"}'

# List open tickets
curl "http://localhost:8000/api/tickets?status=Open"

# Search
curl "http://localhost:8000/api/tickets?search=jane"

# Update status and add a note
curl -X PUT http://localhost:8000/api/tickets/TKT-0001 \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress","note_text":"Investigating the issue","note_author":"Support Agent"}'
```

## Database Schema

### tickets

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| ticket_id | VARCHAR | Unique, e.g. TKT-0001 |
| customer_name | VARCHAR | |
| customer_email | VARCHAR | Indexed |
| subject | VARCHAR | |
| description | TEXT | |
| status | VARCHAR | Open / In Progress / Closed |
| priority | VARCHAR | Low / Medium / High / Critical |
| created_at | DATETIME | Auto-set |
| updated_at | DATETIME | Auto-updated |

### notes

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| ticket_id | VARCHAR | Foreign key to tickets.ticket_id |
| note_text | TEXT | |
| author | VARCHAR | Defaults to "Support Agent" |
| created_at | DATETIME | Auto-set |

## Deployment

### Backend on Railway

1. Push this repository to GitHub.
2. Create a new project on [Railway](https://railway.app).
3. Connect the GitHub repository.
4. Railway will detect the `Procfile` and `requirements.txt` automatically.
5. Set the `DATABASE_URL` environment variable if using PostgreSQL (Railway provides one). Otherwise SQLite will be used.
6. Copy the Railway deployment URL.

### Frontend on Vercel

1. Import the repository on [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Add environment variable: `VITE_API_URL=https://your-railway-url.up.railway.app`
4. Deploy.

### Frontend on Railway (same project)

Add a second service in Railway pointing to the `frontend` directory and set the build command to `npm run build` with output directory `dist`. Set `VITE_API_URL` to the backend service URL.

## Environment Variables

Copy `.env.example` to `.env` in the respective directories and fill in values.

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./support_crm.db` | SQLAlchemy-compatible DB URL |
| `PORT` | `8000` | Port the uvicorn server listens on |
| `VITE_API_URL` | `` (empty, uses proxy) | Backend base URL for production builds |
