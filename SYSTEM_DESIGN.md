# SYSTEM DESIGN DOCUMENT
## Pulmonary Disease Prediction System

---

## 3.1 SYSTEM ARCHITECTURE

### 3.1.1 Overview
The Pulmonary Disease Prediction System is a two-tier web application designed to predict pulmonary diseases using machine learning models. Users can input symptoms as text or upload prescription images, and the system processes the data through OCR, preprocessing, and ML inference pipelines.

### 3.1.2 Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT TIER (Frontend)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Browser (React + Vite + Bootstrap)                      │   │
│  │  ├─ Home Page                                            │   │
│  │  ├─ Login / Register                                     │   │
│  │  ├─ Detection Page (Text/Image Input)                    │   │
│  │  └─ Result Visualization                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────┬─────────────────────────────────────────────┘
                     │ HTTP/REST (JSON)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  APPLICATION TIER (Backend)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FastAPI Server (Python)                                 │   │
│  │  ├─ Authentication Endpoints                             │   │
│  │  ├─ Prediction Endpoints                                 │   │
│  │  ├─ History Endpoints                                    │   │
│  │  └─ Middleware (CORS, Error Handling)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Processing Modules                                      │   │
│  │  ├─ OCR Module (EasyOCR)                                 │   │
│  │  ├─ Text Preprocessing                                   │   │
│  │  ├─ ML Inference Engine                                  │   │
│  │  └─ Ensemble Voting                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────┬─────────────────────────────────────────────┘
                     │ SQL Queries
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA TIER (Database)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SQLite Database (pulmonary.db)                          │   │
│  │  ├─ Users Table                                          │   │
│  │  ├─ Predictions Table                                    │   │
│  │  └─ Logs Table (optional)                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.1.3 Technology Stack
| Layer | Technology | Framework/Library |
|-------|-----------|------------------|
| Frontend | JavaScript | React 18, Vite, Bootstrap 5 |
| Backend | Python 3.8+ | FastAPI 0.95+ |
| Database | SQLite | Built-in Python sqlite3 |
| ML Models | Python | scikit-learn, joblib |
| OCR | Python | EasyOCR or Tesseract |

### 3.1.4 Key Components
1. **Frontend Application**: React-based SPA for user interaction
2. **API Server**: FastAPI REST endpoints for business logic
3. **OCR Service**: Extracts text from prescription images
4. **ML Engine**: Ensemble of SVM and Naive Bayes models
5. **Database Layer**: SQLite for persistence
6. **Authentication**: SHA-256 password hashing

---

## 3.2 MODULE DESIGN

### 3.2.1 Backend Modules

#### **main.py** - API Endpoints
**Purpose**: Core API server handling HTTP requests

**Endpoints**:
- `POST /predict-text` - Text-based prediction
- `POST /predict-image` - Image-based prediction
- `POST /login` - User authentication
- `POST /register` - User registration
- `GET /predictions` - Retrieve prediction history

**Dependencies**: FastAPI, Pydantic, CORS Middleware

---

#### **models.py** - Data Models
**Purpose**: Define request/response schemas

**Classes**:
```
TextRequest:
  - text: str
  - model_set: str (default | discharge)

PredictionResponse:
  - input_type: str (text | image)
  - input_text: str
  - svm_result: str
  - nb_result: str
  - final_prediction: str
  - confidence: float

RegisterRequest:
  - name: str
  - email: str
  - password: str

LoginRequest:
  - email: str
  - password: str

AuthResponse:
  - success: bool
  - message: str
```

---

#### **ocr.py** - Optical Character Recognition
**Purpose**: Extract text from prescription images

**Functions**:
- `extract_text_from_image(image_path: str) -> str`
  - Reads image file
  - Processes with EasyOCR
  - Returns extracted text

**Error Handling**: Raises HTTPException on OCR failure

---

#### **predict.py** - ML Inference
**Purpose**: Load models and perform predictions

**Functions**:
- `predict(text: str, model_set: str) -> dict`
  - Loads appropriate model set (default/discharge)
  - Tokenizes and vectorizes input text
  - Runs SVM model
  - Runs Naive Bayes model
  - Implements ensemble voting
  - Returns prediction with confidence score

**Models Supported**:
- `svm_model.joblib` / `svm_ph_model.joblib`
- `naive_bayes_model.joblib` / `nb_ph_model.joblib`

---

#### **preprocess.py** - Text Preprocessing
**Purpose**: Clean and normalize input text

