from sqlalchemy.orm import Session
from db.models import File, FileCategory, FileTag, category_for_files, tags_for_files, Article
from sqlalchemy import or_, func
import math


def create_file_tag(data: dict, session: Session):
    file_tag = FileTag(name=data["name"])
    session.add(file_tag)
    session.commit()
    return file_tag


def create_file_category(data: dict, session: Session):
    file_category = FileCategory(name=data["name"])
    session.add(file_category)
    session.commit()
    return file_category


def create_file(session: Session, **kwargs):
    tags = kwargs["tags"]
    category = kwargs["category"]

    del kwargs["tags"]
    del kwargs["category"]

    file = File(**kwargs)

    if tags:
        tags_session = session.query(FileTag)
        for tag_id in tags:
            if tag_id.startswith("newtag_"):
                created_tag = create_file_tag({"name": tag_id.split("newtag_")[-1]}, session)
                file.tags.append(tags_session.filter(FileTag.id == created_tag.id).one())
            else:
                file.tags.append(tags_session.filter(FileTag.id == tag_id).one())

    if category:
        category_session = session.query(FileCategory)
        for category_id in category:
            if category_id.startswith("newcategory_"):
                created_category = create_file_category({"name": category_id.split("newcategory_")[-1]}, session)
                file.category.append(category_session.filter(FileCategory.id == created_category.id).one())
            else:
                file.category.append(category_session.filter(FileCategory.id == category_id).one())

    session.add(file)
    session.commit()
    return file


def add_image_to_file_category(category_id: int, image: str, session: Session):
    category = session.query(FileCategory).filter(FileCategory.id == category_id).first()
    category.image = image

    session.commit()
    session.refresh(category)

    return category


def update_file_info(file_id: int, session: Session, **kwargs):
    file = session.query(File).get(file_id)

    tags = kwargs["tags"]
    category = kwargs["category"]

    del kwargs["tags"]
    del kwargs["category"]

    for k, v in kwargs.items():
        setattr(file, k, v)

    file.tags = []
    if tags:
        tags_session = session.query(FileTag)
        for tag_id in tags:
            if tag_id.startswith("newtag_"):
                created_tag = create_file_tag({"name": tag_id.split("newtag_")[-1]}, session)
                file.tags.append(tags_session.filter(FileTag.id == created_tag.id).one())
            else:
                file.tags.append(tags_session.filter(FileTag.id == tag_id).one())

    file.category = []
    if category:
        category_session = session.query(FileCategory)
        for category_id in category:
            if category_id.startswith("newcategory_"):
                created_category = create_file_category({"name": category_id.split("newcategory_")[-1]}, session)
                file.category.append(category_session.filter(FileCategory.id == created_category.id).one())
            else:
                file.category.append(category_session.filter(FileCategory.id == category_id).one())

    session.commit()
    session.refresh(file)

    return file


def get_all_file_category(name, session: Session):
    items = session.query(FileCategory).all()
    if name:
        items = session.query(FileCategory).filter(
            FileCategory.name.ilike(f'%{name}%')).all()
    return items


def get_all_file_tag(name, session: Session):
    items = session.query(FileTag).all()
    if name:
        items = session.query(FileTag).filter(
            FileTag.name.ilike(f'%{name}%')).all()
    return items


def get_file_list(
        limit: int,
        tags: list,
        category: list,
        description: str,
        page: int,
        show_delete: bool,
        session: Session,
        names: list = None
):
    tags_ids = []
    if tags:
        tags_ids = [
            i[0] for i in session.query(tags_for_files.c.file_id) \
                .filter(tags_for_files.c.tag_id.in_(tags)) \
                .all()
        ]

        if 0 in tags:
            tags_ids.extend([i[0] for i in session.query(File.id).where(File.tags == None).all()])

    categories_ids = []
    if category:
        categories_ids = [
            i[0] for i in session.query(category_for_files.c.file_id) \
                .filter(category_for_files.c.category_id.in_(category)) \
                .all()
        ]

        if 0 in category:
            categories_ids.extend([i[0] for i in session.query(File.id).where(File.category == None).all()])

    storage = (
        session.query(func.sum(File.file_size))
        .filter(
            or_(File.name.in_(names), not names),
            or_(File.description.ilike(f'%{description}%'), not description),
            or_(File.is_deleted.is_not(True if not show_delete else None)),
            or_(File.id.in_(tags_ids), not tags),
            or_(File.id.in_(categories_ids), not category)
        )
        .scalar()
    )

    files = (
        session.query(File)
        .filter(
            or_(File.name.in_(names), not names),
            or_(File.description.ilike(f'%{description}%'), not description),
            or_(File.is_deleted.is_not(True if not show_delete else None)),
            or_(File.id.in_(tags_ids), not tags),
            or_(File.id.in_(categories_ids), not category)
        )
    )

    count = files.count()
    files = files.limit(limit).offset((page - 1) * limit).all()

    return {
        "files": files,
        "count": count,
        "pages": math.ceil(count / limit) if limit != 0 else count,
        "storage": storage
    }


def get_file_by_id(id: int, session: Session):
    return session.query(File).get(id)


def get_file_by_hash(hash: str, session: Session):
    return session.query(File).filter(File.hash == hash).first()


def get_article_by_id(id: str, session: Session):
    return session.query(Article).filter(Article.id == id).first()