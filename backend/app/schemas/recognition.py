from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Landmark(BaseModel):
    model_config = ConfigDict(extra="forbid")

    x: float
    y: float
    z: float


class HandLandmarks(BaseModel):
    model_config = ConfigDict(extra="forbid")

    handedness: Literal["left", "right"]
    landmarks: list[Landmark] = Field(min_length=21, max_length=21)


class RecognitionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_id: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")
    hands: list[HandLandmarks] = Field(max_length=2)

    @field_validator("hands")
    @classmethod
    def validate_unique_hands(cls, hands: list[HandLandmarks]) -> list[HandLandmarks]:
        handedness = [hand.handedness for hand in hands]
        if len(handedness) != len(set(handedness)):
            raise ValueError("At most one left and one right hand may be supplied")
        return hands


class RecognitionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    status: Literal["collecting", "candidate", "recognized", "unknown", "unavailable"]
    model_label: str | None = None
    sign_id: str | None = None
    confidence: float = Field(ge=0, le=1)
    model_supported: bool
    human_validated: bool
    speech_permitted: bool
    animation_permitted: bool
    model_version: str
    frames_used: int = Field(ge=0, le=5)
    reason: str | None = None


class ReadinessResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    ready: bool
    model_version: str
    model_path: str
    reason: str | None = None
