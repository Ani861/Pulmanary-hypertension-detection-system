import os
from typing import Tuple
import joblib

from sklearn.feature_extraction.text import HashingVectorizer
from transformers import pipeline

from .preprocess import clean_text

MODEL_DIR = os.path.join(os.path.dirname(__file__), '../ml_models')

_svm = None
_nb = None
_vectorizer = None
_svm_discharge = None
_nb_discharge = None
_biobert_discharge = None


def _load_svm():
    global _svm
    if _svm is None:
       
        candidates = ['svm_ph_model.joblib']
        for fname in candidates:
            path = os.path.join(MODEL_DIR, fname)
            if os.path.exists(path):
                try:
                    _svm = joblib.load(path)
                except Exception:
                    _svm = None
                break
        else:
            _svm = None
    return _svm


def _load_nb():
    global _nb
    if _nb is None:
        
        candidates = ['nb_ph_model.joblib']
        for fname in candidates:
            path = os.path.join(MODEL_DIR, fname)
            if os.path.exists(path):
                try:
                    _nb = joblib.load(path)
                except Exception:
                    _nb = None
                break
        else:
            _nb = None
    return _nb


def _load_svm_discharge():
    global _svm_discharge
    if _svm_discharge is None:
        candidates = ['svm_model.joblib']
        for fname in candidates:
            path = os.path.join(MODEL_DIR, fname)
            if os.path.exists(path):
                try:
                    _svm_discharge = joblib.load(path)
                except Exception:
                    _svm_discharge = None
                break
        else:
            _svm_discharge = None
    return _svm_discharge


def _load_nb_discharge():
    global _nb_discharge
    if _nb_discharge is None:
        candidates = ['naive_bayes_model.joblib']
        for fname in candidates:
            path = os.path.join(MODEL_DIR, fname)
            if os.path.exists(path):
                try:
                    _nb_discharge = joblib.load(path)
                except Exception:
                    _nb_discharge = None
                break
        else:
            _nb_discharge = None
    return _nb_discharge


def _load_biobert_discharge():
    global _biobert_discharge
    if _biobert_discharge is None:
        path = os.path.join(MODEL_DIR, 'Biobert')
        if os.path.exists(path):
            try:
                _biobert_discharge = pipeline("text-classification", model=path, tokenizer=path)
            except Exception as e:
                print("Error loading BioBERT:", e)
                _biobert_discharge = None
        else:
            _biobert_discharge = None
    return _biobert_discharge


def ensemble_confidence(svm_pred=None, nb_pred=None, biobert_pred=None):

    score = 0.0

    if biobert_pred is not None:
        weights = {
            'biobert': 0.50,
            'svm': 0.35,
            'nb': 0.15
        }
        score += weights['biobert'] * int(biobert_pred)
        if svm_pred is not None:
            score += weights['svm'] * int(svm_pred)
        if nb_pred is not None:
            score += weights['nb'] * int(nb_pred)
    else:
        weights = {
            'svm': 0.66,
            'nb': 0.34
        }
        if svm_pred is not None:
            score += weights['svm'] * int(svm_pred)
        if nb_pred is not None:
            score += weights['nb'] * int(nb_pred)

    ph_probability = score

    final = '1' if ph_probability >= 0.5 else '0'

    decision_confidence = ph_probability if final == '1' else (1 - ph_probability)

    return final, ph_probability, decision_confidence



def _get_vectorizer(n_features: int):
    """Return a singleton HashingVectorizer with the requested size."""
    global _vectorizer
    if _vectorizer is None or getattr(_vectorizer, 'n_features', None) != n_features:
       
        _vectorizer = HashingVectorizer(n_features=n_features, alternate_sign=False)
    return _vectorizer


