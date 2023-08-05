from typing import Optional

import requests

from .models import Tag, Article, User, Category, article_category, article_tag, UserTag, UserCategory, Sending, \
    UserAnswers, users_surveys_answers, Question, Answer, accessible_article, accessible_modules, Survey, Conditions, \
    accessible_surveys
from sqlalchemy import or_, select, func, desc
from sqlalchemy.orm import Session, joinedload, load_only
from fastapi import HTTPException
from .database import get_session
from api.routers.websockets import manager
from api import schemas
from api.exceptions import SurveyFinished, QuestionAnswered

import secrets
import uuid
import json
import websockets
from config import Config
import datetime
import collections


def create_category(data, session: Session):
    category = Category(name=data["name"])
    session.add(category)
    session.commit()
    return category


def add_image_to_category(category_id: int, image: str, session: Session):
    category = session.query(Category).filter(Category.id == category_id).first()
    category.image = image

    session.commit()
    session.refresh(category)

    return category


def create_tag(data, session: Session):
    tag = Tag(name=data["name"])
    session.add(tag)
    session.commit()
    return tag


def create_user_tag(data: dict, session: Session):
    user_tag = UserTag(name=data["name"])
    session.add(user_tag)
    session.commit()
    return user_tag


def create_user_category(data: dict, session: Session):
    user_category = UserCategory(name=data["name"])
    session.add(user_category)
    session.commit()
    return user_category


def get_all_user_tag(name, session: Session):
    items = session.query(UserTag).all()
    if name:
        items = session.query(UserTag).filter(
            UserTag.name.ilike(f'%{name}%')).all()
    return items


def get_all_user_category(name, session: Session):
    items = session.query(UserCategory).all()
    if name:
        items = session.query(UserCategory).filter(
            UserCategory.name.ilike(f'%{name}%')).all()
    return items


def get_sending(uuid: uuid.UUID, session: Session):
    return session.query(Sending).filter(Sending.uuid == uuid).first()


def get_all_category(
        session: Session,
        name: str | None,
        user_id: int | None,
        level: int | None,
        category_ids: list[int]
):
    categories_db = (
        session.query(Category.id, Category.name, Category.image, func.count(Article.id).label("count_articles"))
        .outerjoin(Article.category)
        .group_by(Category.id)
    )

    if name:
        categories_db = categories_db.filter(Category.name.ilike(f'%{name}%'))

    if category_ids:
        if 0 in category_ids:
            categories_db = categories_db.filter(or_(Category.id.in_(category_ids), Category.id.is_(None)))
        else:
            categories_db = categories_db.filter(Category.id.in_(category_ids))

    if user_id and level == 4:
        categories_db = (
            categories_db.filter(
                accessible_modules.c.mod_acceptor == user_id
            )
            .join(
                accessible_modules, accessible_modules.c.acc_module == Category.id
            )
        )

    categories_db = categories_db.all()
    categories_db[0] = {
        "id": 0, "name": "Без категории", "image": None, "count_articles": categories_db[0].count_articles
    }

    if category_ids and 0 not in category_ids:
        return categories_db[1:]

    return categories_db


def get_all_tag(session: Session, name):
    items = session.query(Tag).all()
    if name:
        items = session.query(Tag).filter(Tag.name.ilike(f'%{name}%')).all()
    return items


