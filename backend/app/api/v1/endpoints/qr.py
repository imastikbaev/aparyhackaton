from fastapi import APIRouter, HTTPException, status

from app.api.deps import DBDep
from app.repositories import QRPointRepository
from app.schemas.qr_point import QRPointInfo

router = APIRouter(prefix="/qr", tags=["qr"])


@router.get("/{qr_id}", response_model=QRPointInfo)
async def get_qr_point(qr_id: str, db: DBDep) -> QRPointInfo:
    """Получить информацию по QR-точке."""
    repo = QRPointRepository(db)
    point = await repo.get_active(qr_id)
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR-точка не найдена")
    return QRPointInfo.model_validate(point)
