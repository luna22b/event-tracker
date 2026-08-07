from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import locations, wait_reports
from app.websocket.routes import router as websocket_router


app = FastAPI()


origins = [
    "http://localhost:3000",
    # Add your deployed frontend URL here later:
    # "https://your-frontend.vercel.app",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    locations.router,
    prefix="/api/locations"
)

app.include_router(
    wait_reports.router,
    prefix="/api/wait-reports"
)

app.include_router(
    websocket_router
)


@app.get("/")
async def root():
    return {
        "message": "Waitless API running"
    }