def get_all_article(
        session: Session,
        access_level: int | None,
        user_id: int | None,
        limit: int = None,
        offset: int = None,
        tags_ids=None,
        categories_ids=None,
        performers_ids=None,
        contragents_ids=None,
        contragents_names=None,
        show_unpublic=False,
        sorting_order=None
):
    # def q(filter, page=0, page_size=None):
    # query = session.query(...).filter(filter)
    # if page_size:
    #     query = query.limit(page_size)
    # if page:
    #     query = query.offset(page*page_size)
    # return query
    # items = (
    #     session.query(Article)
    #     .join(Article.category)
    #     .join(Article.tags)
    #     .filter(
    #         or_(article_tag.columns.tag_id.in_(tags_ids), not tags_ids),
    #         or_(
    #             article_category.columns.category_id.in_(categories_ids),
    #             not categories_ids,
    #         ),
    #         or_(Article.performer_id.in_(performers_ids), not performers_ids),
    #         or_(Article.client_tablecrm_id.in_(contragents_ids), not contragents_ids),
    #         or_(
    #             Article.client_tablecrm.in_(contragents_names),
    #             not contragents_names,
    #         ),
    #     )
    #     .order_by(Article.time_updated.desc())
    #     .all()
    # )

    tags_db = None
    categories_db = None

    if tags_ids:
        tags = session.query(article_tag.c.article_id).where(article_tag.c.tag_id.in_(tags_ids)).all()
        tags_db = [i[0] for i in tags]

    if categories_ids:
        categories = session.query(article_category.c.article_id).where(
            article_category.c.category_id.in_(categories_ids)).all()
        categories_db = [i[0] for i in categories]

        if not categories_db:
            categories_db = categories_ids

        if 0 in categories_ids:
            categories_db.extend([i[0] for i in session.query(Article.id).where(
                Article.category == None).all()])

    if limit:
        items = (
            session.query(Article)
            .filter(
                or_(Article.performer_id.in_(performers_ids), not performers_ids),
                or_(
                    Article.client_tablecrm_id.in_(
                        contragents_ids), not contragents_ids
                ),
                or_(
                    Article.client_tablecrm.in_(contragents_names),
                    not contragents_names,
                ),
            )
            .order_by(Article.id.desc())

            # .limit(limit)
            # .offset(offset)
            # .all()
        )

        items_count = (
            session.query(Article)
            .filter(
                or_(Article.performer_id.in_(performers_ids), not performers_ids),
                or_(
                    Article.client_tablecrm_id.in_(
                        contragents_ids), not contragents_ids
                ),
                or_(
                    Article.client_tablecrm.in_(contragents_names),
                    not contragents_names,
                ),
            )
            # .count()
        )

        if tags_db:
            items = items.filter(Article.id.in_(tags_db))
            items_count = items_count.filter(Article.id.in_(tags_db))

        if categories_db:
            items = items.filter(Article.id.in_(categories_db))
            items_count = items_count.filter(Article.id.in_(categories_db))

        if not show_unpublic:
            items = items.filter(Article.isPublic == True)
            items_count = items_count.filter(Article.isPublic == True)

        items = items.order_by(Article.id.desc()).limit(limit).offset(offset)
        items_count = items_count.count()


    else:
        items = (
            session.query(Article)
            .filter(
                or_(Article.performer_id.in_(performers_ids), not performers_ids),
                or_(
                    Article.client_tablecrm_id.in_(
                        contragents_ids), not contragents_ids
                ),
                or_(
                    Article.client_tablecrm.in_(contragents_names),
                    not contragents_names,
                ),
            )
            # .order_by(Article.id.desc())
            # .limit(limit)
            # .all()
        )
        items_count = (
            session.query(Article)
            .filter(
                or_(Article.performer_id.in_(performers_ids), not performers_ids),
                or_(
                    Article.client_tablecrm_id.in_(
                        contragents_ids), not contragents_ids
                ),
                or_(
                    Article.client_tablecrm.in_(contragents_names),
                    not contragents_names,
                ),
            )
            # .count()
        )

        if tags_ids:
            items = items.filter(Article.id.in_(tags_db))
            items_count = items_count.filter(Article.id.in_(tags_db))
        if categories_ids:
            items = items.filter(Article.id.in_(categories_db))
            items_count = items_count.filter(Article.id.in_(categories_db))

        if not show_unpublic:
            items = items.filter(Article.isPublic == True)
            items_count = items_count.filter(Article.isPublic == True)

        items = items.order_by(Article.id.desc()).limit(limit)
        items_count = items_count.count()

    if access_level == 4:
        items = items.join(accessible_article, accessible_article.c.acc_article == Article.id).filter(
            accessible_article.c.art_acceptor == user_id)

    # items_all = items.all()
    if sorting_order is not None and len(categories_ids) == 1:
        if sorting_order.value == 'asc':
            items = items.order_by(Article.seq_number)
        #     items_all.sort(key=lambda e: e.seq_number)
        else:
            items = items.order_by(Article.seq_number.desc())
        #     items_all.sort(key=lambda e: e.seq_number, reverse=True)
    return items.all(), items.count()


def get_article_by_id(id, session: Session):
    return session.query(Article).get(id)


