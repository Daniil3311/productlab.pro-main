import enum

from pydantic import BaseModel
from typing import List, Optional, Union, Dict, Any
import datetime

from externals.userRole import UserRole

from uuid import UUID


class Tag(BaseModel):
    name: str


class TagResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class TagList(BaseModel):
    items: List[TagResponse]

    class Config:
        orm_mode = True


class Category(TagResponse):
    image: Optional[str]
    count_articles: Optional[int]

    class Config:
        orm_mode = True


class FileCategory(TagResponse):
    image: Optional[str]


class File(BaseModel):
    id: int
    name: str
    hash: str
    link: str
    type: str
    file_size: str

    client_tablecrm: Optional[str]
    client_tablecrm_id: Optional[int]

    project_tablecrm: Optional[str]
    project_tablecrm_id: Optional[int]

    tags: Optional[List[TagResponse]]
    category: Optional[List[FileCategory]]
    description: Optional[str]
    is_deleted: bool

    created_at: datetime.datetime
    updated_at: Union[datetime.datetime, None]

    class Config:
        orm_mode = True


class FileList(BaseModel):
    files: Optional[List[File]]
    count: int
    pages: int
    storage: Optional[str]


class User(BaseModel):
    id: int
    name: Optional[str]
    tags: Optional[List[TagResponse]]
    category: Optional[List[TagResponse]]
    role: Optional[UserRole]
    about: Optional[str]
    profile_pic: Optional[str]
    is_dismissed: Optional[bool]

    class Config:
        orm_mode = True


class UserList(BaseModel):
    result: List[User]
    count: int

    class Config:
        orm_mode = True


class Sending(BaseModel):
    id: int
    uuid: UUID

    text: str
    skipBlocked: bool
    send_count: int
    all_count: int

    class Config:
        orm_mode = True


class Article(BaseModel):
    id: int
    title: Optional[str]
    first_sentence: Optional[str]
    content: Optional[str]
    isPublic: bool
    isPublish: bool
    header_pic: Optional[str]
    main_pic: Optional[str]
    tags: Optional[List[TagResponse]]
    category: Optional[List[TagResponse]]
    seq_number: Optional[int]
    client_tablecrm: Optional[str]
    client_tablecrm_id: Optional[int]

    seo_url: Optional[str]

    time_created: Optional[datetime.datetime]
    time_updated: Optional[datetime.datetime]

    project_tablecrm: Optional[str]
    project_tablecrm_id: Optional[int]

    header_video_length_seconds: Optional[int]
    main_video_length_seconds: Optional[int]

    price_hour: Optional[float]
    performer: Optional[User]
    owner: Optional[User]

    class Config:
        orm_mode = True


class GetArticle(BaseModel):
    result: List[Article]
    count: int

    class Config:
        orm_mode = True


class UpdateToken(BaseModel):
    data: str


class SortingOrder(enum.Enum):

    ASC = 'asc'
    DESC = 'desc'


class AnswerDTO(BaseModel):
    text: str
    mark: int
    hint: str
    aid: int | None = None


class QuestionDTO(BaseModel):
    text: str
    hint: str
    answers: List[AnswerDTO]


class QuestionsDTO(BaseModel):
    questions: List[QuestionDTO]


class ConditionDTO(BaseModel):
    low_boundary: int
    high_boundary: int
    action: str


class ConditionsDTO(BaseModel):
    conditions: List[ConditionDTO]


class SurveyDTO(BaseModel):
    name: str
    description: str
    sid: int
    creator_id: int | None
    qna: QuestionsDTO
    conditions: Dict[Any, Any]


class SurveyInList(BaseModel):
    sid: int
    name: str
    description: str
    created_at: datetime.datetime
    module: None | int = None
    lesson: None | int = None

    class Config:
        orm_mode = True


class ActiveSurvey(BaseModel):
    sid: int
    name: str
    description: str
    answers_ids: List[int]


class QuestionHint(BaseModel):
    question_id: int
    question_hint: str
    answer_hint: str


class Hints(BaseModel):
    user_answers_hints: List[QuestionHint]


class SurveysPeriod(BaseModel):
    from_dt: datetime.datetime
    to_dt: datetime.datetime


class UserAnswerDetails(BaseModel):
    survey_id: int
    survey_name: str
    survey_description: str
    state_max_mark: int
    mark_achieved: int
    started_at: datetime.datetime
    duration_sec: Optional[int]
    qnas: QuestionsDTO
    user_id: int
    tg_id: int
    profile_pic: str
    user_name: str
    user_about: str | None
    blocked: bool
    dismissed: bool


class UserAnswers(BaseModel):

    ua_id: int
    user_id: int
    survey_id: int
    started_at: datetime.datetime
    finished_at: datetime.datetime | None

    class Config:
        orm_mode = True


class UserAnswerInList(BaseModel):
    user_answer_id: int
    survey_id: int
    survey_name: str
    survey_about: str | None
    max_mark: int
    started_at: datetime.datetime
    finished_at: datetime.datetime | None
    user_id: int
    tg_id: int
    name: str
    profile_pic: str
    about: str | None
    blocked: bool
    dismissed: bool

