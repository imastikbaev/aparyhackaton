from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, maps, orders, qr, ws

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(qr.router)
api_router.include_router(orders.router)
api_router.include_router(maps.router)
api_router.include_router(ws.router)
