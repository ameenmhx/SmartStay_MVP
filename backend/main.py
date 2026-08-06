import os
import json
from typing import List, Dict, Any, Optional
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


class GuestReviewCreate(BaseModel):
    room_number: str
    rating: int
    comment: str = ""


class GalleryItem(BaseModel):
    title: str
    description: str
    image_url: str


class GalleryItemUpdate(BaseModel):
    title: str
    description: str


class ServiceCreate(BaseModel):
    name: str
    category: str
    tag: Optional[str] = ""
    description: Optional[str] = ""
    is_quick_service: Optional[bool] = False


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    is_quick_service: Optional[bool] = None






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


# DELETE /request/{request_id} - Delete specific service request and broadcast cancel event
@app.delete("/request/{request_id}")
async def delete_service_request(request_id: str):
    formatted_id = int(request_id) if request_id.isdigit() else request_id
    try:
        response = (
            supabase.table("service_requests")
            .delete()
            .eq("id", formatted_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete service request {request_id}: {str(e)}"
        )

    # Broadcast cancel message to all active WebSockets
    broadcast_message = {
        "type": "cancel",
        "request_id": request_id
    }
    await manager.broadcast(broadcast_message)

    return {
        "message": f"Successfully cancelled and deleted service request {request_id}",
        "request_id": request_id,
        "deleted_records": response.data or []
    }

# DELETE /requests/completed - Delete all completed (Delivered/Fulfilled) service requests and broadcast clear event
@app.delete("/requests/completed")
async def delete_completed_requests():
    try:
        response = (
            supabase.table("service_requests")
            .delete()
            .in_("status", ["Delivered", "Fulfilled"])
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete completed service requests: {str(e)}"
        )

    # Broadcast clear completed event to all connected WebSockets
    broadcast_message = {
        "type": "clear_completed"
    }
    await manager.broadcast(broadcast_message)

    return {
        "message": "Successfully cleared all completed/delivered service requests",
        "deleted_records": response.data or []
    }


class NudgePayload(BaseModel):
    request_id: Optional[Any] = None
    room_number: Any
    item_name: Optional[str] = "Service Request"


# POST /nudge - Broadcast NUDGE_WAITER reminder event to all connected waiters
@app.post("/nudge")
async def nudge_waiter(payload: NudgePayload):
    broadcast_message = {
        "event": "NUDGE_WAITER",
        "request_id": payload.request_id,
        "room_number": str(payload.room_number),
        "item_name": payload.item_name or "Service Request",
    }
    await manager.broadcast(broadcast_message)
    return {
        "status": "success",
        "message": f"Nudge sent to waiters for Room {payload.room_number}",
        "data": broadcast_message
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


# POST /reviews - Save a new guest review to "guest_reviews" Supabase table
@app.post("/reviews", status_code=status.HTTP_201_CREATED)
async def create_guest_review(review_data: GuestReviewCreate):
    payload = {
        "room_number": review_data.room_number,
        "rating": review_data.rating,
        "comment": review_data.comment
    }

    try:
        response = supabase.table("guest_reviews").insert(payload).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No data returned from review insertion."
            )
        inserted_record = response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to insert review into Supabase: {str(e)}"
        )

    return {
        "message": "Guest review submitted successfully",
        "data": inserted_record
    }


# GET /reviews - Fetch all guest reviews from "guest_reviews" Supabase table
@app.get("/reviews")
async def get_guest_reviews():
    try:
        response = supabase.table("guest_reviews").select("*").execute()
        return {
            "status": "success",
            "count": len(response.data) if response.data else 0,
            "data": response.data or []
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch reviews from Supabase: {str(e)}"
        )


# DELETE /feedback/{feedback_id} - Delete specific feedback record
@app.delete("/feedback/{feedback_id}")
async def delete_feedback(feedback_id: str):
    try:
        response = (
            supabase.table("guest_reviews")
            .delete()
            .eq("room_number", feedback_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete feedback record {feedback_id}: {str(e)}"
        )

    return {
        "message": f"Successfully deleted feedback record {feedback_id}",
        "feedback_id": feedback_id,
        "deleted_records": response.data or []
    }


# GET /gallery - Fetch all gallery items from "resort_gallery" Supabase table, ordered by created_at descending
@app.get("/gallery")
async def get_gallery_items():
    try:
        response = supabase.table("resort_gallery").select("*").order("created_at", desc=True).execute()
        return {
            "status": "success",
            "count": len(response.data) if response.data else 0,
            "data": response.data or []
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch gallery items from Supabase: {str(e)}"
        )


# POST /gallery - Save a new gallery item to "resort_gallery" Supabase table
@app.post("/gallery", status_code=status.HTTP_201_CREATED)
async def create_gallery_item(item_data: GalleryItem):
    payload = {
        "title": item_data.title,
        "description": item_data.description,
        "image_url": item_data.image_url
    }

    try:
        response = supabase.table("resort_gallery").insert(payload).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No data returned from gallery item insertion."
            )
        inserted_record = response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to insert gallery item into Supabase: {str(e)}"
        )

    return {
        "message": "Gallery item added successfully",
        "data": inserted_record
    }