def predict(text: str, model_set: str = 'default') -> dict:
    cleaned = clean_text(text)
    
 
    keywords_list = ["cough", "breathlessness", "chest pain", "fatigue", "shortness of breath", "dizziness", "fainting", "swelling", "edema", "palpitations", "wheezing"]
    extracted_keywords = [kw for kw in keywords_list if kw in text.lower()]
    
    biobert_model = None
    if model_set == 'discharge':
        svm_model = _load_svm_discharge()
        nb_model = _load_nb_discharge()
        biobert_model = _load_biobert_discharge()
    else:
        svm_model = _load_svm()
        nb_model = _load_nb()

    svm_pred = None
    nb_pred = None
    biobert_pred = None
    n_feats = None
    for m in (svm_model, nb_model):
        if m is not None and hasattr(m, 'n_features_in_'):
            n_feats = m.n_features_in_
            break

    vec = None
    if n_feats is not None:
        try:
            vec = _get_vectorizer(n_feats)
        except Exception:
            vec = None

    if svm_model:
        try:
            if vec is not None:
                X = vec.transform([cleaned])
            else:
                X = [cleaned]
            svm_raw = svm_model.predict(X)[0]
            if model_set == 'default':
                svm_pred = str(1 - int(svm_raw))
            else:
                svm_pred = str(1 - int(svm_raw))
        except Exception:
            svm_pred = None
    if nb_model:
        try:
            if vec is not None:
                X = vec.transform([cleaned])
            else:
                X = [cleaned]
            nb_raw = nb_model.predict(X)[0]
            if model_set == 'default':
                nb_pred = str(1 - int(nb_raw))
            else:
                nb_pred = str(1 - int(nb_raw))
        except Exception:
            nb_pred = None

    if biobert_model:
        try:
            text_to_feed = cleaned[:750] + " " + cleaned[-750:]
            
            res = biobert_model(text_to_feed, truncation=True, max_length=512)[0]
            label = str(res.get('label', ''))

            if '1' in label:
                biobert_pred = '1'
            elif '0' in label:
                biobert_pred = '0'
            else:
                biobert_pred = '1' if label.lower() in ('positive', 'ph', 'true', 'yes') else '0'

        except Exception as e:
            print("Biobert inference error:", e)
            biobert_pred = None

    else:
        text_to_feed = cleaned

    votes = [p for p in (svm_pred, nb_pred, biobert_pred) if p is not None]
    print("SVM:", svm_pred)
    print("NB:", nb_pred)
    print("BioBERT:", biobert_pred)
    print("Votes:", votes)

    final, ph_prob, decision_conf = ensemble_confidence(
        svm_pred=svm_pred, nb_pred=nb_pred, biobert_pred=biobert_pred
    )

 
    def get_ph_label(pred_val, conf=None):
        if str(pred_val) == '1':
            if conf is not None:
                if conf > 0.8:
                    return "High Chances of PH"
                elif conf > 0.6:
                    return "Moderate Chances of PH"
                else:
                    return "Possible Indications of PH"
            return "Indications of PH"
        else:
            return "Low Chances of PH"

    final_label = get_ph_label(final, decision_conf)
    if svm_pred is not None:
        svm_pred = get_ph_label(svm_pred)
    if nb_pred is not None:
        nb_pred = get_ph_label(nb_pred)
    if biobert_pred is not None:
        biobert_pred = get_ph_label(biobert_pred)

    
    related_conditions = []
    medical_insight = ""
    next_steps = []
    risk_level = "Low"

    if final == '1': 
        if model_set == 'discharge':
            medical_insight = "Based on the discharge summary or prescription, there are strong indications of Pulmonary Hypertension (PH)."
        else:
            medical_insight = "The symptoms detected are closely associated with Pulmonary Hypertension (PH), a condition characterized by high blood pressure in the lungs' arteries. Indicators such as " + (", ".join(extracted_keywords) if extracted_keywords else "those provided") + " warrant further evaluation."
        
       
        
        if decision_conf > 0.8:
            risk_level = "High"
            next_steps = [
                "Seek immediate medical consultation",
                "Consult a pulmonologist or cardiologist",
                "Prepare for diagnostic tests like Echocardiogram or Right Heart Catheterization"
            ]
        elif decision_conf > 0.6:
            risk_level = "Moderate"
            next_steps = [
                "Schedule an appointment with a doctor soon",
                "Consider diagnostic tests such as Chest X-ray or ECG",
                "Monitor symptoms closely"
            ]
        else:
            risk_level = "Low-Moderate"
            next_steps = [
                "Consult a healthcare professional for a routine checkup",
                "Keep a log of your symptoms"
            ]
            
    else: 
        if model_set == 'discharge':
            medical_insight = "Based on the discharge summary or prescription, specific markers strongly indicative of Pulmonary Hypertension are not prominently detected."
        else:
            medical_insight = "Based on the provided text, the specific markers strongly indicative of Pulmonary Hypertension are not prominently detected. However, symptoms like " + (", ".join(extracted_keywords) if extracted_keywords else "those mentioned") + " should still be evaluated."
        
        
        
        risk_level = "Low"
        next_steps = [
            "Maintain a healthy lifestyle",
            "Consult a doctor if symptoms persist or worsen",
            "Routine health checkups are recommended"
        ]

    result = {
        'input_text': text,
        'svm_result': svm_pred,
        'nb_result': nb_pred,
        'biobert_result': biobert_pred,
        'final_prediction': final_label,
        'confidence': decision_conf,
        'ph_probability': ph_prob,
        'extracted_keywords': extracted_keywords,
        'related_conditions': related_conditions,
        'medical_insight': medical_insight,
        'next_steps': next_steps,
        'risk_level': risk_level
    }
    return result