async def create_article(data, main, header, main_ct, header_ct, session: Session):
    if data['tags'] != ['']:
        req_tags = data['tags'][0].split(',')
        data['tags'] = []
        tags_session = session.query(Tag)
        for tag_id in req_tags:
            if tag_id.startswith("newtag_"):
                created_tag = create_tag({"name": tag_id.split("newtag_")[-1]}, session)
                data['tags'].append(tags_session.filter(Tag.id == created_tag.id).one())
            else:
                data['tags'].append(tags_session.filter(Tag.id == tag_id).one())
    else:
        data["tags"] = []

    if data['category'] != ['']:
        req_category = data['category'][0].split(',')
        data['category'] = []
        category_session = session.query(Category)
        for category_id in req_category:
            if category_id.startswith("newcategory_"):
                created_category = create_category({"name": category_id.split("newcategory_")[-1]}, session)
                data['category'].append(category_session.filter(Category.id == created_category.id).one())
            else:
                data['category'].append(category_session.filter(Category.id == category_id).one())
    else:
        data["category"] = []

    user = session.query(User).get(data["owner"])
    data["owner"] = user  # todo these 2 are nullable!!!!!

    performer = session.query(User).get(data["performer"])
    data["performer"] = performer

    article = Article(**data)
    session.add(article)
    session.commit()

    if header:
        article.header_pic = f"storage/header_pic/{article.id}.{header}"
        article.header_pic_ct = header_ct if header_ct else None
    if main:
        article.main_pic = f"storage/main_pic/{article.id}.{main}"
        article.main_pic_ct = main_ct if main_ct else None
    session.add(article)
    session.commit()

    article_dict = {
        'id': article.id,
        'main_pic': article.main_pic,
        'title': article.title,
        'first_sentence': article.first_sentence,
        'isPublic': article.isPublic,
        'isPublish': article.isPublish
    }
    if performer:
        article_dict["performer"] = {
            "id": performer.id,
            "name": performer.name,
            "role": performer.role,
            "about": performer.about
        }
    article_dict["owner"] = {
        "id": user.id,
        "name": user.name,
        "role": user.role,
        "about": user.about,
        "is_dismissed": user.is_dismissed,
        "profile_pic": user.profile_pic
    }
    await manager.broadcast(
        {
            "type": "CreateArticle",
            "id": article.id,
            "data": article_dict,
            "TimeStamp": str(datetime.datetime.now()),
        }
    )
    return article


async def update_article(data, main, header, main_ct, header_ct, session: Session):
    article = session.query(Article).get(data["id"])

    if article:
        # todo are you trying to change by reference?
        tags = article.tags
        category = article.category

        if data['tags'] == ['']:
            tags = []
        else:
            req_tags = data['tags']
            tags_temp = []
            tags_session = session.query(Tag)
            for tag_id in req_tags:
                if tag_id.startswith("newtag_"):
                    created_tag = create_tag({"name": tag_id.split("newtag_")[-1]}, session)
                    tags_temp.append(tags_session.filter(Tag.id == created_tag.id).one())
                else:
                    tags_temp.append(tags_session.filter(Tag.id == tag_id).one())
            tags = tags_temp

        if data['category'] == ['']:
            category = []
        else:
            req_category = data['category']
            category_temp = []
            category_session = session.query(Category)
            for category_id in req_category:
                if category_id.startswith("newcategory_"):
                    created_category = create_category({"name": category_id.split("newcategory_")[-1]}, session)
                    category_temp.append(category_session.filter(Category.id == created_category.id).one())
                else:
                    category_temp.append(category_session.filter(Category.id == category_id).one())

            category = category_temp

        # tags = (
        #     data["tags"]
        #     if data["tags"]
        #     else article.tags
        # )
        # category = (
        #     data["category"]
        #     if data["category"]
        #     else article.category
        # )

        performer = (
            session.query(User).get(data["performer"])
            if data["performer"]
            else article.performer
        )

        del data["tags"]
        del data["category"]
        del data["performer"]

        for key, value in data.items():
            if value is not None:
                setattr(article, key, value)

        if header:
            # if article.header_pic:
            # os.remove(article.header_pic)
            article.header_pic = f"storage/header_pic/{article.id}.{header}"
            article.header_pic_ct = header_ct if header_ct else None
        if main:
            # if article.main_pic:
            # os.remove(article.main_pic)
            article.main_pic = f"storage/main_pic/{article.id}.{main}"
            article.main_pic_ct = main_ct if main_ct else None

        article.tags = tags

        article.category = category
        article.performer = performer

        # article.title = data["title"]
        # article.first_sentence = data["first_sentence"]
        # article.content = data["content"]

        # article.price_hour = data["price_hour"]
        # article.client_tablecrm = data["client_tablecrm"]
        # article.client_tablecrm_id = data["client_tablecrm_id"]
        # article.project_tablecrm = data["project_tablecrm"]
        # article.project_tablecrm_id = data["project_tablecrm_id"]
        # article.seo_url = data["seo_url"]

        session.commit()

        article_dict = {
            'id': article.id,
            'main_pic': article.main_pic,
            'title': article.title,
            'first_sentence': article.first_sentence,
            'isPublic': article.isPublic,
            'isPublish': article.isPublish
        }

        if performer:
            article_dict["performer"] = {
                "id": performer.id,
                "name": performer.name,
                "role": performer.role,
                "about": performer.about
            }

        article_dict["owner"] = {
            "id": article.owner.id,
            "name": article.owner.name,
            "role": article.owner.role,
            "about": article.owner.about,
            "profile_pic": article.owner.profile_pic
        }

        await manager.broadcast(
            {
                "type": "UpdateArticle",
                "id": article.id,
                "data": article_dict,
                "TimeStamp": str(datetime.datetime.now()),
            }
        )

    else:
        raise HTTPException(404)
    return article