**Functions**:
- Text lowercasing
- Whitespace normalization
- Punctuation removal
- Tokenization
- Stopword removal

---

#### **database.py** - Data Persistence
**Purpose**: SQLite operations

**Functions**:
- `save_prediction(data: dict)` - Store prediction results
- `fetch_history() -> list` - Retrieve all predictions
- `save_user(name, email, password_hash)` - Create user account
- `get_user_by_email(email) -> dict` - Authenticate user

**Database Location**: `backend/pulmonary.db`

---

### 3.2.2 Frontend Modules

#### **components/ImageUpload.jsx**
- Handles file upload UI
- Sends image to backend
- Displays loading state
- Handles upload errors

#### **components/SymptomForm.jsx**
- Text input form for symptoms
- Form validation
- Submit handler

#### **components/ResultCard.jsx**
- Display prediction results
- Show confidence scores
- Visual result indicator

#### **components/NavBar.jsx**
- Navigation menu
- Auth status display
- Logout functionality

#### **components/PrivateRoute.jsx**
- Route protection
- Authentication check
- Redirect to login if unauthorized

#### **pages/Home.jsx**
- Landing page
- Project overview

#### **pages/Detection.jsx**
- Main prediction interface
- Combines ImageUpload and SymptomForm
- Displays ResultCard

#### **pages/Login.jsx & Register.jsx**
- Authentication UI
- Form submission to backend

#### **services/api.js**
- Axios configuration
- API wrapper functions:
  - `predictText(text, modelSet)`
  - `predictImage(file)`
  - `login(email, password)`
  - `register(name, email, password)`
  - `getHistory()`

---

## 3.3 DATABASE DESIGN

### 3.3.1 Database Schema

#### **Users Table**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | INTEGER | PRIMARY KEY | Unique user identifier |
| name | TEXT | NOT NULL | User's full name |
| email | TEXT | UNIQUE, NOT NULL | Email address (login) |
| password_hash | TEXT | NOT NULL | SHA-256 hashed password |
| created_at | TIMESTAMP | DEFAULT CURRENT | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT | Last update timestamp |

---

#### **Predictions Table**
```sql
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    input_type TEXT NOT NULL,
    input_text TEXT NOT NULL,
    model_set TEXT DEFAULT 'default',
    svm_result TEXT,
    nb_result TEXT,
    final_prediction TEXT NOT NULL,
    confidence REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | INTEGER | PRIMARY KEY | Unique prediction ID |
| user_id | INTEGER | FOREIGN KEY | User who made prediction |
| input_type | TEXT | NOT NULL | 'text' or 'image' |
| input_text | TEXT | NOT NULL | Original/extracted text |
| model_set | TEXT | DEFAULT 'default' | Model set used |
| svm_result | TEXT | - | SVM model output |
| nb_result | TEXT | - | Naive Bayes output |
| final_prediction | TEXT | NOT NULL | Ensemble result |
| confidence | REAL | NOT NULL | Confidence score (0.0-1.0) |
| created_at | TIMESTAMP | DEFAULT CURRENT | Prediction timestamp |

---

### 3.3.2 Entity-Relationship Diagram
```
┌──────────────┐
│    Users     │
├──────────────┤
│ id (PK)      │
│ name         │
│ email        │
│ password_hash│
│ created_at   │
│ updated_at   │
└────────┬─────┘
         │
         │ 1:N
         │
         ▼
