from uuid import uuid4

import aiofiles
from aiofiles import os
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
)
from db.database import get_session
from sqlalchemy.orm import Session
import aioboto3
from moviepy.editor import VideoFileClip

from typing import List, Optional
from datetime import datetime

import io

from db import crud
from .files import s3_data

from .. import schemas

s3_session = aioboto3.Session()
bucket_name = "natfullin-default-bucket"

user_levels = {
    "MANAGER": 1,
    "COPYWRITER": 2,
    "ADMIN": 3,
    "STUDENT": 4
}


def verify_token(
        token: str = Header(),
        session: Session = Depends(get_session),
):
    user = crud.get_user_by_token(token, session)
    if not user:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    if user.role == "ADMIN":
        return user, 3
    elif user.role == "COPYWRITER":
        return user, 2
    elif user.role == "MANAGER":
        return user, 1
    return user, 4  # "STUDENT"


router = APIRouter(tags=["article"])


@router.get(
    "/article",
    response_model=schemas.GetArticle,
)
def get_all_articles(
        sorting_order: Optional[schemas.SortingOrder] = None,
        token: Optional[str] = Header(None),
        tags_ids: List[int] = Query([]),
        categories_ids: List[int] = Query([]),
        performers_ids: List[int] = Query([]),
        contragents_ids: List[int] = Query([]),
        contragents_names: List[str] = Query([]),
        show_unpublic: bool = Query(False),
        limit: int = Query(None),
        offset: int = Query(None),
        session: Session = Depends(get_session),
):
    user = crud.get_user_by_token(token, session)
    user_id, user_level = None, None
    if user:
        user_id, user_level = user.id, user_levels.get(user.role, 4)

    items, items_count = crud.get_all_article(
        session,
        user_level,
        user_id,
        limit,
        offset,
        tags_ids,
        categories_ids,
        performers_ids,
        contragents_ids,
        contragents_names,
        show_unpublic,
        sorting_order
    )

    return {"result": items, "count": items_count}


@router.get(
    "/article/{article_id}",
    response_model=schemas.Article,
)
def get_one_article(
        article_id: int,
        session: Session = Depends(get_session),
):
    return crud.get_article_by_id(article_id, session)


@router.post("/article")
async def create_article(
        title: str = Form(None),
        first_sentence: str = Form(None),
        content: str = Form(None),
        price_hour: float = Form(None),
        owner: int = Form(None),
        tags: Optional[List] = Form([]),
        category: Optional[List] = Form([]),
        seq_number: Optional[int] = Form(None),
        client_tablecrm: str = Form(None),
        client_tablecrm_id: int = Form(None),
        seo_url: str = Form(None),
        project_tablecrm: str = Form(None),
        project_tablecrm_id: int = Form(None),
        performer: int = Form(None),
        isPublic: bool = Form(False),
        isPublish: bool = Form(False),
        header_image: UploadFile = File(None),
        main_image: UploadFile = File(None),
        session: Session = Depends(get_session),
        verify=Depends(verify_token),
):
    user, lvl_access = verify

    main_image_ext = main_image.filename.split(".")[-1] if main_image else None
    header_image_ext = header_image.filename.split(".")[-1] if header_image else None

    main_image_contype = main_image.content_type if main_image else None
    header_image_contype = header_image.content_type if header_image else None

    article = await crud.create_article(
        {
            "title": title,
            "first_sentence": first_sentence,
            "content": content,
            "owner": owner,
            "tags": tags,
            # "tags": [""],
            "price_hour": price_hour,
            "category": category,
            # "category": [""],
            "seq_number": seq_number,
            "client_tablecrm": client_tablecrm,
            "client_tablecrm_id": client_tablecrm_id,
            "seo_url": seo_url,
            "project_tablecrm": project_tablecrm,
            "project_tablecrm_id": project_tablecrm_id,
            "isPublic": isPublic,
            "isPublish": isPublish,
            "time_updated": datetime.now(),
            "performer": performer,
        },
        main_image_ext,
        header_image_ext,
        main_image_contype,
        header_image_contype,
        session,
    )
    if header_image:
        file_name = f"header_pic/{article.id}.{header_image_ext}"
        file_bytes = await header_image.read()
        is_video_header = header_image.content_type.split("/")[0] == "video"
        if is_video_header:
            local_videofile = f'videos/header_{article.id}.{header_image_ext}'
            async with aiofiles.open(local_videofile, 'wb') as local_video:
                await local_video.write(file_bytes)
            video = VideoFileClip(local_videofile)
            header_video_length_seconds = int(video.duration)
            video.close()
            await os.remove(local_videofile)
            crud.update_article_header_length(header_video_length_seconds, article.id, session)

        async with s3_session.client(**s3_data) as s3:
            await s3.upload_fileobj(io.BytesIO(file_bytes), bucket_name, file_name)

    if main_image:
        file_name = f"main_pic/{article.id}.{main_image_ext}"
        file_bytes = await main_image.read()
        async with s3_session.client(**s3_data) as s3:
            await s3.upload_fileobj(io.BytesIO(file_bytes), bucket_name, file_name)
        is_video_main = header_image.content_type.split("/")[0] == "video"
        if is_video_main:
            local_main_videofile = f'videos/main_{article.id}.{header_image_ext}'
            async with aiofiles.open(local_main_videofile, 'wb') as local_video_main:
                await local_video_main.write(file_bytes)
            video = VideoFileClip(local_main_videofile)
            main_video_length_seconds = int(video.duration)
            video.close()
            await aiofiles.os.remove(local_main_videofile)
            crud.update_article_main_length(main_video_length_seconds, article.id, session)

    return article


