from aiogram import exceptions
from bot import bot

from sqlalchemy.orm import Session
from db.database import get_session
from db.models import Sending, User

import asyncio
import logging
import aio_pika
import json


async def send_message(user_id: int, text: str) -> int:
    try:
        await bot.send_message(chat_id=user_id, text=text)
        return 1
    except exceptions.RetryAfter as e:
        await asyncio.sleep(e.timeout)
        return await send_message(user_id=user_id, text=text)
    except:
        return 0


async def consumer_sending(session: Session) -> None:
    logging.basicConfig(level=logging.INFO)

    connection = await aio_pika.connect_robust(host="rabbitmq", port=5672, timeout=10)

    queue_name = "sending_queue"

    async with connection:
        # Creating channel
        channel = await connection.channel()

        # Will take no more than 10 messages in advance
        await channel.set_qos(prefetch_count=10)

        # Declaring queue
        queue = await channel.declare_queue(queue_name, auto_delete=True)

        send_count = 0
        message_count = 0

        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process():
                    body = json.loads(message.body.decode())

                    user_id = body["user_id"]
                    text = body["text"]
                    count_ids = body["count_ids"]

                    send_status = await send_message(user_id=user_id, text=text)

                    user = session.query(User).filter(User.tg_id == user_id).first()
                    user.is_blocked = not bool(send_status)
                    session.commit()

                    send_count += send_status
                    message_count += 1

                    if message_count == count_ids:
                        sending = Sending(
                            uuid=body["uuid_sending"], text=text,
                            skipBlocked=body["skipBlocked"], send_count=send_count, all_count=count_ids
                        )
                        session.add(sending)
                        session.commit()
                        break


if __name__ == "__main__":
    session = next(get_session())
    asyncio.run(consumer_sending(session=session))
