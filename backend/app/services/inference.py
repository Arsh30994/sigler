from __future__ import annotations

import numpy as np

from backend.app.config import MODEL_VERSION
from backend.app.schemas.recognition import RecognitionResponse
from backend.app.services.feature_normalizer import LandmarkValidationError, build_feature_vector
from backend.app.services.model_loader import LoadedModel
from backend.app.services.temporal_aggregator import TemporalAggregator


class RecognitionService:
    def __init__(self, model: LoadedModel, aggregator: TemporalAggregator, min_confidence: float | None) -> None:
        self._model = model
        self._aggregator = aggregator
        self._min_confidence = min_confidence

    def predict(self, session_id: str, hands: list) -> RecognitionResponse:
        if not hands:
            self._aggregator.reset(session_id)
            return self._response("unknown", 0, 0, "insufficient_hand_landmarks")
        try:
            features = build_feature_vector(hands)
        except LandmarkValidationError as error:
            self._aggregator.reset(session_id)
            return self._response("unknown", 0, 0, str(error))
        probabilities = self._model.probabilities(features)
        mean, frames_used = self._aggregator.add(session_id, probabilities)
        if mean is None:
            return self._response("collecting", 0, frames_used, "collecting_five_valid_frames")
        index = int(np.argmax(mean))
        confidence = float(mean[index])
        if self._min_confidence is not None and confidence < self._min_confidence:
            return self._response("unknown", confidence, frames_used, "below_configured_confidence_threshold")
        # No confidence threshold is silently invented. Until one is validated, this remains a candidate.
        status = "recognized" if self._min_confidence is not None else "candidate"
        return RecognitionResponse(
            status=status,
            model_label=self._model.classes[index],
            sign_id=self._model.classes[index],
            confidence=confidence,
            model_supported=True,
            human_validated=False,
            speech_permitted=False,
            animation_permitted=False,
            model_version=MODEL_VERSION,
            frames_used=frames_used,
            reason="human_review_and_approved_animation_required",
        )

    @staticmethod
    def _response(status: str, confidence: float, frames_used: int, reason: str) -> RecognitionResponse:
        return RecognitionResponse(
            status=status,
            confidence=confidence,
            model_supported=False,
            human_validated=False,
            speech_permitted=False,
            animation_permitted=False,
            model_version=MODEL_VERSION,
            frames_used=frames_used,
            reason=reason,
        )
