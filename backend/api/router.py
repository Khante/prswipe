from fastapi import APIRouter

from api.repos import router as repos_router
from api.prs import router as prs_router

router = APIRouter()

router.include_router(repos_router)
router.include_router(prs_router)
