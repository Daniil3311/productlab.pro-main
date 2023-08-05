from aiogram import Bot, types
from aiogram.dispatcher import Dispatcher
from aiogram.utils import executor
import websockets

import aioboto3
import io

from db import crud

from config import Config

bot = Bot(token=Config.BOT_TOKEN)
dp = Dispatcher(bot)

uri = Config.BOT_WS_URL

s3_session = aioboto3.Session()


s3_data = {
    "service_name": "s3",
    "endpoint_url": "https://storage.clo.ru",
    "aws_access_key_id": Config.S3_ACCESS,
    "aws_secret_access_key": Config.S3_SECRET,
}

bucket_name = "natfullin-default-bucket"

@dp.message_handler(commands=["start"])
async def process_start_command(message: types.Message):
    id = message.from_user.id
    name = message.from_user.first_name

    pic = await message.from_user.get_profile_photos()
    file_location = f"storage/profile_pic/{id}.jpg" if pic.total_count != 0 else None

    user = await crud.create_user(id, name, profile_pic=file_location, url_ws=uri)
    await message.reply(f"Ваша ссылка:\n\n<a href='https://{Config.ADMIN_URL}?token={user.token}'>https://{Config.ADMIN_URL}?token={user.token}</a>", parse_mode="HTML")

    if pic.total_count != 0:
        photo_bytes = io.BytesIO()
        photo_bytes.seek(0)
        await bot.download_file_by_id(pic.photos[0][-1]['file_id'], photo_bytes)
        async with s3_session.client(**s3_data) as s3:
            await s3.upload_fileobj(photo_bytes, bucket_name, "/".join(file_location.split("/")[1:]))


if __name__ == "__main__":
    executor.start_polling(dp)
