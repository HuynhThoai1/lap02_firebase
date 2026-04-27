from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .dependencies.auth import get_current_user

from .routers import tasks

app = FastAPI(title="To-Do App API")

# Allow CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://lap02-firebase.web.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the To-Do App API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    return {"uid": user["uid"], "email": user.get("email")}

# We will add task routers here later
