from pydantic import BaseModel
from typing import Optional


class TextRequest(BaseModel):
    text: str
    model_set: Optional[str] = 'default'


class PredictionResponse(BaseModel):
    input_type: str
    input_text: str
    svm_result: Optional[str]
    nb_result: Optional[str]
    biobert_result: Optional[str] = None
    final_prediction: str
    confidence: float
    extracted_keywords: list[str] = []
    related_conditions: list[dict] = []
    medical_insight: str = ""
    next_steps: list[str] = []
    risk_level: str = ""


class ImageUploadResponse(BaseModel):
    prediction: PredictionResponse



class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    success: bool
    message: str

