from sqlalchemy.orm import Session
from sqlalchemy import or_

from db.models import User, tags_for_users, category_for_users

import aio_pika
import json


async def producer_sending(
        text: str, skipBlocked: bool, tags_ids: list, categories_ids: list, uuid_sending: str, session: Session
) -> None:
    connection = await aio_pika.connect_robust(host="rabbitmq", port=5672, timeout=10)

    async with connection:
        routing_key = "sending_queue"
        channel = await connection.channel()

        query = (session.query(User.tg_id))

        if tags_ids:
            tags_ids = session.query(tags_for_users.c.user_id).filter(tags_for_users.c.tag_id.in_(tags_ids)).all()
            query = query.filter(User.id.in_([tag[0] for tag in tags_ids]))

        if categories_ids:
            categories_ids = session.query(category_for_users.c.user_id).filter(
                category_for_users.c.category_id.in_(categories_ids)).all()
            query = query.filter(User.id.in_([category[0] for category in categories_ids]))

        if skipBlocked:
            query = query.filter(User.is_blocked == False)

        users_ids = query.all()
        count_ids = len(users_ids)
        body = {"uuid_sending": uuid_sending, "text": text, "skipBlocked": skipBlocked, "count_ids": count_ids}

        for user_id in users_ids:
            body.update({"user_id": user_id[0]})
            await channel.default_exchange.publish(
                aio_pika.Message(body=json.dumps(body).encode()),
                routing_key=routing_key,
            )
