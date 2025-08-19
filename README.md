# Personalized Learning Platform (Django + React)

A comprehensive asynchronous full-stack web application for AI-driven personalized learning content with user registration, admin content management, and enhanced UI.

## Features

- **User Authentication & Registration**: JWT-based auth with user registration and profile management
- **Admin Content Management**: Admin users can create and manage learning content
- **AI-Powered Recommendations**: Advanced collaborative filtering using scikit-surprise library
- **Real-time Updates**: WebSocket notifications for instant recommendation updates
- **Responsive UI**: Modern Bootstrap-based interface with mobile support
- **Rich Content**: 100+ diverse content items across programming, science, business, arts, and health
- **Intelligent Learning**: Machine learning models that improve recommendations based on user interactions

## Tech Stack

- **Backend**: Django REST Framework + JWT auth + Celery + Redis + Channels + scikit-surprise
- **Frontend**: React + TypeScript + Bootstrap + React Query + Formik
- **Database**: PostgreSQL
- **Background Jobs**: Celery with Redis broker
- **AI/ML**: Collaborative filtering with scikit-surprise library

## Quick Start

### Prerequisites
- Docker Desktop
- Git

### Setup

1. Clone and navigate to the project:
```bash
git clone <repository-url>
cd Interview-Assignment
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Build and run with Docker:
```bash
docker compose up --build
```

4. Create admin user:
```bash
docker compose exec backend python manage.py createsuperuser
```

### Access Points

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000/api/
- **API Documentation**: http://localhost:8000/api/docs/
- **Admin Panel**: http://localhost:8000/admin/

## User Guide

### Registration & Login
1. Click "Register" to create a new account
2. Fill in username, password, and optional profile information
3. Login with your credentials
4. Update your interests to get personalized recommendations

### Admin Features
1. Login as an admin user (created via `createsuperuser`)
2. Click "Add Content" button in the navigation
3. Fill out the content form with title, description, type, URL, and tags
4. Submit to add new learning content

### Content Interaction
- Browse AI-powered recommendations using collaborative filtering
- View all available content in the table format
- Click "Like", "Dislike", or "View" to record interactions
- Click "Refresh Recommendations" to trigger AI model updates
- Update your interests to see new recommendations

## API Endpoints

### Authentication
- `POST /api/token/` - Login
- `POST /api/token/refresh/` - Refresh token
- `POST /api/users/register/` - User registration

### Content Management
- `GET /api/content-items/` - List all content
- `POST /api/content-items/` - Create content (admin only)

### AI Recommendations
- `GET /api/recommendations/personalized/` - Get AI-powered recommendations
- `POST /api/recommendations/trigger_refresh/` - Trigger recommendation refresh
- `GET /api/recommendations/status/` - Get recommendation status

### User Profile
- `GET /api/profiles/me/` - Get user profile
- `PATCH /api/profiles/me/` - Update user profile

### Interactions
- `POST /api/interactions/` - Record user interactions

## AI/ML Features

### Collaborative Filtering
The platform uses the `scikit-surprise` library to implement advanced collaborative filtering:

- **SVD Algorithm**: Singular Value Decomposition for matrix factorization
- **Real-time Learning**: Model updates based on user interactions
- **Fallback System**: Content-based recommendations when AI data is insufficient
- **Performance Monitoring**: RMSE metrics and model evaluation

### Recommendation Sources
- **AI Collaborative Filtering**: Machine learning predictions based on user behavior patterns
- **Content-Based Fallback**: Interest-based matching using user preferences and content tags

### Technical Details
- Asynchronous model training using Celery
- WebSocket notifications for real-time updates
- Comprehensive logging and monitoring
- Detailed documentation in `SURPRISE_INTEGRATION.md`

## Development

### Local Development (without Docker)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_content
python manage.py runserver
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database Seeding
The application comes with 100+ pre-seeded content items:
- 30 Programming & Technology items
- 25 Science & Mathematics items  
- 20 Business & Economics items
- 15 Arts & Humanities items
- 10 Health & Wellness items
- 5 Quiz items

To re-seed the database:
```bash
docker compose exec backend python manage.py seed_content
```

## Project Structure

```
├── backend/
│   ├── app/                 # Django project settings
│   ├── core/               # Main application
│   │   ├── models.py       # Data models
│   │   ├── views.py        # API views
│   │   ├── serializers.py  # DRF serializers
│   │   ├── consumers.py    # WebSocket consumers
│   │   └── tasks.py        # Celery tasks
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── api.ts          # API functions
│   │   └── styles.css      # Custom styles
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## Security Features

- JWT authentication with configurable token lifetimes
- Input validation with Formik and Yup
- Admin-only content creation permissions
- CORS configuration for frontend-backend communication
- Rate limiting on API endpoints

## Testing

### Backend Tests
```bash
docker compose exec backend python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

The application is containerized and ready for deployment:

1. Set production environment variables
2. Build and push Docker images
3. Deploy with docker-compose or Kubernetes
4. Configure production database and Redis instances

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

-----------------------------------------
This project is for demonstration purposes.

