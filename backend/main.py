from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from auth.router import router as auth_router
from api.router import router as api_router

app = FastAPI(
    title="PRswipe API",
    description="GitHub Pull Request Tinder App - Backend API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, Exception) and str(exc) == "Not authenticated":
        return JSONResponse(
            status_code=401,
            content={
                "error": "Unauthorized",
                "detail": "Not authenticated",
                "status_code": 401,
            },
        )
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred",
            "status_code": 500,
        },
    )


app.include_router(auth_router)
app.include_router(api_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "pr-swipe-backend"}