@router.patch("/article/{id}")
async def update_article(
        id: int,
        title: Optional[str] = Form(None),
        first_sentence: Optional[str] = Form(None),
        content: Optional[str] = Form(None),
        price_hour: Optional[float] = Form(None),
        tags: Optional[List] = Form([]),
        category: Optional[List] = Form([]),
        seq_number: Optional[int] = Form(None),
        client_tablecrm: Optional[str] = Form(None),
        client_tablecrm_id: Optional[int] = Form(None),
        project_tablecrm: Optional[str] = Form(None),
        project_tablecrm_id: Optional[int] = Form(None),
        seo_url: Optional[str] = Form(None),
        performer: Optional[int] = Form(None),
        isPublic: Optional[bool] = Form(None),
        isPublish: Optional[bool] = Form(None),
        header_image: Optional[UploadFile] = File(None),
        main_image: Optional[UploadFile] = File(None),
        session: Session = Depends(get_session),
        verify=Depends(verify_token),
):
    user, lvl_access = verify
    article = crud.get_article_by_id(id, session)
    if lvl_access in (2, 3) or article.owner == user:
        main_image_ext = main_image.filename.split(".")[-1] if main_image else None
        header_image_ext = header_image.filename.split(".")[-1] if header_image else None

        main_image_contype = main_image.content_type if main_image else None
        header_image_contype = header_image.content_type if header_image else None

        article = await crud.update_article(
            {
                "id": id,
                "title": title,
                "first_sentence": first_sentence,
                "content": content,
                "tags": tags,
                "price_hour": price_hour,
                "category": category,
                "seq_number": seq_number,
                "client_tablecrm": client_tablecrm,
                "client_tablecrm_id": client_tablecrm_id,
                "seo_url": seo_url,
                "isPublic": isPublic,
                "isPublish": isPublish,
                "project_tablecrm": project_tablecrm,
                "project_tablecrm_id": project_tablecrm_id,
                "performer": performer,
                "time_updated": datetime.now(),
            },
            main_image_ext,
            header_image_ext,
            main_image_contype,
            header_image_contype,
            session,
        )

        if header_image:
            file_name = f"header_pic/{article.id}.{header_image_ext}"
            file_bytes = await header_image.read()
            async with s3_session.client(**s3_data) as s3:
                await s3.upload_fileobj(io.BytesIO(file_bytes), bucket_name, file_name)
        if main_image:
            file_name = f"main_pic/{article.id}.{main_image_ext}"
            file_bytes = await main_image.read()
            async with s3_session.client(**s3_data) as s3:
                await s3.upload_fileobj(io.BytesIO(file_bytes), bucket_name, file_name)

        return article
    else:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)


@router.post(
    "/tag",
    response_model=schemas.TagResponse,
    dependencies=[Depends(verify_token)]
)
def create_tag(request: schemas.Tag, session: Session = Depends(get_session)):
    return crud.create_tag(request.dict(), session)


@router.get("/tag", response_model=schemas.TagList)
def get_all_tags(name: str | None = None, session: Session = Depends(get_session)):
    items = crud.get_all_tag(session, name)
    return schemas.TagList(items=items)


@router.post("/category", response_model=schemas.TagResponse, dependencies=[Depends(verify_token)])
def create_category(request: schemas.Tag, session: Session = Depends(get_session)):
    return crud.create_category(request.dict(), session)


@router.post("/category/{id}/image", response_model=schemas.Category, dependencies=[Depends(verify_token)])
async def add_image_to_category_route(id: int, image: UploadFile = File(...), session: Session = Depends(get_session)):
    image_name = f"storage/category_image/{id}.{image.filename.split('.')[-1]}"
    image_bytes = await image.read()

    async with s3_session.client(**s3_data) as s3:
        await s3.upload_fileobj(io.BytesIO(image_bytes), bucket_name, "/".join(image_name.split("/")[1:]))
        await s3.close()

    return crud.add_image_to_category(category_id=id, image=image_name, session=session)


@router.get("/category", response_model=List[schemas.Category])
def get_all_category(
        name: str | None = None,
        session: Session = Depends(get_session),
        token: str | None = None,
        category_ids: list[int] = Query([])
):
    user = crud.get_user_by_token(token, session)
    user_id, user_level = None, None
    if user:
        user_id, user_level = user.id, user_levels.get(user.role, 4)
    return crud.get_all_category(session, name, user_id, user_level, category_ids)
