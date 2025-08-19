import os

from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from channels.routing import ProtocolTypeRouter, URLRouter
from django.contrib.auth.models import AnonymousUser
from django.core.asgi import get_asgi_application
from django.urls import path
from rest_framework_simplejwt.authentication import JWTAuthentication

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")

django_asgi_app = get_asgi_application()

from core.consumers import RecommendationConsumer  # noqa: E402


@database_sync_to_async
def authenticate_scope(scope):
	query_string = scope.get("query_string", b"").decode()
	params = dict([part.split("=", 1) for part in query_string.split("&") if "=" in part]) if query_string else {}
	token = params.get("token")
	if not token:
		return AnonymousUser()
	jwt_auth = JWTAuthentication()
	try:
		validated = jwt_auth.get_validated_token(token)
		user = jwt_auth.get_user(validated)
		return user
	except Exception:
		return AnonymousUser()


class QueryStringJWTAuthMiddleware:
	def __init__(self, inner):
		self.inner = inner

	def __call__(self, scope):
		return QueryStringJWTAuthMiddlewareInstance(scope, self.inner)


class QueryStringJWTAuthMiddlewareInstance:
	def __init__(self, scope, inner):
		self.scope = dict(scope)
		self.inner = inner

	async def __call__(self, receive, send):
		self.scope["user"] = await authenticate_scope(self.scope)
		inner = self.inner(self.scope)
		return await inner(receive, send)


application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": QueryStringJWTAuthMiddleware(
            AuthMiddlewareStack(
                URLRouter(
                    [
                        path("ws/recommendations/", RecommendationConsumer.as_asgi()),
                    ]
                )
            )
        ),
    }
)
