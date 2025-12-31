from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Action(BaseModel):
    type: str
    payload: Dict[str, Any]
    timestamp: int

@app.post("/sync")
def sync_actions(actions: List[Action]):
    print("Received actions:")
    for action in actions:
        print(action)
    return {"status": "success"}
