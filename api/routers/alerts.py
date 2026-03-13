"""
Alerts Router - D34
TEAM_30_TO_TEAM_20_MB3A_ALERTS_API_REQUIREMENTS
TEAM_60_TO_TEAM_20_D34_ALERTS_DDL_COORDINATION
"""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..models.identity import User
from ..services.alerts_service import get_alerts_service
from ..schemas.alerts import AlertCreate, AlertUpdate
from ..schemas.alert_conditions import CONDITION_FIELDS, CONDITION_OPERATORS
from ..utils.identity import ulid_to_uuid

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/summary", response_model=dict)
async def get_alerts_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    TEAM_30 request — סקשן סיכום עמוד התראות.
    total_alerts, active_alerts, new_alerts (10 ימים), triggered_alerts.
    """
    service = get_alerts_service()
    return await service.get_alerts_summary(db=db, user_id=current_user.id)


@router.get("", response_model=dict)
async def list_alerts(
    target_type: Optional[str] = Query(
        None,
        description="account|trade|trade_plan|ticker|datetime",
    ),
    ticker_id: Optional[str] = Query(None, description="Filter by ticker (ULID)"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    trigger_status: Optional[str] = Query(
        None, description="untriggered|triggered_unread|triggered_read|rearmed"
    ),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    sort: str = Query("created_at", description="created_at|target_type|is_active|..."),
    order: str = Query("desc", description="asc|desc"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    TEAM_30 request — רשימת התראות עם סינון, pagination ומיון.
    G7R Batch2: is_active, trigger_status filter wiring.
    """
    ticker_uuid = None
    if ticker_id:
        try:
            ticker_uuid = ulid_to_uuid(ticker_id)
        except Exception:
            pass  # invalid ULID → ignore filter
    service = get_alerts_service()
    data, total = await service.list_alerts(
        db=db,
        user_id=current_user.id,
        target_type=target_type,
        ticker_id=ticker_uuid,
        is_active=is_active,
        trigger_status=trigger_status,
        page=page,
        per_page=per_page,
        sort=sort,
        order=order,
    )
    return {"data": data, "total": total}


@router.get("/condition-options", response_model=dict)
async def get_condition_options(
    current_user: User = Depends(get_current_user),
):
    """
    TEAM_30 Phase C — Condition builder canonical contract.
    Returns allowed condition_field and condition_operator values.
    """
    return {
        "condition_fields": sorted(CONDITION_FIELDS),
        "condition_operators": sorted(CONDITION_OPERATORS),
    }


@router.post("", response_model=dict, status_code=201)
async def create_alert(
    body: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_alerts_service()
    data = body.model_dump(exclude_unset=False)
    return await service.create_alert(db=db, user_id=current_user.id, data=data)


@router.get("/{alert_id}", response_model=dict)
async def get_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_alerts_service()
    alert = await service.get_alert(db=db, alert_id=alert_id, user_id=current_user.id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.patch("/{alert_id}", response_model=dict)
async def update_alert(
    alert_id: uuid.UUID,
    body: AlertUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_alerts_service()
    data = body.model_dump(exclude_unset=True)
    alert = await service.update_alert(db=db, alert_id=alert_id, user_id=current_user.id, data=data)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.delete("/{alert_id}", status_code=204)
async def delete_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_alerts_service()
    ok = await service.delete_alert(db=db, alert_id=alert_id, user_id=current_user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Alert not found")