┌──────────────────────┐
│   Predictions        │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ input_type           │
│ input_text           │
│ model_set            │
│ svm_result           │
│ nb_result            │
│ final_prediction     │
│ confidence           │
│ created_at           │
└──────────────────────┘
```

### 3.3.3 Key Design Decisions
- **SQLite**: Lightweight, serverless database suitable for medium-scale applications
- **Foreign Keys**: Maintains referential integrity between users and predictions
- **CASCADE DELETE**: Removes predictions when user is deleted
- **Timestamps**: Tracks data creation and modification
- **No Password Storage**: Only hash stored for security

---

## 3.4 DATA FLOW DIAGRAM

### 3.4.1 Text Prediction Flow
```
┌─────────────────────┐
│  User enters text   │
│  in SymptomForm     │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────┐
│ Frontend sends POST request   │
│ /predict-text                │
│ {text, model_set}            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  FastAPI validates request   │
│  (TextRequest pydantic model)│
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  predict() function          │
│  ├─ Loads ML models          │
│  ├─ Preprocesses text        │
│  ├─ Vectorizes with TF-IDF   │
│  └─ Passes to SVM & NB       │
└──────────┬───────────────────┘
           │
      ┌────┴────┐
      ▼         ▼
  ┌──────┐  ┌────────┐
  │ SVM  │  │ Naive  │
  │ Model│  │ Bayes  │
  │      │  │ Model  │
  └──┬───┘  └───┬────┘
     │          │
     └────┬─────┘
          ▼
  ┌──────────────────┐
  │ Ensemble Voting  │
  │ (Majority vote)  │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────────────┐
  │ Calculate Confidence     │
  │ (Probability averaging)  │
  └────────┬─────────────────┘
           │
           ▼
  ┌─────────────────────────┐
  │ Save to database        │
  │ save_prediction(data)   │
  └────────┬────────────────┘
           │
           ▼
  ┌──────────────────────────┐
  │ Return PredictionResponse│
  │ to Frontend (JSON)       │
  └────────┬─────────────────┘
           │
           ▼
  ┌──────────────────────────┐
  │ Display ResultCard       │
  │ with prediction result   │
  │ and confidence           │
  └──────────────────────────┘
```

### 3.4.2 Image Prediction Flow
```
┌──────────────────────┐
│ User uploads image   │
│ in ImageUpload       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│ Frontend sends multipart form│
│ POST /predict-image          │
│ Content-Type: multipart/form │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ FastAPI receives UploadFile  │
│ Writes temporary file /tmp/  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ extract_text_from_image()    │
│ ├─ Loads image               │
│ ├─ Initializes EasyOCR       │
│ └─ Returns extracted text    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ predict() function           │
│ (Same as text flow)          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Add input_type: 'image'      │
│ Add input_text: extracted    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Save to database             │
│ Return prediction to frontend│
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Display results with OCR text│
└──────────────────────────────┘
```

### 3.4.3 Authentication Flow
```
┌──────────────────────────────┐
│ User submits login form       │
│ (email, password)             │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ POST /login                  │
│ {email, password}            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ get_user_by_email(email)     │
│ Query database for user      │
└──────────┬───────────────────┘
           │
      ┌────┴─────────┐
      │              │
  ┌───▼─────┐   ┌───▼────┐
  │ Found   │   │ Not     │
  │         │   │ Found   │
  └───┬─────┘   └───┬────┘
      │             │
      │        ┌────▼────────────┐
      │        │ Return 401      │
      │        │ "Invalid creds" │
      │        └─────────────────┘
      │
      ▼
  ┌──────────────────────────┐
  │ Hash provided password   │
  │ SHA256(password)         │
  └──────────┬───────────────┘
             │
             ▼
  ┌──────────────────────────┐
  │ Compare with stored hash │
  └──────────┬───────────────┘
             │
        ┌────┴─────────┐
        │              │
    ┌───▼─────┐   ┌───▼────┐
    │ Match   │   │ No     │
    │         │   │ Match  │
    └───┬─────┘   └───┬────┘
        │             │
        │        ┌────▼────────────┐
        │        │ Return 401      │
        │        │ "Invalid creds" │
        │        └─────────────────┘
        │
        ▼
    ┌──────────────────────┐
    │ Return 200 OK        │
    │ success: true        │
    └──────────────────────┘
```

---

## 3.5 INTERFACE AND PROCEDURAL DESIGN

### 3.5.1 User Interface Layout

#### **Home Page**
```
┌─────────────────────────────────────────┐
│         NAVBAR (NavBar.jsx)             │
│  Logo | Home | Detection | Login/Logout │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│                                         │
│      Project Overview Section           │
│      ├─ Title                           │
│      ├─ Description                     │
│      ├─ Features List                   │
│      └─ Call-to-Action Button           │
│                                         │
└─────────────────────────────────────────┘
```

#### **Detection Page**
```
┌─────────────────────────────────────────┐
│           NAVBAR                        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│                                         │
│    ┌─────────────────────────────────┐  │
│    │   SYMPTOM INPUT SECTION         │  │
│    │  (SymptomForm.jsx)              │  │
│    │  ├─ Text input field            │  │
│    │  ├─ Model selection dropdown    │  │
│    │  └─ Submit button               │  │
│    └─────────────────────────────────┘  │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │   IMAGE UPLOAD SECTION          │  │
│    │  (ImageUpload.jsx)              │  │
│    │  ├─ Drag-drop area              │  │
│    │  ├─ File input button           │  │
│    │  └─ Upload button               │  │
│    └─────────────────────────────────┘  │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │   RESULTS SECTION               │  │
│    │  (ResultCard.jsx)               │  │
│    │  ├─ Prediction output           │  │
│    │  ├─ Confidence score            │  │
│    │  ├─ SVM & NB results            │  │
│    │  └─ Input text display          │  │
│    └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

