import asyncio

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    Header,
    status,
    WebSocket,
    WebSocketDisconnect,
)
from db.database import get_session
from sqlalchemy.orm import Session

from config import Config

from typing import List, Dict

from externals.userRole import UserRole

from db import crud

import json

from websockets.exceptions import ConnectionClosedOK

from .. import schemas

SURVEYS_RESULTS_UPDATE_SEC = 5

router = APIRouter(tags=["tag"])


class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.connections.remove(websocket)

    async def broadcast(self, data: dict):
        for connection in self.connections:
            await connection.send_json(data)


manager = ConnectionManager()


@router.websocket("/ws/article")
async def websocket_broad(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            token, id, date, data = data.split(";")
            if token == Config.SECRET_TOKEN_WS:
                await manager.broadcast(
                        {
                            "type": "CreateNewUser",
                            "id": id,
                            "TimeStamp": date,
                            "data": json.loads(data)
                        }
                
                )
    except:
        manager.disconnect(websocket)


# @router.websocket("/ws/surveys")
# async def survey_results(
#         websocket: WebSocket,
#         session: Session = Depends(get_session)
# ):
#     await websocket.accept()
#     try:
#         while True:
#             users_results = crud.get_surveys_results(session)
#             await websocket.send_json(users_results)
#             await asyncio.sleep(SURVEYS_RESULTS_UPDATE_SEC)
#     except ConnectionClosedOK:
#         await websocket.close()
