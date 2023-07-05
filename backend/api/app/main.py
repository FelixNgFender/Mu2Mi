"""
[summary] Main file for the API.
[information] Path operations to define the API endpoints.
    @author: Felix Nguyen
    @email: ngthinh302@gmail.com
    @create: 2023-7-4
"""

import secure
import uvicorn
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import JSONResponse

from config import settings
import models
from routers import users, tracks
from database import SessionLocal, engine
from dependencies import validate_token


# TODO: Change to Alembic for DB initialization and migrations
# pylint: disable=invalid-name

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(openapi_url=None)

csp = secure.ContentSecurityPolicy().default_src("'self'").frame_ancestors("'none'")
hsts = secure.StrictTransportSecurity().max_age(31536000).include_subdomains()
referrer = secure.ReferrerPolicy().no_referrer()
cache_value = secure.CacheControl().no_cache().no_store().max_age(0).must_revalidate()
x_frame_options = secure.XFrameOptions().deny()

secure_headers = secure.Secure(
    csp=csp,
    hsts=hsts,
    referrer=referrer,
    cache=cache_value,
    xfo=x_frame_options,
)


@app.middleware("http")
async def set_secure_headers(request, call_next):
    """Set secure headers"""
    response = await call_next(request)
    secure_headers.framework.fastapi(response)
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_origin_url],
    allow_methods=["POST", "GET", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=86400,
)


# pylint: disable=unused-argument
@app.exception_handler(StarletteHTTPException)
def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    message = str(exc.detail)

    return JSONResponse({"message": message}, status_code=exc.status_code)


@app.get("/api/messages/public")
def public():
    return {"text": "This is a public message."}


@app.get("/api/messages/protected", dependencies=[Depends(validate_token)])
def protected():
    return {"text": "This is a protected message."}


@app.get("/api/messages/admin", dependencies=[Depends(validate_token)])
def admin():
    return {"text": "This is an admin message."}


app.include_router(users.router)
app.include_router(tracks.router)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.reload,
        server_header=False,
    )
