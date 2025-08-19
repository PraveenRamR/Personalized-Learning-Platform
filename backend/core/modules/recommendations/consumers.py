import json
from channels.generic.websocket import AsyncWebsocketConsumer

class RecommendationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if user and user.is_authenticated:
            self.group_name = f"user_{user.id}_recs"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            await self.send_json({"event": "connected", "user_id": user.id})
        else:
            await self.close()

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            # Echo ping/pong
            data = json.loads(text_data)
            if data.get("type") == "ping":
                await self.send_json({"type": "pong"})

    async def recommendation_update(self, event):
        await self.send_json(event.get("message", {}))

    async def send_json(self, payload):
        await self.send(text_data=json.dumps(payload))
