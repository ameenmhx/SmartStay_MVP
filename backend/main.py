import os
import json
from typing import List, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize FastAPI App
app = FastAPI(
    title="SmartStay Backend API",
    description="Backend API for SmartStay hotel service request handling and real-time waiter notifications.",
    version="1.0.0"
)

# Enable CORS for cross-origin requests from frontend apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast JSON message to all active WebSocket connections."""
        message_json = json.dumps(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message_json)
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager()


# Pydantic Schemas
class ServiceRequestCreate(BaseModel):
    room_number: str
    item_requested: str


class ServiceRequestStatusUpdate(BaseModel):
    status: str


# Root Health Check Endpoint
@app.get("/")
def read_root():
    return {"message": "SmartStay Backend API is running"}


# POST /request - Create service request and broadcast to WebSockets
@app.post("/request", status_code=status.HTTP_201_CREATED)
async def create_service_request(request_data: ServiceRequestCreate):
    payload = {
        "room_number": request_data.room_number,
        "item_requested": request_data.item_requested,
        "status": "Pending"
    }

    try:
        # Insert into "service_requests" table in Supabase
        response = supabase.table("service_requests").insert(payload).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No data returned from database insertion."
            )
            
        inserted_record = response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to insert service request into Supabase: {str(e)}"
        )

    # Broadcast new request details to all connected WebSockets
    broadcast_message = {
        "event": "NEW_SERVICE_REQUEST",
        "data": inserted_record
    }
    await manager.broadcast(broadcast_message)

    return {
        "message": "Service request created successfully",
        "data": inserted_record
    }


# PATCH /request/{request_id}/status - Update request status and broadcast update
@app.patch("/request/{request_id}/status")
async def update_service_request_status(request_id: str, status_data: ServiceRequestStatusUpdate):
    new_status = status_data.status
    formatted_id = int(request_id) if request_id.isdigit() else request_id
    updated_record = None

    try:
        # Update status in Supabase table
        response = (
            supabase.table("service_requests")
            .update({"status": new_status})
            .eq("id", formatted_id)
            .execute()
        )
        if response.data and len(response.data) > 0:
            updated_record = response.data[0]
    except Exception as e:
        print(f"Supabase update error: {e}")

    if not updated_record:
        updated_record = {"id": formatted_id, "status": new_status}

    # Broadcast status update message to all active WebSockets
    broadcast_message = {
        "event": "STATUS_UPDATE",
        "data": updated_record
    }
    await manager.broadcast(broadcast_message)

    return {
        "message": "Status updated successfully",
        "data": updated_record
    }


# PUT /request/{request_id} - Update request status and broadcast update
@app.put("/request/{request_id}")
async def put_service_request_status(request_id: str, status_data: ServiceRequestStatusUpdate):
    new_status = status_data.status
    formatted_id = int(request_id) if request_id.isdigit() else request_id
    updated_record = None

    try:
        # Update status in Supabase table
        response = (
            supabase.table("service_requests")
            .update({"status": new_status})
            .eq("id", formatted_id)
            .execute()
        )
        if response.data and len(response.data) > 0:
            updated_record = response.data[0]
    except Exception as e:
        print(f"Supabase update error: {e}")

    if not updated_record:
        updated_record = {"id": formatted_id, "status": new_status}

    # Broadcast status update message to all active WebSockets
    broadcast_message = {
        "event": "STATUS_UPDATE",
        "data": updated_record
    }
    await manager.broadcast(broadcast_message)

    return {
        "message": "Service request status updated successfully",
        "data": updated_record
    }




# GET /requests - Fetch all active requests from Supabase
@app.get("/requests")
async def get_service_requests():
    try:
        # Fetch requests from "service_requests" table
        response = supabase.table("service_requests").select("*").execute()
        return {
            "status": "success",
            "count": len(response.data) if response.data else 0,
            "data": response.data or []
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch requests from Supabase: {str(e)}"
        )


# WebSocket /ws/waiter - Manage active connections for waiters
@app.websocket("/ws/waiter")
async def websocket_waiter_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open and await incoming messages (if any)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
