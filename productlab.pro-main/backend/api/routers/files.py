from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session
from db.database import get_session
from db.functions.files import (
    create_file, get_file_list, get_file_by_id, get_file_by_hash,
    create_file_category, create_file_tag, get_all_file_tag,
    add_image_to_file_category, get_all_file_category, update_file_info, get_article_by_id
)

from api import schemas
from config import Config

import aioboto3
import secrets
import io

router = APIRouter(prefix="/files", tags=["files"])
storage_router = APIRouter(prefix="/storage", tags=["files"])

s3_session = aioboto3.Session()

s3_data = {
    "service_name": "s3",
    "endpoint_url": "https://storage.clo.ru",
    "aws_access_key_id": Config.S3_ACCESS,
    "aws_secret_access_key": Config.S3_SECRET,
}

bucket_name = "natfullin-default-bucket"


@router.post("/upload", response_model=schemas.File)
async def create_file_route(
        upload_file: UploadFile = File(...),
        tags: Optional[List] = Form([]),
        category: Optional[List] = Form([]),
        client_tablecrm: Optional[str] = Form(None),
        client_tablecrm_id: Optional[int] = Form(None),
        project_tablecrm: Optional[str] = Form(None),
        project_tablecrm_id: Optional[int] = Form(None),
        description: Optional[str] = Form(None),
        session: Session = Depends(get_session)
):
    hash = secrets.token_urlsafe(16)
    file_hash_ext = f"{hash}.{upload_file.filename.split('.')[-1]}"
    file_name = f"storage/{file_hash_ext}"
    file_bytes = await upload_file.read()
    content_type = upload_file.content_type

    async with s3_session.client(**s3_data) as s3:
        await s3.upload_fileobj(io.BytesIO(file_bytes), bucket_name, file_name.split("/")[-1])
        await s3.close()

    return create_file(
        session=session,
        name=upload_file.filename,
        hash=hash,
        link=file_name,
        type=content_type,
        file_size=round(len(file_bytes) / 1024, 2),
        tags=tags,
        category=category,
        client_tablecrm=client_tablecrm,
        client_tablecrm_id=client_tablecrm_id,
        project_tablecrm=project_tablecrm,
        project_tablecrm_id=project_tablecrm_id,
        description=description
    )


@router.get("/", response_model=schemas.FileList)
def get_file_list_route(
        names: List[str] = Query([]),
        tags: Optional[List] = Query([]),
        category: Optional[List] = Query([]),
        description: Optional[str] = Query(None),
        limit: int = Query(10),
        page: int = Query(1),
        show_delete: bool = Query(True),
        session: Session = Depends(get_session)
):
    return get_file_list(
        names=names, tags=tags, category=category, description=description, limit=limit, page=page,
        show_delete=show_delete, session=session
    )


@router.get("/category", response_model=List[schemas.FileCategory])
def get_all_file_categories(
        name: str | None = None,
        session: Session = Depends(get_session)
):
    return get_all_file_category(name=name, session=session)


@router.post("/category", response_model=schemas.FileCategory)
async def create_file_category_route(data: schemas.Tag, session: Session = Depends(get_session)):
    return create_file_category(data=data.dict(), session=session)


@router.post("/tag", response_model=schemas.TagResponse)
async def create_file_tag_route(data: schemas.Tag, session: Session = Depends(get_session)):
    return create_file_tag(data=data.dict(), session=session)


@router.get("/tag", response_model=schemas.TagList)
def get_all_file_tags(name: str | None = None, session: Session = Depends(get_session)):
    items = get_all_file_tag(name=name, session=session)
    return schemas.TagList(items=items)


@router.post("/category/{id}/image", response_model=schemas.FileCategory)
async def add_image_to_file_category_route(
        id: int,
        image: UploadFile = File(...),
        session: Session = Depends(get_session)
):
    image_name = f"storage/file_category_image/{id}.{image.filename.split('.')[-1]}"
    image_bytes = await image.read()

    async with s3_session.client(**s3_data) as s3:
        await s3.upload_fileobj(io.BytesIO(image_bytes), bucket_name, "/".join(image_name.split("/")[1:]))
        await s3.close()

    return add_image_to_file_category(category_id=id, image=image_name, session=session)