async def create_user(id, name, profile_pic, url_ws):
    session = next(get_session())
    user = session.query(User).filter(User.tg_id == id).first()
    flag = False
    if not user:
        flag = True
        token = secrets.token_hex(16)
        while session.query(User).filter(User.token == token).first():
            token = secrets.token_hex(16)
        user = User(tg_id=id, name=name, token=token, profile_pic=profile_pic)
        session.add(user)
    else:
        token = secrets.token_hex(16)
        while session.query(User).filter(User.token == token).first():
            token = secrets.token_hex(16)
        user.token = token
        user.name = name
        user.profile_pic = profile_pic

    session.commit()
    session.refresh(user)

    if flag:
        # await send_message(user, url_ws)
        print(url_ws)
        print(
            str(Config.SECRET_TOKEN_WS)
            + ";"
            + str(user.id)
            + ";"
            + str(datetime.datetime.now())
            + ";"
            + json.dumps({
                "id": user.id,
                "role": user.role,
                "name": user.name,
                "about": user.about,
                "is_dismissed": user.is_dismissed,
                "profile_pic": user.profile_pic
            })
        )

    return user


async def send_message(user, url_ws):
    async with websockets.connect(url_ws, timeout=5, close_timeout=5) as websocket:
        await websocket.send(
            str(Config.SECRET_TOKEN_WS)
            + ";"
            + str(user.id)
            + ";"
            + str(datetime.datetime.now())
            + ";"
            + json.dumps({
                "id": user.id,
                "role": user.role,
                "name": user.name,
                "about": user.about,
                "is_dismissed": user.is_dismissed,
                "profile_pic": user.profile_pic
            })

        )
        await websocket.close()


async def update_user(data, profile_pic, session: Session):
    user = session.query(User).get(data["id"])
    flag = True if user.role != data["role"] else False
    flagName = True if user.name != data["name"] else False
    if user:
        user.tags = []
        print(data['tags'])
        if data['tags']:
            tags_session = session.query(UserTag)
            for tag_id in data['tags']:
                if tag_id.startswith("newtag_"):
                    created_tag = create_user_tag({"name": tag_id.split("newtag_")[-1]}, session)
                    user.tags.append(tags_session.filter(UserTag.id == created_tag.id).one())
                else:
                    user.tags.append(tags_session.filter(UserTag.id == tag_id).one())

        user.category = []
        if data['category']:
            category_session = session.query(UserCategory)
            for category_id in data['category']:
                if category_id.startswith("newcategory_"):
                    created_category = create_user_category({"name": category_id.split("newcategory_")[-1]}, session)
                    user.category.append(category_session.filter(UserCategory.id == created_category.id).one())
                else:
                    user.category.append(category_session.filter(UserCategory.id == category_id).one())

        del data["tags"]
        del data["category"]

        for key, value in data.items():
            setattr(user, key, value)
        # if profile_pic and user.profile_pic:
        #     try:
        #         os.remove(user.profile_pic)
        #     except:
        #         pass

        if profile_pic:
            user.profile_pic = f"storage/profile_pic/{user.tg_id}.{profile_pic}"

        session.commit()

        # user.name = data["name"]
        # user.role = data["role"]
        # user.profile_pic = f"images/profile_pic/{user.tg_id}.{profile_pic}"
        await manager.broadcast(
            {
                "type": "UpdateUser",
                "id": user.id,
                "data": {
                    "id": user.id,
                    "name": user.name,
                    "role": user.role,
                    "about": user.about,
                    "is_dismissed": user.is_dismissed,
                    "tags": [dict(id=tag.id, name=tag.name) for tag in user.tags],
                    "category": [dict(id=category.id, name=category.name) for category in user.category],
                    "profile_pic": user.profile_pic
                },
                "TimeStamp": str(datetime.datetime.now()),
            }
        )

    else:
        raise HTTPException(404)
    return user


