from typing import Optional, List

from fastapi import APIRouter, HTTPException, Header, Depends, Query, Form
from db import crud
from db.database import get_session
from sqlalchemy.orm import Session
from starlette import status
from starlette.responses import JSONResponse
from api.schemas import (QuestionsDTO, ConditionsDTO, SurveyInList,
                         SurveyDTO, ActiveSurvey, Hints, SurveysPeriod,
                         UserAnswerDetails, SortingOrder)
from api.exceptions import SurveyFinished, QuestionAnswered

router = APIRouter(prefix="/surveys", tags=["survey"])


@router.get("/")
def get_all_surveys(
        sorting_order: Optional[SortingOrder] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        category_ids: list[int] = Query(None),
        article_ids: list[int] = Query(None),
        token: str = Header(None),

        session: Session = Depends(get_session)
):
    """All surveys available."""
    user = None
    if token:
        user = crud.get_user_by_token(token, session)
        if user and (user.is_blocked or user.is_dismissed):
            raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED)
    surveys, item_count = crud.all_surveys(
        user, session, sorting_order, limit,
        offset, category_ids, article_ids
    )
    return {"surveys": surveys, "item_count": item_count}


@router.get("/unfinished")
def unfinished_survey(
        session: Session = Depends(get_session),
        token: str = Header(None),
        sorting_order: SortingOrder | None = None
):
    user = None
    if token:
        user = crud.get_user_by_token(token, session)
    surveys = crud.get_active_survey(session, user, sorting_order)
    if not surveys:
        raise HTTPException(status.HTTP_204_NO_CONTENT)
    return {"unfinished_surveys": surveys}


@router.post("/new_survey", status_code=status.HTTP_201_CREATED,
             response_model=SurveyInList)
def create_survey(
        name: str,
        description: str,
        module_id: Optional[int] = None,
        lesson_id: Optional[int] = None,
        qna: QuestionsDTO = None,
        conditions: ConditionsDTO = None,
        session: Session = Depends(get_session),
        token: str = Header()
):
    """
    condition example: \"action\":\"open module 3 4 15\".
    Conditions also can be an empty array
    """
    user = crud.get_user_by_token(token, session)
    if not user:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    survey = crud.create_survey(
        session, module_id, lesson_id, qna,
        conditions, name, description, user
    )
    return survey


def verify_token(token: str = Header(), session: Session = Depends(get_session)):
    user = crud.get_user_by_token(token, session)
    if not user or user.role in ("ADMIN", "COPYWRITER", "MANAGER"):
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    return user


@router.get("/grant_content")
def add_content_access(
        user_id: int,
        token: str = Header(),
        session: Session = Depends(get_session),
        article_id: Optional[int] = Query(None),
        category_id: Optional[int] = Query(None)
):
    caller = crud.get_user_by_token(token, session)
    if not caller or caller.role != 'ADMIN':
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    crud.add_survey_for_user(session, user_id, category_id, article_id)
    return JSONResponse(None, status_code=status.HTTP_201_CREATED)


@router.post("/answer/{sid}")
async def save_answer(sid: int, aid: int, session: Session = Depends(get_session), token: str = Header()):
    """Answer once for each question.
    @:returns 'Finished' in response if all answers are present,
    'Already answered' if trying to accept finished survey,
    'Answered' on write."""
    user = crud.get_user_by_token(token, session)
    if not user:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    try:
        answered = await crud.answer(session, sid, aid, user.id)
    except SurveyFinished:
        return JSONResponse("Finished", status_code=status.HTTP_201_CREATED)
    except QuestionAnswered:
        return JSONResponse(
            "Question already answered", status_code=status.HTTP_200_OK)
    if answered:
        return JSONResponse("Answered", status_code=status.HTTP_201_CREATED)
    return JSONResponse("Survey already answered", status_code=status.HTTP_200_OK)


@router.delete("/revoke")
def delete_content_access(
        module_id: Optional[int] = None,
        article_id: Optional[int] = None,
        token: str = Header(),
        session: Session = Depends(get_session)
):
    user = crud.get_user_by_token(token, session)
    if not user:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    crud.revoke_content(article_id, module_id, user.id, session)
    return {"ok": True}


@router.get("/rerun_after_hints/{sid}")
def advice_and_restart_survey(
        sid: int,
        token: str = Header(),
        session: Session = Depends(get_session)
):
    user = crud.get_user_by_token(token, session)
    if not user:
        raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED)
    hints = crud.rerun_with_hints(sid, user.id, session)
    if not hints:
        return JSONResponse("No saved data", status_code=status.HTTP_200_OK)
    return {"hints": hints}


@router.get("/grant/{sid}")
def survey_for_user(
        sid: int,
        student=Depends(verify_token),
        session: Session = Depends(get_session)
):
    crud.grant_survey(student.id, sid, session)
    return JSONResponse({"ok": True}, status_code=status.HTTP_201_CREATED)


@router.get("/webhook/{sid}")
def call_survey_webhook(
        sid: int, token: str = Header(),
        session: Session = Depends(get_session)
):
    user = crud.get_user_by_token(token, session)
    if not user:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    status_code = crud.call_webhook(sid, user.id, session)
    if status_code:
        return JSONResponse({"ok": True}, status_code=status_code)
    raise HTTPException(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/user_answers")
def get_all_answers(
        limit: Optional[int] = None,
        offset: int | None = None,
        sorting_order: Optional[SortingOrder] = None,
        session: Session = Depends(get_session),
        users: list[int] = Query([]),
        timestamp_from: int = None,
        timestamp_to: int = None,
        modules_id: list[int] = Query([]),
):
    """:args timestamp_* are POSIX timestamps compared to survey start"""
    try:
        uas, item_count = crud.get_user_answers(
            session, users, timestamp_from, timestamp_to, modules_id,
            limit, offset, sorting_order)
    except Exception as e:
        print(e)
        uas, item_count = [], 0
    return {"user_answers": uas, "items_count": item_count}


@router.get("/{sid}", response_model=SurveyDTO)
def get_survey(sid: int, session: Session = Depends(get_session)):
    try:
        survey = crud.get_survey(session, sid)
    except:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey


@router.patch("/{sid}", response_model=SurveyInList)
def update_survey(
        sid: int,
        session: Session = Depends(get_session),
        name: Optional[str] = None,
        description: str | None = None,
        module_id: Optional[int] = None,
        lesson_id: Optional[int] = None,
        conditions: Optional[ConditionsDTO] = None,
        question_and_answers: Optional[QuestionsDTO] = None,
):
    updated = crud.update_survey_data(
        session, sid, module_id, lesson_id,
        conditions, question_and_answers,
        name, description
    )
    return updated


@router.get("/user_answer/{ua_id}",
            response_model=UserAnswerDetails)
def user_answer_detail(
        ua_id: int,
        session: Session = Depends(get_session)
):
    ua = crud.get_ua_details(ua_id, session)
    if not ua:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return ua
