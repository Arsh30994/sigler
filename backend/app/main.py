from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import MODEL_VERSION, Settings
from backend.app.schemas.recognition import ReadinessResponse, RecognitionRequest, RecognitionResponse
from backend.app.services.inference import RecognitionService
from backend.app.services.model_loader import ModelLoadError, load_verified_model
from backend.app.services.temporal_aggregator import TemporalAggregator

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("sigler.vsrs")


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings.from_environment()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        try:
            model = load_verified_model(settings.model_path)
            app.state.service = RecognitionService(model, TemporalAggregator(settings.session_ttl_seconds), settings.min_confidence)
            app.state.model_error = None
            logger.info("VSRS model ready; path=%s", settings.model_path)
        except ModelLoadError as error:
            app.state.model_error = str(error)
            logger.warning("VSRS model unavailable; reason=%s", error)
        yield

    app = FastAPI(title="Sigler VSRS V1 Recognition", version=MODEL_VERSION, lifespan=lifespan)
    app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["content-type"])
    app.state.settings = settings
    app.state.service = None
    app.state.model_error = "model_not_loaded"

    @app.middleware("http")
    async def reject_oversized_requests(request: Request, call_next):
        length = request.headers.get("content-length")
        if length and int(length) > settings.max_request_bytes:
            return JSONResponse(status_code=413, content={"detail": "request_too_large"})
        return await call_next(request)

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": "sigler-vsrs-v1"}

    @app.get("/ready", response_model=ReadinessResponse)
    async def ready() -> ReadinessResponse:
        return ReadinessResponse(ready=app.state.service is not None, model_version=MODEL_VERSION, model_path=str(settings.model_path), reason=app.state.model_error)

    @app.post("/api/v1/recognition/predict", response_model=RecognitionResponse)
    async def predict(payload: RecognitionRequest) -> RecognitionResponse:
        service: RecognitionService | None = app.state.service
        if service is None:
            raise HTTPException(status_code=503, detail={"code": "model_unavailable", "reason": app.state.model_error})
        result = service.predict(payload.session_id, payload.hands)
        logger.info("recognition result; session=%s status=%s frames=%s", payload.session_id, result.status, result.frames_used)
        return result

    return app


app = create_app()