def get_user_by_token(token, session: Session):
    user = session.query(User).filter(User.token == token).first()
    if not user:
        return None
    return user


def get_all_users(session: Session):
    items = session.query(User).order_by(User.id.desc()).all()
    count = session.query(User).count()
    return items, count


def get_survey_result(users_answer_id: int, session: Session):
    """Emitted when survey is finished."""
    answers = session.query(
        users_surveys_answers).filter(
        users_surveys_answers.c.user_answers_id == users_answer_id
    ).all()
    total_mark = 0
    for a in answers:
        mark = session.get(Answer, a[1]).mark
        total_mark += mark
    return total_mark


def call_webhook(survey_id: int, user_id: int, session: Session):
    webhook_url = "https://user-agent.cc/hook/eDwNFfGuPSZTItYsOW0mCNguIAiTvq"
    user_answers: UserAnswers | None = session.query(UserAnswers).filter(
        UserAnswers.survey_id == survey_id, UserAnswers.user_id == user_id
    ).first()
    if not user_answers:
        return
    user = session.get(User, user_answers.user_id)
    qna = {}
    for a in user_answers.questions_answers:
        question_text = session.query(Question.question_text).join(
            Answer, Question.qid == Answer.question
        ).filter(Answer.aid == a.aid).first()
        qna[question_text[0]] = a.text
    mark = get_survey_result(user_answers.ua_id, session)
    json_webhook = {
        "user": {
            "id": user.id,
            "tg_id": user.tg_id,
            "name": user.name
        },
        "survey": {
            "id": user_answers.survey_id,
            "time_spent_seconds": user_answers.duration_seconds if user_answers.finished else None,
            "qna": qna,
            "mark": mark,
            "max_possible_points": user_answers.current_max_mark
        }
    }
    resp = requests.post(webhook_url, json=json_webhook)
    return resp.status_code


def add_survey_for_user(
        session: Session,
        user_id: int,
        module_id: Optional[int] = None,
        article_id: Optional[int] = None
):
    if module_id:
        acceptable = session.get(Category, module_id)
    else:
        acceptable = session.get(Article, article_id)
    user = session.get(User, user_id)
    acceptable.acceptors.append(user)
    session.commit()


def add_qna(sid: int, qna: schemas.QuestionsDTO, session: Session):
    for q in qna.questions:
        question = Question(
            from_survey=sid,
            question_text=q.text,
            hint=q.hint)
        for a in q.answers:
            answer_data = Answer(
                text=a.text, mark=a.mark,
                hint=a.hint, question=question.qid
            )
            question.answers.append(answer_data)
        session.add(question)


def create_survey(
        session: Session,
        mod_id: int,
        lesson_id: int,
        qna: schemas.QuestionsDTO,
        conditions: schemas.ConditionsDTO,
        name: str, description: str, user: User
):
    survey = Survey(module=mod_id, lesson=lesson_id,
                    name=name, description=description,
                    creator_id=user.id)
    session.add(survey)
    session.flush()
    session.refresh(survey)
    add_qna(survey.sid, qna, session)
    if conditions:
        session.add(Conditions(
            survey_id=survey.sid,
            demarcation=conditions.dict()
        ))
    session.commit()
    return survey


