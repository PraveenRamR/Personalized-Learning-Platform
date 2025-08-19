# Backend Project Structure

This Django project has been organized into a modular structure to improve maintainability, separation of concerns, and scalability.

## Module-Based Architecture

The project is organized into modules, each with specific responsibilities:

```
backend/
    core/
        modules/
            auth/                 # Authentication functionality
            profiles/             # User profiles management
            content/              # Content items management
            interactions/         # User interactions tracking
            recommendations/      # Recommendation engine
        services/
            recommendation_service/ # Business logic for recommendations
```

## Module Structure

Each module follows a consistent structure:

- `models.py` - Database models
- `serializers.py` - REST framework serializers
- `views.py` - API views and viewsets
- `urls.py` - URL routing
- `apps.py` - App configuration
- `signals.py` (where applicable) - Django signals
- `consumers.py` (where applicable) - WebSocket consumers
- `routing.py` (where applicable) - WebSocket routing

## Services Layer

The services layer contains business logic that may be used across multiple modules:

- `recommendation_service/` - Contains recommendation generation algorithms

## URL Structure

API endpoints are organized by module functionality:

- `/api/auth/` - Authentication endpoints
- `/api/profiles/` - User profile endpoints
- `/api/content/` - Content item endpoints
- `/api/interactions/` - User interaction endpoints
- `/api/recommendations/` - Recommendation endpoints

## WebSockets

WebSocket endpoints are available for real-time functionality:

- `/ws/recommendations/` - Real-time recommendation updates