#### **Login/Register Page**
```
┌─────────────────────────────────────────┐
│           NAVBAR                        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│                                         │
│      ┌─────────────────────────────┐   │
│      │   LOGIN FORM                │   │
│      │  ├─ Email input             │   │
│      │  ├─ Password input          │   │
│      │  ├─ Login button            │   │
│      │  └─ Register link           │   │
│      └─────────────────────────────┘   │
│                                         │
│      OR                                 │
│                                         │
│      ┌─────────────────────────────┐   │
│      │   REGISTER FORM             │   │
│      │  ├─ Name input              │   │
│      │  ├─ Email input             │   │
│      │  ├─ Password input          │   │
│      │  ├─ Confirm password        │   │
│      │  ├─ Register button         │   │
│      │  └─ Login link              │   │
│      └─────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 3.5.2 API Endpoints Specification

#### **Text Prediction**
```
Method: POST
URL: /predict-text
Request:
  {
    "text": "string (symptoms)",
    "model_set": "string (default|discharge, optional)"
  }
Response (200 OK):
  {
    "input_type": "text",
    "input_text": "string",
    "svm_result": "disease_name",
    "nb_result": "disease_name",
    "final_prediction": "disease_name",
    "confidence": 0.95
  }
Error (400):
  {"detail": "Empty text"}
```

#### **Image Prediction**
```
Method: POST
URL: /predict-image
Request:
  Form Data:
    - image: file (jpeg, png)
Response (200 OK):
  {
    "input_type": "image",
    "input_text": "extracted text from image",
    "svm_result": "disease_name",
    "nb_result": "disease_name",
    "final_prediction": "disease_name",
    "confidence": 0.87
  }
Error (500):
  {"detail": "OCR failed: error_message"}
```

#### **User Registration**
```
Method: POST
URL: /register or /api/register
Request:
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
Response (200 OK):
  {
    "success": true,
    "message": "registered"
  }
Error (400):
  {"detail": "Email already registered"}
```

#### **User Login**
```
Method: POST
URL: /login or /api/login
Request:
  {
    "email": "string",
    "password": "string"
  }
Response (200 OK):
  {
    "success": true,
    "message": "logged in"
  }
Error (401):
  {"detail": "Invalid credentials"}
```

#### **Prediction History**
```
Method: GET
URL: /predictions
Response (200 OK):
  [
    {
      "id": 1,
      "input_type": "text",
      "final_prediction": "Tuberculosis",
      "confidence": 0.92,
      "created_at": "2026-03-04T10:30:00"
    },
    ...
  ]