def get_survey(session: Session, sid: int) -> schemas.SurveyDTO:
    questions = session.query(Question).filter(Question.from_survey == sid).all()
    survey = session.get(Survey, sid)
    qna = []
    for q in questions:
        answers_dto = []
        answers = session.query(Answer).filter(Answer.question == q.qid)
        for a in answers:
            answers_dto.append(schemas.AnswerDTO(
                aid=a.aid, text=a.text, mark=a.mark, hint=a.hint
            ))
        qna.append(schemas.QuestionDTO(
            text=q.question_text, hint=q.hint, answers=answers_dto
        ))
    conditions = session.query(Conditions).filter(Conditions.survey_id == sid).first()
    return schemas.SurveyDTO(
        sid=sid, name=survey.name, description=survey.description,
        qna=schemas.QuestionsDTO(questions=qna), creator_id=survey.creator_id,
        conditions=conditions.demarcation if conditions else None
    )


def act(session: Session, user_asnwer: UserAnswers):
    mark = get_survey_result(user_asnwer.ua_id, session)
    conditions = session.query(Conditions).join(
        Survey, Survey.sid == Conditions.survey_id).join(
        UserAnswers, Survey.sid == UserAnswers.survey_id
    ).filter(user_asnwer.ua_id == UserAnswers.ua_id).first()
    conditions = conditions.demarcation
    for c in conditions["conditions"]:
        if c["low_boundary"] <= mark <= c["high_boundary"]:
            action: str = c["action"]
            tokens = action.split()
            if action.startswith("open"):
                open_ids = map(int, filter(str.isdigit, tokens))
                if tokens[1] == "module":
                    for o_i in open_ids:
                        add_survey_for_user(session, user_asnwer.user_id, o_i)


async def answer(session: Session, sid: int, aid: int, uid: int):
    user_answers = session.query(UserAnswers).filter(
        UserAnswers.survey_id == sid).first()
    questions_count = session.query(Question).filter(
        Question.from_survey == sid).count()
    if user_answers and user_answers.finished:
        return False
    answer_chosen = session.get(Answer, aid)
    question = session.get(Question, answer_chosen.question)

    answers = question.answers
    max_mark = max(a.mark for a in answers)
    answers_ids = [a.aid for a in answers]

    new = False
    if not user_answers:
        user_answers = UserAnswers(
            user_id=uid, survey_id=sid, current_max_mark=max_mark
        )
        new = True
        session.add(user_answers)
    already_answerd_ids = [a.aid for a in user_answers.questions_answers]
    for a_id in answers_ids:
        if a_id in already_answerd_ids:
            raise QuestionAnswered
    answers = session.query(users_surveys_answers).filter(
        users_surveys_answers.c.user_answers_id == user_answers.ua_id
    ).count()
    to_finish = True if questions_count - answers == 1 else False
    user_answers.questions_answers.append(answer_chosen)
    if not new:
        user_answers.current_max_mark += max_mark

    if to_finish:
        user_answers.finished_at = datetime.datetime.now()
        user_answers.finished = True

    session.commit()
    current_mark = get_survey_result(user_answers.ua_id, session)
    await manager.broadcast(
        {
            "type": "AnswerSaved",
            "ua_id": user_answers.ua_id,
            "data": {
                "survey_id": sid,
                "question":
                    {
                        "id": question.qid,
                        "text": question.question_text.encode("utf-8").decode()
                    },
                "answer": {
                    "id": answer_chosen.aid,
                    "text": answer_chosen.text.encode("utf-8").decode(),
                    "mark": answer_chosen.mark
                },
                "total_points": current_mark,
                "current_possible_max_mark": user_answers.current_max_mark,
            },
            "TimeStamp": str(datetime.datetime.now()),
        }
    )
    if to_finish:
        act(session, user_answers)
        await manager.broadcast({
            "type": "SurveyFinished",
            "user_answers_id": user_answers.ua_id,
            "max_points": user_answers.current_max_mark,
            "mark_achieved": current_mark,
            "TimeStamp": str(datetime.datetime.now())
        })
        raise SurveyFinished
    return True


