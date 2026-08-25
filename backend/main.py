import os
import random
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Global variables for in-memory state
nodes_db = {}          # Static node details: id -> node dict
dynamic_states = {}    # Dynamic state: id -> dynamic state dict
history_cache = {}     # Pre-generated 7-day history: id -> list of history items
model = None           # Trained scikit-learn model

class RainfallSimRequest(BaseModel):
    node_id: int
    intensity_mmhr: float
    duration_hr: float

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

def get_risk_band(score: float) -> str:
    if score >= 75.0:
        return "Very High"
    elif score >= 50.0:
        return "High"
    elif score >= 25.0:
        return "Moderate"
    else:
        return "Low"

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, nodes_db, dynamic_states, history_cache
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CSV_PATH = os.path.join(BASE_DIR, "data", "nodes.csv")
    MODEL_PATH = os.path.join(BASE_DIR, "data", "model.pkl")

    # 1. Load the model
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    
    # 2. Load nodes
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Nodes CSV file not found at {CSV_PATH}")
    
    df = pd.read_csv(CSV_PATH)
    current_time = datetime.now(timezone.utc).isoformat()
    
    for _, row in df.iterrows():
        node_id = int(row["id"])
        static_suscep = float(row["static_susceptibility"])
        
        nodes_db[node_id] = {
            "id": node_id,
            "name": str(row["name"]),
            "state": str(row["state"]),
            "lat": float(row["lat"]),
            "lon": float(row["lon"]),
            "static_susceptibility": static_suscep
        }
        
        # Initialize dynamic state per node (as specified: dynamic_risk_score=0, risk_band="Low", empty history)
        dynamic_states[node_id] = {
            "dynamic_risk_score": 0.0,
            "risk_band": "Low",
            "history": [],
            "last_updated": current_time
        }
        
        # 3. Pre-generate 7 days of simulated hourly data
        # 7 days * 24 hours = 168 data points
        history_list = []
        base_time = datetime.now(timezone.utc) - timedelta(days=7)
        
        # Continuous soil moisture tracking
        current_moisture = random.uniform(20.0, 30.0)
        
        for hour_idx in range(168):
            timestamp = (base_time + timedelta(hours=hour_idx)).isoformat()
            
            # Rainfall logic: 0-15mm/hr, occasional spikes of 40-60mm/hr, mostly dry (0)
            p = random.random()
            if p < 0.75:
                rainfall_mm = 0.0
            elif p < 0.95:
                rainfall_mm = random.uniform(0.1, 15.0)
            else:
                rainfall_mm = random.uniform(40.0, 60.0)
                
            # Soil moisture logic (20-70%)
            current_moisture += rainfall_mm * 1.5
            current_moisture -= random.uniform(0.5, 1.5)
            current_moisture = max(20.0, min(70.0, current_moisture))
            
            # Correlate risk score with static susceptibility, rainfall, and moisture
            base_risk = (static_suscep / 100.0) * 40.0
            moisture_factor = ((current_moisture - 20.0) / 50.0) * 30.0
            rainfall_factor = (rainfall_mm / 60.0) * 30.0
            
            risk_score = base_risk + moisture_factor + rainfall_factor
            risk_score += random.uniform(-3.0, 3.0)
            risk_score = max(0.0, min(100.0, risk_score))
            
            history_list.append({
                "timestamp": timestamp,
                "rainfall_mm": round(rainfall_mm, 2),
                "soil_moisture_pct": round(current_moisture, 2),
                "risk_score": round(risk_score, 2)
            })
            
        history_cache[node_id] = history_list
        
    yield
    # Clean up (if any) on shutdown
    nodes_db.clear()
    dynamic_states.clear()
    history_cache.clear()

# Create FastAPI App with Lifespan
app = FastAPI(title="Landslide Early Warning System API", lifespan=lifespan)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/nodes")
def get_nodes():
    nodes_list = []
    for node_id, node in nodes_db.items():
        dyn = dynamic_states[node_id]
        nodes_list.append({
            "id": node["id"],
            "name": node["name"],
            "state": node["state"],
            "lat": node["lat"],
            "lon": node["lon"],
            "static_susceptibility": node["static_susceptibility"],
            "dynamic_risk_score": dyn["dynamic_risk_score"],
            "risk_band": dyn["risk_band"],
            "last_updated": dyn["last_updated"]
        })
    return nodes_list

@app.get("/api/nodes/{node_id}/history")
def get_node_history(node_id: int):
    if node_id not in history_cache:
        raise HTTPException(status_code=404, detail=f"Node with id {node_id} not found")
    return history_cache[node_id]

@app.post("/api/simulate/rainfall-event")
async def simulate_rainfall_event(req: RainfallSimRequest):
    node_id = req.node_id
    if node_id not in nodes_db:
        raise HTTPException(status_code=404, detail=f"Node with id {node_id} not found")
        
    node = nodes_db[node_id]
    
    # 1. Run prediction with model
    # Features in order: [rainfall_intensity_mmhr, rainfall_duration_hr, static_susceptibility]
    # static susceptibility is divided by 100 before passing
    static_suscep_0_1 = node["static_susceptibility"] / 100.0
    features = np.array([[req.intensity_mmhr, req.duration_hr, static_suscep_0_1]])
    
    try:
        probs = model.predict_proba(features)
        risk_prob = probs[0][1]
        risk_score = float(risk_prob * 100.0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction failed: {str(e)}")
        
    risk_band = get_risk_band(risk_score)
    current_time = datetime.now(timezone.utc).isoformat()
    
    # Update dynamic state
    dynamic_states[node_id]["dynamic_risk_score"] = round(risk_score, 2)
    dynamic_states[node_id]["risk_band"] = risk_band
    dynamic_states[node_id]["last_updated"] = current_time
    
    # Calculate soil moisture from event: prev moisture + cumulative rainfall * factor
    node_history = history_cache[node_id]
    prev_moisture = node_history[-1]["soil_moisture_pct"] if node_history else 30.0
    total_rainfall = req.intensity_mmhr * req.duration_hr
    new_moisture = min(95.0, prev_moisture + total_rainfall * 0.5)
    
    event_record = {
        "timestamp": current_time,
        "rainfall_mm": round(total_rainfall, 2),
        "soil_moisture_pct": round(new_moisture, 2),
        "risk_score": round(risk_score, 2)
    }
    
    # Append to dynamic_states[node_id]["history"]
    dynamic_states[node_id]["history"].append(event_record)
    
    # Append to history_cache[node_id]
    history_cache[node_id].append(event_record)
    
    # Broadcast alert if risk_score >= 50
    if risk_score >= 50.0:
        alert_msg = {
            "type": "alert",
            "node_id": node_id,
            "node_name": node["name"],
            "risk_score": round(risk_score, 2),
            "risk_band": risk_band,
            "timestamp": current_time
        }
        await manager.broadcast(alert_msg)
        
    # Return updated node object
    return {
        "id": node["id"],
        "name": node["name"],
        "state": node["state"],
        "lat": node["lat"],
        "lon": node["lon"],
        "static_susceptibility": node["static_susceptibility"],
        "dynamic_risk_score": round(risk_score, 2),
        "risk_band": risk_band,
        "last_updated": current_time
    }

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Maintain connection and listen for disconnect
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