```

### 3.5.3 UI Component Specifications

| Component | Props | State | Functions |
|-----------|-------|-------|-----------|
| **SymptomForm** | onSubmit | text, modelSet, loading | handleChange, handleSubmit |
| **ImageUpload** | onUpload | file, loading, dragActive | handleDrop, handleFileSelect, handleUpload |
| **ResultCard** | prediction | - | formatConfidence, getStatusColor |
| **NavBar** | isAuth | - | handleLogout |
| **PrivateRoute** | component | isAuth | ProtectedComponent |

### 3.5.4 Error Handling

**Frontend Error Handling**:
- Try-catch blocks in async functions
- Toast/Alert notifications for user feedback
- Input validation before API calls
- Network error recovery

**Backend Error Handling**:
- HTTPException for validation errors
- 400: Bad Request (empty text, invalid input)
- 401: Unauthorized (invalid credentials)
- 500: Internal Server Error (OCR, model load failures)

---

## 3.6 REPORTS DESIGN

### 3.6.1 Prediction Report Structure
```json
{
  "report_id": 12345,
  "timestamp": "2026-03-04T14:30:00Z",
  "user_info": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "input_data": {
    "input_type": "text|image",
    "input_text": "dry cough, fever, chest pain",
    "model_set": "default|discharge"
  },
  "analysis_results": {
    "svm_prediction": "Tuberculosis",
    "svm_confidence": 0.88,
    "nb_prediction": "Tuberculosis",
    "nb_confidence": 0.91,
    "final_prediction": "Tuberculosis",
    "ensemble_confidence": 0.895,
    "voting_result": "2/2 models agree"
  },
  "metadata": {
    "processing_time_ms": 245,
    "model_versions": {
      "svm": "v1.0",
      "naive_bayes": "v1.0"
    }
  }
}
```

### 3.6.2 Reports Types

#### **1. Individual Prediction Report**
**Purpose**: Detailed record of a single prediction  
**Contents**:
- Timestamp of prediction
- Input data (text/image)
- Model predictions and confidence scores
- Final ensemble result
- User who made prediction

**Format**: Single JSON record (stored in database)

---

#### **2. User History Report**
**Purpose**: View all predictions by a user  
**Contents**:
- List of predictions with IDs
- Timestamps
- Results and confidence scores
- Input summaries

**Endpoint**: `GET /predictions`

**Response**:
```json
[
  {
    "id": 1,
    "input_type": "text",
    "final_prediction": "Pneumonia",
    "confidence": 0.92,
    "created_at": "2026-03-01T10:30:00"
  },
  {
    "id": 2,
    "input_type": "image",
    "final_prediction": "Tuberculosis",
    "confidence": 0.87,
    "created_at": "2026-03-02T14:15:00"
  }
]
```

---

#### **3. Model Performance Report**
**Purpose**: Track model accuracy and agreement rates  
**Metrics**:
- SVM Accuracy: Count accurate SVM predictions
- Naive Bayes Accuracy: Count accurate NB predictions
- Ensemble Accuracy: Percentage of correct ensemble predictions
- Model Agreement Rate: % of times both models agree
- Confidence Distribution: Average confidence per disease class

**Sample Output**:
```
MODEL PERFORMANCE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Predictions: 156
Date Range: 2026-03-01 to 2026-03-04

SVM Model:
  - Accuracy: 87.2%
  - Top Predictions: Tuberculosis (45%), Pneumonia (30%), Bronchitis (15%)

Naive Bayes:
  - Accuracy: 89.1%
  - Top Predictions: Tuberculosis (48%), Pneumonia (28%), Bronchitis (14%)

Ensemble Results:
  - Agreement Rate: 92.3%
  - Ensemble Accuracy: 91.0%

Confidence Statistics:
  - Average: 0.884
  - Min: 0.62
  - Max: 0.99
```

---

#### **4. System Activity Report**
**Purpose**: Track system usage and performance  
**Metrics**:
- Total predictions made
- Text vs. Image predictions ratio
- Active users
- Response times
- Error rates

**Sample Format**:
```
SYSTEM ACTIVITY REPORT - Daily Summary (2026-03-04)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Predictions Made: 87
  - Text Input: 52 (59.8%)
  - Image Input: 35 (40.2%)

Active Users: 23
New Registrations: 4

Performance Metrics:
  - Avg Response Time: 342ms
  - Max Response Time: 1250ms
  - API Errors: 2 (2.3%)
  - OCR Success Rate: 97.1%

Most Common Predictions:
  1. Tuberculosis - 34 (39.1%)
  2. Pneumonia - 28 (32.2%)
  3. Bronchitis - 15 (17.2%)
  4. Asthma - 10 (11.5%)
```

---

#### **5. Audit Report**
**Purpose**: Track user authentication and access logs  
**Contents**:
- User login attempts (successful/failed)
- Registration events
- Data access logs
- IP address (optional)
- Timestamps

**Sample Format**:
```
AUDIT LOG - Authentication Events (2026-03-04)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
14:32:15 | LOGIN_SUCCESS | john@example.com | 192.168.1.100
14:35:42 | PREDICTION | john@example.com | Text Input
14:48:20 | LOGIN_FAILED | invalid@example.com | 192.168.1.105
14:50:03 | REGISTER | jane@example.com | Successfully created
15:01:17 | PREDICTION | jane@example.com | Image Input
```

---

### 3.6.3 Report Generation Functions

#### **Function: Generate Prediction Report**
```python
def generate_prediction_report(prediction_id: int) -> dict:
    """
    Retrieves a single prediction and formats as report
    
    Args:
        prediction_id: Database record ID
        
    Returns:
        Dictionary with formatted report structure
    """
    prediction = fetch_prediction_by_id(prediction_id)
    report = {
        "report_id": prediction_id,
        "timestamp": prediction['created_at'],
        "user_info": fetch_user_info(prediction['user_id']),
        "input_data": {...},
        "analysis_results": {...}
    }
    return report
