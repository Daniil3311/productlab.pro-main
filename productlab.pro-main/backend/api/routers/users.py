from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    Header,
    status,
    Query,
    Body
)
from db.database import get_session
from sqlalchemy.orm import Session

from typing import List, Optional
import aioboto3
import io

from externals.userRole import UserRole

from db import crud

from .. import schemas
from .files import s3_data
from publisher import producer_sending

import uuid

s3_session = aioboto3.Session()
bucket_name = "natfullin-default-bucket"


def verify_token(token: str = Header(), session: Session = Depends(get_session)):
    user = crud.get_user_by_token(token, session)
    if not user or user.role != "ADMIN":
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)


router = APIRouter(tags=["user"])


@router.patch("/user/{id}", response_model=schemas.User, dependencies=[Depends(verify_token)])
async def update_user(
        id,
        name: Optional[str] = Form(None),
        role: Optional[UserRole] = Form(None),
        about: Optional[str] = Form(None),
        is_dismissed: Optional[bool] = Form(False),
        tags: Optional[List] = Form([]),
        category: Optional[List] = Form([]),
        profile_pic: Optional[UploadFile] = File(None),
        session: Session = Depends(get_session),
):
    profile_pic_ext = profile_pic.filename.split(".")[-1] if profile_pic else None
    user = await crud.update_user(
        {"id": id, "name": name, "role": role, "about": about, "is_dismissed": is_dismissed, "tags": tags,
         "category": category},
        profile_pic_ext,
        session,
    )
    if profile_pic:
        file_name = "/".join(user.profile_pic.split("/")[1:])
        file_bytes = await profile_pic.read()
        async with s3_session.client(**s3_data) as s3:
            await s3.upload_fileobj(io.BytesIO(file_bytes), bucket_name, file_name)

        # file_location = user.profile_pic
        # with open(file_location, "wb+") as file_object:
        #     file_object.write(profile_pic.file.read())

    return user


@router.get("/user/{token_search}", response_model=schemas.User)
def get_user_by_token(token_search: str, session: Session = Depends(get_session)):
    user = crud.get_user_by_token(token_search, session)
    if not user:
        raise HTTPException(404)
    return user


@router.get("/users", response_model=schemas.UserList)
def get_all_users(session: Session = Depends(get_session), limit: int =500, offset: int =0):
    if limit > 500:
        limit = 500
    res, count = crud.get_all_users(session)
    if offset + limit > len(res):
        if offset < len(res):
            res = res[offset:]
        else:
            res = []
    else:
        res = res[offset:limit + offset]

    return {"result": res, "count": count}


@router.post("/users/sending", dependencies=[Depends(verify_token)])
async def sending_to_users_route(
        tags_ids: List[int],
        categories_ids: List[int],
        text: str = Body(""),
        skipBlocked: bool = Body(False),
        session: Session = Depends(get_session)
):
    uuid_sending = str(uuid.uuid4())
    await producer_sending(text=text, skipBlocked=skipBlocked, tags_ids=tags_ids,
                           categories_ids=categories_ids, uuid_sending=uuid_sending, session=session)
    return {"success": uuid_sending}


@router.get("/users/sending/{uuid}", response_model=schemas.Sending, dependencies=[Depends(verify_token)])
def get_sending_info(uuid: uuid.UUID, session: Session = Depends(get_session)):
    sending = crud.get_sending(uuid=uuid, session=session)
    if not sending:
        raise HTTPException(status_code=404, detail="Рассылка не найдена или не была завершена")

    return sending


@router.post("/category_for_user", response_model=schemas.TagResponse)
async def create_user_category_route(data: schemas.Tag, session: Session = Depends(get_session)):
    return crud.create_user_category(data=data.dict(), session=session)


@router.get("/category_for_user", response_model=schemas.TagList)
def get_all_user_categories(name: str | None = None, session: Session = Depends(get_session)):
    items = crud.get_all_user_category(name=name, session=session)
    return schemas.TagList(items=items)


@router.post("/tag_for_user", response_model=schemas.TagResponse)
async def create_user_tag_route(data: schemas.Tag, session: Session = Depends(get_session)):
    return crud.create_user_tag(data=data.dict(), session=session)


@router.get("/tag_for_user", response_model=schemas.TagList)
def get_all_user_tags(name: str | None = None, session: Session = Depends(get_session)):
    items = crud.get_all_user_tag(name=name, session=session)
    return schemas.TagList(items=items)