def get_active_survey(session: Session, user: User | None, sorting):
    user_answers = session.query(UserAnswers).options(
        joinedload(UserAnswers.questions_answers)).filter(
        UserAnswers.finished.is_(False))
    if user:
        user_answers = user_answers.filter(UserAnswers.user_id == user.id)
    if sorting:
        if sorting.value == 'asc':
            user_answers = user_answers.order_by(UserAnswers.started_at)
        else:
            user_answers = user_answers.order_by(UserAnswers.started_at.desc())
    user_answers = user_answers.all()
    if not user_answers:
        return
    surveys = []
    for ua in user_answers:
        answers_ids = list(ua.questions_answers)
        survey = session.get(Survey, ua.survey_id)
        surveys.append(schemas.ActiveSurvey(
            sid=ua.survey_id, description=survey.description,
            name=survey.name,
            answers_ids=[a.aid for a in answers_ids]
        ))
    return surveys


def get_surveys_results(session: Session):
    surveys_answers = session.query(
        UserAnswers).options(load_only(
        UserAnswers.survey_id, UserAnswers.user_id
    )).all()
    user_results = collections.defaultdict(list)
    for answers in surveys_answers:
        answer_mark = get_survey_result(answers.ua_id, session)
        user_results[answers.user_id].append({
            "sid": answers.survey_id,
            "mark": answer_mark
        })
    return user_results


def revoke_content(art_id: int | None, mod_id: int | None, uid: int, session: Session):
    if art_id:
        session.query(accessible_article).filter(
            accessible_article.c.acc_article == art_id,
            accessible_article.c.art_acceptor == uid
        ).delete()
    else:
        session.query(accessible_modules).filter(
            accessible_modules.c.acc_module == mod_id,
            accessible_modules.c.mod_acceptor == uid
        ).delete()
    session.commit()


def grant_survey(uid: int, sid: int, session: Session):
    survey = session.get(Survey, sid)
    user = session.get(User, uid)
    survey.accessors.append(user)
    session.commit()


def all_surveys(
        user: User, session: Session,
        sort_order, limit: int, offset: int,
        cat_ids: list[int], art_ids: list[int]
):
    if user and user.role == "STUDENT":
        surveys = session.query(Survey).join(
            accessible_surveys,
            accessible_surveys.c.survey_acceptor == user.id
        ).filter(Survey.sid == accessible_surveys.c.acc_survey)
    else:
        surveys = session.query(Survey)
    if art_ids:
        surveys = surveys.filter(Survey.lesson.in_(art_ids))
    elif cat_ids:
        surveys = surveys.filter(Survey.module.in_(cat_ids))
    if sort_order:
        if sort_order.value == 'asc':
            surveys = surveys.order_by(Survey.created_at)
        else:
            surveys = surveys.order_by(Survey.created_at.desc())
    if offset:
        surveys = surveys.offset(offset)
    if limit:
        surveys = surveys.limit(limit)
    item_count = surveys.count()
    surveys = surveys.all()
    surveys_dtos = []
    for survey in surveys:
        dto = schemas.SurveyInList(sid=survey.sid, name=survey.name,
                                   description=survey.description,
                                   created_at=survey.created_at)
        if survey.module:
            dto.module = survey.module
        else:
            dto.lesson = survey.lesson
        surveys_dtos.append(dto)
    return surveys_dtos, item_count


def rerun_with_hints(sid: int, uid: int, session: Session):
    user_answers = session.query(UserAnswers).filter(
        UserAnswers.user_id == uid,
        UserAnswers.survey_id == sid
    ).first()
    if not user_answers:
        return
    hints = []
    for a in user_answers.questions_answers:
        qid = a.question
        q_hint = session.get(Question, qid).hint
        hints.append(schemas.QuestionHint(
            question_id=qid,
            question_hint=q_hint,
            answer_hint=a.hint
        ))
    session.delete(user_answers)
    session.commit()
    return hints


def update_article_main_length(duration: int, art_id: int, session: Session):
    article = session.get(Article, art_id)
    article.main_video_length_seconds = duration
    session.commit()


def update_article_header_length(duration: int, art_id: int, session: Session):
    article = session.get(Article, art_id)
    article.header_video_length_seconds = duration
    session.commit()