@router.get("/{id}", response_model=schemas.File)
def get_file_route(id: int, session: Session = Depends(get_session)):
    return get_file_by_id(session=session, id=id)


@storage_router.get("/{file:path}", include_in_schema=True)
async def get_file(file: str, session: Session = Depends(get_session)):
    filename_arr = file.split("/")
    fname_arr_len = len(filename_arr)

    images_cats = ['main_pic', 'header_pic', 'profile_pic', 'category_image', 'file_category_image']
    images_exts = ['jpg', 'jpeg', 'png', 'gif', 'json', 'svg']

    if fname_arr_len > 2:
        raise HTTPException(400, 'Неверный запрос. Проверьте его правильность!')
    elif fname_arr_len == 2 and filename_arr[0] not in images_cats:
        raise HTTPException(400, 'Неверный запрос. Проверьте его правильность!')

    file_type = None
    if fname_arr_len == 2:
        article = get_article_by_id(int(filename_arr[-1].split(".")[0]), session)
        if article:
            if filename_arr[0] == "main_pic" and filename_arr[-1].split(".")[-1] not in images_exts:
                file_type = article.main_pic_ct
            if filename_arr[0] == "header_pic" and filename_arr[-1].split(".")[-1] not in images_exts:
                file_type = article.header_pic_ct
        
    if fname_arr_len == 1:
        file_hash = filename_arr[0].split(".")[0]
        file_type = get_file_by_hash(file_hash, session)
        if file_type:
            file_type = file_type.type
        else:
            raise HTTPException(400, 'Неверный запрос. Проверьте его правильность!')

    file_key = filename_arr[0]
    if fname_arr_len == 2:
        file_key = file_key + f'/{filename_arr[1]}'

    async with s3_session.client(**s3_data) as s3:
        s3_object_size = await s3.head_object(Bucket=bucket_name, Key=file_key)
        object_size = s3_object_size['ContentLength']
        await s3.close()

    async def s3_stream():
        async with s3_session.client(**s3_data) as s3:
            try:
                s3_ob = await s3.get_object(Bucket=bucket_name, Key=file_key)
                async for chunk in s3_ob['Body'].iter_chunks(8192):
                    yield chunk
                await s3.close()
            except:
                return
                # while True:
                #     chunk = await stream.read(1024 * 1024)
                #     print(chunk)
                #     if not chunk:
                #         break
                #     yield chunk

    headers = {
        "Content-Type": file_type,
        "Content-Length": str(object_size),
        "Content-Disposition": f"inline; filename={file_key}"
    }


    if not file_type:
        del headers["Content-Type"]

    return StreamingResponse(s3_stream(), headers=headers)


@router.delete("/{id}", response_model=schemas.File)
async def delete_file_route(id: int, session: Session = Depends(get_session)):
    file = get_file_by_id(id=id, session=session)

    async with s3_session.client(**s3_data) as s3:
        try:
            await s3.delete_object(Bucket=bucket_name, Key=file.link.split("/")[-1])
            await s3.close()
        except:
            raise HTTPException(
                status_code=500, detail="Ошибка удаления файла"
            )

    file.is_deleted = True
    session.commit()
    return file


@router.patch("/{id}", response_model=schemas.File)
async def update_file_info_route(
        id: int,
        tags: Optional[List] = Form([]),
        category: Optional[List] = Form([]),
        client_tablecrm: Optional[str] = Form(None),
        client_tablecrm_id: Optional[int] = Form(None),
        project_tablecrm: Optional[str] = Form(None),
        project_tablecrm_id: Optional[int] = Form(None),
        description: Optional[str] = Form(None),
        session: Session = Depends(get_session),
):
    return update_file_info(
        file_id=id, session=session,
        tags=tags, category=category,
        client_tablecrm=client_tablecrm, client_tablecrm_id=client_tablecrm_id,
        project_tablecrm=project_tablecrm, project_tablecrm_id=project_tablecrm_id,
        description=description
    )
