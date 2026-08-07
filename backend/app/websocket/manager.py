from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.connections = {}


    async def connect(
        self,
        restaurant_id: int,
        websocket: WebSocket
    ):
        await websocket.accept()

        if restaurant_id not in self.connections:
            self.connections[restaurant_id] = []

        self.connections[restaurant_id].append(websocket)


    def disconnect(
        self,
        restaurant_id: int,
        websocket: WebSocket
    ):
        self.connections[restaurant_id].remove(websocket)


    async def broadcast(
        self,
        restaurant_id: int,
        data: dict
    ):

        if restaurant_id not in self.connections:
            return

        for websocket in self.connections[restaurant_id]:
            await websocket.send_json(data)


manager = ConnectionManager()