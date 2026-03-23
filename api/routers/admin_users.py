"""
D41 — Admin user list + status/role patches (LLD S003-P003-WP001).
"""

from datetime import datetime
from math import ceil
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..models.enums import UserRole
from ..models.identity import User
from ..utils.dependencies import require_admin_role
from ..utils.identity import ulid_to_uuid, uuid_to_ulid

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


def _display_name(u: User) -> str:
    if u.first_name or u.last_name:
        return f"{u.first_name or ''} {u.last_name or ''}".strip()
    return u.username


class AdminUserItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="External ULID")
    email: str
    display_name: str
    role: str
    is_active: bool
    phone_number: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime


class AdminUserListResponse(BaseModel):
    items: List[AdminUserItem]
    total: int
    page: int
    rows_per_page: int
    pages: int


class AdminUserStatusPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_active: bool


class AdminUserRolePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: UserRole = Field(..., description="USER or ADMIN only")


def _user_list_conditions(
    search: Optional[str],
    role: Optional[UserRole],
    is_active: Optional[bool],
):
    conditions = [User.deleted_at.is_(None)]
    if search:
        s = f"%{search.strip()}%"
        conditions.append(
            or_(
                User.email.ilike(s),
                User.first_name.ilike(s),
                User.last_name.ilike(s),
                User.display_name.ilike(s),
                User.username.ilike(s),
            )
        )
    if role is not None:
        conditions.append(User.role == role)
    if is_active is not None:
        conditions.append(User.is_active == is_active)
    return conditions


@router.get("", response_model=AdminUserListResponse)
async def list_admin_users(
    page: int = Query(1, ge=1),
    rows_per_page: int = Query(25, description="Pagination size"),
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    if rows_per_page not in (10, 25, 50, 100):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="rows_per_page must be one of 10, 25, 50, 100",
        )

    conditions = _user_list_conditions(search, role, is_active)
    count_stmt = select(func.count()).select_from(User).where(and_(*conditions))
    total = (await db.execute(count_stmt)).scalar_one()
    total = int(total or 0)

    data_stmt = (
        select(User)
        .where(and_(*conditions))
        .order_by(User.created_at.desc())
        .offset((page - 1) * rows_per_page)
        .limit(rows_per_page)
    )
    result = await db.execute(data_stmt)
    users = result.scalars().all()

    pages = max(1, ceil(total / rows_per_page)) if total else 1

    items = [
        AdminUserItem(
            id=uuid_to_ulid(u.id),
            email=u.email,
            display_name=_display_name(u),
            role=u.role.value if hasattr(u.role, "value") else str(u.role),
            is_active=u.is_active,
            phone_number=u.phone_number,
            last_login_at=u.last_login_at,
            created_at=u.created_at,
        )
        for u in users
    ]

    return AdminUserListResponse(
        items=items,
        total=total,
        page=page,
        rows_per_page=rows_per_page,
        pages=pages,
    )


@router.patch("/{user_id}/status", response_model=AdminUserItem)
async def patch_user_status(
    user_id: str,
    body: AdminUserStatusPatch,
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    try:
        uid = ulid_to_uuid(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid user id"
        )

    if uid == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot change own account status",
        )

    result = await db.execute(select(User).where(User.id == uid, User.deleted_at.is_(None)))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    target.is_active = body.is_active
    await db.commit()
    await db.refresh(target)

    return AdminUserItem(
        id=uuid_to_ulid(target.id),
        email=target.email,
        display_name=_display_name(target),
        role=target.role.value,
        is_active=target.is_active,
        phone_number=target.phone_number,
        last_login_at=target.last_login_at,
        created_at=target.created_at,
    )


@router.patch("/{user_id}/role", response_model=AdminUserItem)
async def patch_user_role(
    user_id: str,
    body: AdminUserRolePatch,
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    if body.role not in (UserRole.USER, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="role must be USER or ADMIN",
        )

    try:
        uid = ulid_to_uuid(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid user id"
        )

    if uid == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot change own role",
        )

    result = await db.execute(select(User).where(User.id == uid, User.deleted_at.is_(None)))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target.role == UserRole.SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot change role of SUPERADMIN user",
        )

    target.role = body.role
    await db.commit()
    await db.refresh(target)

    return AdminUserItem(
        id=uuid_to_ulid(target.id),
        email=target.email,
        display_name=_display_name(target),
        role=target.role.value,
        is_active=target.is_active,
        phone_number=target.phone_number,
        last_login_at=target.last_login_at,
        created_at=target.created_at,
    )