def update_survey_data(session: Session, sid: int, mid: int | None, lid: int | None,
                       conditions: schemas.ConditionsDTO, qna: schemas.QuestionsDTO,
                       name: str | None, description: str | None):
    survey = session.get(Survey, sid)
    if name:
        survey.name = name
    if description:
        survey.description = description
    if mid:
        survey.lesson = None
        survey.module = mid
    elif lid:
        survey.module = None
        survey.lesson = lid
    if conditions:
        session.query(Conditions).filter(
            Conditions.survey_id == sid
        ).delete()
        session.add(Conditions(
            survey_id=sid,
            demarcation=conditions.dict()
        ))
    if qna:
        questions = session.query(Question).filter(
            Question.from_survey == sid
        ).all()
        for question in questions:
            question.from_survey = None
        add_qna(sid, qna, session)
    session.commit()
    return survey


def get_ua_details(ua_id: int, session: Session):
    user_answers = session.get(UserAnswers, ua_id)
    if not user_answers:
        return
    answers = user_answers.questions_answers
    questions = []
    for ans in answers:
        question: Question | None = session.get(Question, ans.question)
        questions.append(schemas.QuestionDTO(
            text=question.question_text, hint=question.hint, answers=[
                schemas.AnswerDTO(
                    text=ans.text, mark=ans.mark,
                    hint=ans.hint, aid=ans.aid
                )
            ]))
    user = session.get(User, user_answers.user_id)
    survey = session.get(Survey, user_answers.survey_id)
    return schemas.UserAnswerDetails(
        survey_id=user_answers.survey_id,
        survey_name=survey.name, survey_description=survey.description,
        user_id=user_answers.user_id,
        state_max_mark=user_answers.current_max_mark,
        mark_achieved=get_survey_result(user_answers.ua_id, session),
        started_at=user_answers.started_at,
        duration_sec=user_answers.duration_seconds,
        qnas=schemas.QuestionsDTO(questions=questions),
        tg_id=user.tg_id, profile_pic=user.profile_pic,
        user_name=user.name, user_about=user.about,
        blocked=user.is_blocked, dismissed=user.is_dismissed
    )


def get_user_answers(session: Session, users: list[int],
                     ts_from, ts_to,
                     modules_id: list[int], limit: int | None,
                     offset: int | None, sort):
    users_answers = session.query(UserAnswers)
    if users:
        users_answers = users_answers.filter(
            UserAnswers.user_id.in_(users))
    if modules_id:
        articles_ids = []
        for mod_id in modules_id:
            art_id_in_module = [e[0] for e in session.query(Article.id).filter(
                Article.category.any(id=mod_id)).all()]
            articles_ids.extend(art_id_in_module)

        users_answers = users_answers.join(
            Survey, Survey.sid == UserAnswers.survey_id).filter(
            or_(Survey.module.in_(modules_id), Survey.lesson.in_(articles_ids))
        )
    if ts_from:
        dt_from = datetime.datetime.fromtimestamp(ts_from)
        users_answers = users_answers.filter(
            UserAnswers.started_at >= dt_from)
    if ts_to:
        dt_to = datetime.datetime.fromtimestamp(ts_to)
        users_answers = users_answers.filter(
            UserAnswers.started_at <= dt_to
        )
    if sort:
        if sort.value == 'asc':
            users_answers = users_answers.order_by(UserAnswers.started_at)
        else:
            users_answers = users_answers.order_by(UserAnswers.started_at.desc())
    if limit:
        users_answers = users_answers.limit(limit)
    if offset:
        users_answers = users_answers.offset(offset)
    uas = []
    for ua in users_answers.all():
        user = session.get(User, ua.user_id)
        survey = session.get(Survey, ua.survey_id)
        uas.append(schemas.UserAnswerInList(
            user_answer_id=ua.ua_id, survey_about=survey.description,
            survey_id=ua.survey_id, survey_name=survey.name,
            max_mark=ua.current_max_mark,
            started_at=ua.started_at,
            finished_at=ua.finished_at,
            user_id=user.id,
            tg_id=user.tg_id,
            name=user.name,
            profile_pic=user.profile_pic,
            about=user.about,
            blocked=user.is_blocked,
            dismissed=user.is_dismissed
        ))
    return uas, users_answers.count()


def get_max_mark(session: Session, user_answers: UserAnswers) -> int:
    questions_ids = [a.question for a in user_answers.questions_answers]
    max_marks = []
    for qid in questions_ids:
        question = session.get(Question, qid)
        answers = question.answers
        max_mark = max(a.mark for a in answers)
        max_marks.append(max_mark)
    return sum(max_marks)
