import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models import (
    TextRequest,
    PredictionResponse,
    RegisterRequest,
    LoginRequest,
    AuthResponse,
)
from .predict import predict
from .ocr import extract_text_from_image
from .database import save_prediction, fetch_history, save_user, get_user_by_email

import hashlib

app = FastAPI(title="Pulmonary Prediction API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post('/predict-text', response_model=PredictionResponse)
async def predict_text(request: TextRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Empty text")

    data = predict(request.text, model_set=request.model_set)
    data['input_type'] = 'text'
    data['model_set'] = request.model_set
   
    try:
        save_prediction(data)
    except Exception:
        pass
    return data


@app.post('/predict-image', response_model=PredictionResponse)
async def predict_image(image: UploadFile = File(...)):
    # save temporary file
    contents = await image.read()
    tmp_path = f"/tmp/{image.filename}"
    with open(tmp_path, 'wb') as f:
        f.write(contents)
    try:
        extracted = extract_text_from_image(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {e}")

    data = predict(extracted, model_set='default')
    data['input_type'] = 'image'
    data['input_text'] = extracted
    try:
        save_prediction(data)
    except Exception:
        pass
    return data


@app.post('/login', response_model=AuthResponse)
@app.post('/api/login', response_model=AuthResponse)
async def login(req: LoginRequest):
    user = get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    hashed = hashlib.sha256(req.password.encode()).hexdigest()
    if hashed != user.get('password_hash'):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {'success': True, 'message': 'logged in'}


@app.post('/register', response_model=AuthResponse)
@app.post('/api/register', response_model=AuthResponse)
async def register(req: RegisterRequest):
   
    print(f"register attempt: {req.email}")
    if get_user_by_email(req.email):
        print(" -> already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    pw_hash = hashlib.sha256(req.password.encode()).hexdigest()
    save_user(req.name, req.email, pw_hash)
    print(" -> success")
    return {'success': True, 'message': 'registered'}


@app.get('/predictions')
async def history():
    rows = fetch_history()
    return rows


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)
