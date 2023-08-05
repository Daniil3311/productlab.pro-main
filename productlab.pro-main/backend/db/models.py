import datetime

from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Enum,
    Text,
    Table,
    BigInteger,
    Float,
    Numeric,
    DateTime, SmallInteger,
)
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, JSON

from .database import Base
from externals.userRole import UserRole
import datetime as dt

import uuid

article_tag = Table(
    "article_tag",
    Base.metadata,
    Column("article_id", Integer, ForeignKey("articles.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)

article_category = Table(
    "article_category",
    Base.metadata,
    Column("article_id", Integer, ForeignKey("articles.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("category.id"), primary_key=True),
)

tags_for_users = Table(
    "tags_for_users",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("user_tags.id"), primary_key=True)
)

category_for_users = Table(
    "category_for_users",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("user_categories.id"), primary_key=True)
)

tags_for_files = Table(
    "tags_for_files",
    Base.metadata,
    Column("file_id", Integer, ForeignKey("files.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("file_tags.id"), primary_key=True)
)

category_for_files = Table(
    "category_for_files",
    Base.metadata,
    Column("file_id", Integer, ForeignKey("files.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("file_categories.id"), primary_key=True)
)


users_surveys_answers = Table(
    "users_surveys_answers",
    Base.metadata,
    Column("user_answers_id", ForeignKey("user_answers.ua_id")),
    Column("answer_chosen", ForeignKey("answer.aid"))
)


accessible_modules = Table(
    "accessible_modules",
    Base.metadata,
    Column("acc_module", ForeignKey("category.id")),
    Column("mod_acceptor", ForeignKey("users.id"))
)


accessible_article = Table(
    "acc_articles",
    Base.metadata,
    Column("acc_article", ForeignKey("articles.id")),
    Column("art_acceptor", ForeignKey("users.id"))
)


accessible_surveys = Table(
    "acc_surveys",
    Base.metadata,
    Column("acc_survey", ForeignKey("survey.sid")),
    Column("survey_acceptor", ForeignKey("users.id"))
)


class File(Base):
    __tablename__ = "files"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String)
    hash = Column(String)
    link = Column(String)
    type = Column(String)
    file_size = Column(Float)

    client_tablecrm = Column(Text, nullable=True, default=None)
    client_tablecrm_id = Column(Numeric, nullable=True)

    project_tablecrm = Column(Text, nullable=True, default=None)
    project_tablecrm_id = Column(Numeric, nullable=True)

    tags = relationship("FileTag", secondary=tags_for_files, backref="files")
    category = relationship("FileCategory", secondary=category_for_files, backref="files")
    description = Column(String, nullable=True)

    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    tg_id = Column(BigInteger)
    name = Column(String)
    token = Column(String, index=True)
    about = Column(String, nullable=True)

    tags = relationship("UserTag", secondary=tags_for_users, backref="users")
    category = relationship("UserCategory", secondary=category_for_users, backref="users")

    role = Column(Enum(UserRole), default="MANAGER")
    profile_pic = Column(String, nullable=True)
    is_blocked = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False, nullable=False)


class Sending(Base):
    __tablename__ = "sendings"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    text = Column(String)
    skipBlocked = Column(Boolean)
    send_count = Column(Integer)
    all_count = Column(Integer)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class UserTag(Base):
    __tablename__ = "user_tags"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class UserCategory(Base):
    __tablename__ = "user_categories"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FileTag(Base):
    __tablename__ = "file_tags"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FileCategory(Base):
    __tablename__ = "file_categories"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String)
    image = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    isPublic = Column(Boolean, default=False)
    isPublish = Column(Boolean, default=False)
    title = Column(String, nullable=True)
    first_sentence = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    price_hour = Column(Float, nullable=True)
    header_video_length_seconds = Column(Integer)
    main_video_length_seconds = Column(Integer)
    seq_number = Column(Integer)

    client_tablecrm = Column(Text, nullable=True, default=None)
    client_tablecrm_id = Column(Numeric, nullable=True)

    seo_url = Column(String, nullable=True)

    project_tablecrm = Column(Text, nullable=True, default=None)
    project_tablecrm_id = Column(Numeric, nullable=True)

    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True))

    performer_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)

    owner_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    header_pic = Column(String, nullable=True)
    main_pic = Column(String, nullable=True)

    header_pic_ct = Column(String, nullable=True)
    main_pic_ct = Column(String, nullable=True)

    acceptors = relationship("User", secondary=accessible_article)

    category = relationship("Category", secondary=article_category, backref="articles")

    tags = relationship("Tag", secondary=article_tag, backref="articles")

    performer = relationship("User", backref="performs", foreign_keys=[performer_id])

    owner = relationship("User", backref="articles", foreign_keys=[owner_id])

    __mapper_args__ = {"eager_defaults": True}


class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)


class Category(Base):
    __tablename__ = "category"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    image = Column(String, nullable=True)

    acceptors = relationship("User", secondary=accessible_modules)


class Survey(Base):

    __tablename__ = "survey"

    sid = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text)
    description = Column(Text)
    module = Column(ForeignKey("category.id"))
    lesson = Column(ForeignKey("articles.id"))
    creator_id = Column(ForeignKey('users.id'))
    created_at = Column(DateTime, default=dt.datetime.now)

    accessors = relationship("User", secondary=accessible_surveys)


class Answer(Base):

    __tablename__ = "answer"

    aid = Column(BigInteger, primary_key=True)
    text = Column(Text, nullable=False)
    mark = Column(SmallInteger, nullable=False)
    hint = Column(Text)
    question = Column(ForeignKey("question.qid"))


class Question(Base):

    __tablename__ = "question"
    qid = Column(BigInteger, primary_key=True, autoincrement=True)
    from_survey = Column(ForeignKey("survey.sid"))
    question_text = Column(Text, nullable=False)
    hint = Column(Text)
    answers = relationship("Answer")


class UserAnswers(Base):

    __tablename__ = "user_answers"

    ua_id = Column(Integer, primary_key=True)
    user_id = Column(ForeignKey("users.id"), nullable=False)
    survey_id = Column(ForeignKey("survey.sid"))
    started_at = Column(DateTime, default=dt.datetime.now)
    finished_at = Column(DateTime)
    finished = Column(Boolean, default=False)

    current_max_mark = Column(Integer, nullable=False)

    questions_answers = relationship("Answer", secondary=users_surveys_answers)

    @hybrid_property
    def duration_seconds(self):
        if self.finished_at is None:
            return 0
        time_delta: datetime.timedelta = self.finished_at - self.started_at
        return time_delta.total_seconds()


class Conditions(Base):

    __tablename__ = "conditions"

    cond_id = Column(BigInteger, primary_key=True)
    survey_id = Column(ForeignKey("survey.sid"), nullable=False)
    # low_boundary = Column(SmallInteger, nullable=False)
    # high_boundary = Column(SmallInteger, nullable=False)
    demarcation = Column(JSON)
