from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DBDep
from app.schemas.order import OrderCreate, OrderOut
from app.models.order import OrderStatus
from app.services import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(body: OrderCreate, db: DBDep, user: CurrentUser) -> OrderOut:
    """Создать заказ такси."""
    service = OrderService(db)
    try:
        order = await service.create_order(user.id, body)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    result = await service.get_order(order.id)
    return OrderOut.model_validate(result)


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, db: DBDep, user: CurrentUser) -> OrderOut:
    """Получить статус и детали заказа."""
    service = OrderService(db)
    order = await service.get_order(order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден")
    return OrderOut.model_validate(order)


@router.post("/{order_id}/cancel", response_model=OrderOut)
async def cancel_order(order_id: int, db: DBDep, user: CurrentUser) -> OrderOut:
    """Отменить заказ, пока водитель ещё не назначен."""
    service = OrderService(db)
    order = await service.get_order(order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден")
    if order.status != OrderStatus.SEARCHING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Заказ уже нельзя отменить")
    updated = await service.update_status(order_id, OrderStatus.CANCELLED)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден")
    result = await service.get_order(order_id)
    return OrderOut.model_validate(result)
