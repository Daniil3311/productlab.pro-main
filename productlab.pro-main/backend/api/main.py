import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import articles, tokens, users, websockets, files, surveys

app = FastAPI(
    root_path="/api"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articles.router)
app.include_router(tokens.router)
app.include_router(users.router)
app.include_router(websockets.router)
app.include_router(files.router)
app.include_router(files.storage_router)
app.include_router(surveys.router)


# if __name__ == '__main__':
#     try:
#         test_get_users(app)
#         uvicorn.run(app, host='0.0.0.0', port=5001)
#     except AssertionError:
#         print(1111)