```

#### **Function: Export Report to File**
```python
def export_report(report: dict, format: str) -> str:
    """
    Export report in JSON or CSV format
    
    Args:
        report: Report dictionary
        format: 'json' or 'csv'
        
    Returns:
        File path of exported report
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{timestamp}.{format}"
    
    if format == 'json':
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
    elif format == 'csv':
        # CSV conversion logic
        pass
        
    return filename
```

### 3.6.4 Report Dashboard Components

**Frontend Components for Reporting**:

1. **ReportViewer.jsx** - Display formatted reports
2. **HistoryTable.jsx** - Show prediction history in tabular format
3. **ChartComponent.jsx** - Visualize model statistics and trends
4. **ExportButton.jsx** - Download reports as JSON/CSV

**Key Visualizations**:
- Pie chart: Disease distribution
- Line chart: Predictions over time
- Bar chart: Model comparison
- Confidence score histogram

### 3.6.5 Report Accessibility

**Report Access Control**:
- Users can view only their own predictions
- Admin access for system-wide reports (future implementation)
- Authentication required for all report endpoints

**Data Privacy**:
- No sensitive user info in exported reports
- Anonymization options for sharing
- GDPR compliance considerations

---

## 3.7 DEPLOYMENT AND SCALABILITY

### 3.7.1 Deployment Architecture
```
Cloud/Server
├─ Frontend (Nginx)
│  └─ React SPA (Vite build)
├─ Backend (Gunicorn + Uvicorn)
│  └─ FastAPI application
├─ Database
│  └─ SQLite or PostgreSQL
└─ ML Models
   └─ Joblib files
```

### 3.7.2 Scalability Considerations
- **Horizontal scaling**: Multiple backend instances with load balancer
- **Database upgrade**: Migrate from SQLite to PostgreSQL for production
- **Model caching**: Cache loaded models in memory
- **Async processing**: Use message queues (Celery) for long-running tasks
- **CDN**: Serve frontend assets through CDN

---

## 3.8 SECURITY CONSIDERATIONS

### 3.8.1 Security Measures
- **Password hashing**: SHA-256 (recommend bcrypt for production)
- **CORS protection**: Accept requests only from trusted origins
- **Input validation**: Pydantic models ensure type safety
- **Error handling**: Don't expose internal errors to users
- **File uploads**: Validate file types and sizes

### 3.8.2 Future Enhancements
- JWT token-based authentication
- Rate limiting on API endpoints
- HTTPS/TLS encryption
- Database encryption at rest
- Audit logging for compliance

---

## 3.9 APPENDIX - DATA EXAMPLES

### Example Prediction Response
```json
{
  "input_type": "text",
  "input_text": "persistent dry cough for 3 weeks, mild fever, night sweats, weight loss",
  "svm_result": "Tuberculosis",
  "nb_result": "Tuberculosis",
  "final_prediction": "Tuberculosis",
  "confidence": 0.91
}
```

### Example Database Query Results
```
Query: SELECT * FROM predictions LIMIT 5;
┌────┬────────┬───────────┬────────────────┬──────────────┬──────────┬────────────────┐
│ id │ user_id│input_type │ final_prediction│ confidence │model_set │ created_at      │
├────┼────────┼───────────┼────────────────┼──────────────┼──────────┼────────────────┤
│ 1  │ 1      │ text      │ Tuberculosis   │ 0.91       │ default  │ 2026-03-01 ... │
│ 2  │ 1      │ image     │ Pneumonia      │ 0.87       │ default  │ 2026-03-02 ... │
│ 3  │ 2      │ text      │ Asthma         │ 0.79       │ discharge│ 2026-03-03 ... │
│ 4  │ 2      │ image     │ Bronchitis     │ 0.84       │ default  │ 2026-03-04 ... │
│ 5  │ 3      │ text      │ Tuberculosis   │ 0.88       │ default  │ 2026-03-04 ... │
└────┴────────┴───────────┴────────────────┴──────────────┴──────────┴────────────────┘
```

---

## Document Information

**Document Title**: System Design Document - Pulmonary Disease Prediction System  
**Version**: 1.0  
**Date**: March 4, 2026  
**Status**: Complete  
**Author**: Development Team  
**Last Updated**: March 4, 2026

---

*End of System Design Document*
