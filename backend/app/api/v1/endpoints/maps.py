"""
Прокси для Aparu Maps API.
Все запросы идут через наш бэкенд → нет CORS-проблем у браузера.
"""
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

APARU_MAPS_URL = "http://testtaxi3.aparu.kz"
APARU_API_KEY = "test1"

router = APIRouter(prefix="/maps", tags=["maps"])

_headers = {"Content-Type": "application/json", "X-Api-Key": APARU_API_KEY}


class GeocodeRequest(BaseModel):
    text: str
    latitude: float
    longitude: float
    withCities: bool = True


class ReverseGeocodeRequest(BaseModel):
    latitude: float
    longitude: float


class RoutePoint(BaseModel):
    latitude: float
    longitude: float


class RouteRequest(BaseModel):
    points: list[RoutePoint]


async def _proxy(path: str, body: dict) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.post(
                f"{APARU_MAPS_URL}{path}", headers=_headers, json=body
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Maps API error: {exc}") from exc


@router.post("/geocode")
async def geocode(body: GeocodeRequest) -> dict:
    """Прямой геокодинг — поиск адреса по тексту."""
    return await _proxy("/api/v1/maps/geocode", body.model_dump())


@router.post("/reverse-geocode")
async def reverse_geocode(body: ReverseGeocodeRequest) -> dict:
    """Обратный геокодинг — адрес по координатам."""
    return await _proxy("/api/v1/maps/reverse-geocode", body.model_dump())


@router.post("/route")
async def build_route(body: RouteRequest) -> dict:
    """Построение маршрута между точками."""
    return await _proxy("/api/v1/maps/route", body.model_dump())