# PUT /gallery/{item_id} - Update a specific gallery item's title and description
@app.put("/gallery/{item_id}")
async def update_gallery_item(item_id: str, item_data: GalleryItemUpdate):
    formatted_id = int(item_id) if item_id.isdigit() else item_id
    payload = {
        "title": item_data.title,
        "description": item_data.description
    }

    try:
        response = (
            supabase.table("resort_gallery")
            .update(payload)
            .eq("id", formatted_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Gallery item with id {item_id} not found."
            )
        updated_record = response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update gallery item {item_id}: {str(e)}"
        )

    return {
        "message": "Gallery item updated successfully",
        "data": updated_record
    }


# DELETE /gallery/{item_id} - Delete a specific gallery item
@app.delete("/gallery/{item_id}")
async def delete_gallery_item(item_id: str):
    formatted_id = int(item_id) if item_id.isdigit() else item_id
    try:
        response = (
            supabase.table("resort_gallery")
            .delete()
            .eq("id", formatted_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Gallery item with id {item_id} not found."
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete gallery item {item_id}: {str(e)}"
        )

    return {
        "message": f"Successfully deleted gallery item {item_id}",
        "item_id": item_id,
        "deleted_records": response.data or []
    }


# DELETE /room/{room_number}/checkout - Delete all service requests for a room and broadcast checkout event
@app.delete("/room/{room_number}/checkout")
async def checkout_room(room_number: str):
    try:
        response = (
            supabase.table("service_requests")
            .delete()
            .eq("room_number", room_number)
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete service requests for room {room_number}: {str(e)}"
        )

    # Broadcast checkout event to all connected WebSockets
    broadcast_message = {
        "type": "checkout",
        "room": room_number
    }
    await manager.broadcast(broadcast_message)

    return {
        "message": f"Successfully cleared all service requests for room {room_number}",
        "room": room_number,
        "deleted_records": response.data or []
    }


# GET /quick-services - Fetch services where is_quick_service is True
@app.get("/quick-services")
async def get_quick_services():
    try:
        response = supabase.table("services").select("*").eq("is_quick_service", True).execute()
        return {
            "status": "success",
            "count": len(response.data) if response.data else 0,
            "data": response.data or []
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch quick services from Supabase: {str(e)}"
        )


# GET /services - Fetch all services from the Supabase "services" table
@app.get("/services")
async def get_services():
    try:
        response = supabase.table("services").select("*").execute()
        return {
            "status": "success",
            "count": len(response.data) if response.data else 0,
            "data": response.data or []
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch services from Supabase: {str(e)}"
        )


# POST /services - Insert a new service into the Supabase "services" table
@app.post("/services", status_code=status.HTTP_201_CREATED)
async def create_service(service_data: ServiceCreate):
    payload = {
        "name": service_data.name,
        "category": service_data.category,
        "tag": service_data.tag or "",
        "description": service_data.description or "",
        "is_quick_service": service_data.is_quick_service if service_data.is_quick_service is not None else False
    }

    try:
        response = supabase.table("services").insert(payload).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No data returned from service insertion."
            )
        inserted_record = response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to insert service into Supabase: {str(e)}"
        )

    return {
        "message": "Service created successfully",
        "data": inserted_record
    }


# PUT /services/{service_id} - Update a service in Supabase
@app.put("/services/{service_id}")
async def update_service(service_id: str, service_data: ServiceUpdate):
    formatted_id = int(service_id) if service_id.isdigit() else service_id
    payload = {k: v for k, v in service_data.model_dump(exclude_unset=True).items() if v is not None}
    try:
        response = (
            supabase.table("services")
            .update(payload)
            .eq("id", formatted_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service with id {service_id} not found."
            )
        updated_record = response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update service {service_id}: {str(e)}"
        )

    return {
        "message": "Service updated successfully",
        "data": updated_record
    }


# DELETE /services/{service_id} - Delete the service row from Supabase where id == service_id
@app.delete("/services/{service_id}")
async def delete_service(service_id: str):
    formatted_id = int(service_id) if service_id.isdigit() else service_id
    try:
        response = (
            supabase.table("services")
            .delete()
            .eq("id", formatted_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete service {service_id} from Supabase: {str(e)}"
        )

    return {
        "message": f"Successfully deleted service {service_id}",
        "service_id": service_id,
        "deleted_records": response.data or []
    }


# WebSocket /ws/waiter - Manage active connections for waiters
@app.websocket("/ws/waiter")
async def websocket_waiter_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                data = json.loads(data_str)
                if data.get("event") == "NUDGE_WAITER":
                    await manager.broadcast(data)
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
