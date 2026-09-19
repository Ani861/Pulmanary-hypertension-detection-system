# Pulmonary Disease Prediction Project

This repository implements a simple web application for predicting pulmonary diseases
from either user-entered symptoms or a prescription image. The architecture uses a
React frontend with Bootstrap for UI and a FastAPI backend that handles OCR,
preprocessing, inference with machine learning models, and storing predictions
in a SQLite database.

## 🚀 High-Level Architecture

```
User (Browser)
   ↓
React Frontend
   ├─ Symptom Text Input
   ├─ Prescription Image Upload
   ├─ Result Visualization
   ↓ REST API (JSON)
FastAPI Backend
   ├─ OCR Module (EasyOCR / Tesseract)
   ├─ Text Preprocessing
   ├─ ML Models
   │    ├─ TF-IDF + Linear SVM
   │    └─ Naive Bayes
   ├─ Ensemble Voting
   ├─ SQLite Database
   ↓
Prediction + Confidence
```

## 📁 Folder Structure

- `frontend/` – React code using Vite and Bootstrap
  - `src/components` – UI components (forms, file upload, result cards)
  - `src/pages/Home.jsx` – main page combining components
  - `src/services/api.js` – Axios wrapper to call backend
  - `App.jsx` / `main.jsx` – entry point
- `backend/` – FastAPI application
  - `app/main.py` – API endpoints
  - `app/ocr.py` – EasyOCR wrapper
  - `app/preprocess.py` – simple text cleaning
  - `app/predict.py` – model loading & ensemble logic
  - `app/database.py` – SQLite helper functions
  - `app/models.py` – Pydantic schemas
  - `ml_models/` – directory for trained machine‑learning models
  - `pulmonary.db` – SQLite database file (created automatically)
  - `requirements.txt` – Python dependencies

## 🛠️ Getting Started

### Backend
```bash
cd backend
python -m venv .venv        # create virtualenv (optional)
# activate the venv (Windows): .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

Two simple authentication endpoints have been added for the demo app:

- `POST /register` expects `{name,email,password}` and creates a user (email
  must be unique).
- `POST /login` expects `{email,password}` and returns `{'success':true}` on
  valid credentials or a 401 error otherwise.

Password hashes are stored in the SQLite database; you can inspect
`backend/pulmonary.db` with any sqlite client.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser. In development the
code normally calls the backend directly (see `src/services/api.js`).
If you set `VITE_API_URL` to something other than the default, make sure it
*does not* include a trailing `/api` segment – the code will strip it off and
warn, but an incorrect value will otherwise cause 404 "Not Found" errors.

### Configuring request timeouts

The client uses Axios and by default waits two minutes for a response. Large
image uploads or a slow backend can exceed the previous 30 second limit and
trigger the `timeout exceeded 30000ms to upload` error you may have seen. You
can override the behaviour by setting the `VITE_API_TIMEOUT` environment
variable (value is in milliseconds, e.g. `60000` for one minute) or keep the
longer default if you prefer.

## 🔍 Notes

- The ML models (e.g. `svm_tfidf.joblib` or `svm_model.joblib`,
  `naive_bayes.joblib` or `naive_bayes_model.joblib`) are expected to live in `backend/ml_models`. The prediction logic now
  tries multiple common filenames when loading the classifiers. If the files are
  missing the API will still run but return "unknown" results.
- OCR is powered by `easyocr`; install a GPU version if desired.
- Predictions are stored in SQLite for history retrieval via the
  `/predictions` endpoint.
- This is an academic/demo project – **no medical advice is provided**. Always
  consult a certified healthcare professional.

---

Feel free to extend the components, improve the models, or swap out the
database/ORM for something else as the project evolves.