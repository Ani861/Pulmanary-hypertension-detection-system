import React, { useState } from 'react';
import api from '../services/api';

function SymptomForm({ mode, onResult, isActive }) {
  const [text, setText] = useState('');
  const [discharge, setDischarge] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputText = mode === 'symptoms' ? text : discharge;
    if (!inputText) return;

    setLoading(true);
    try {
      const modelSet = mode === 'discharge' ? 'discharge' : 'default';
      const res = await api.post('/predict-text', {
        text: inputText,
        model_set: modelSet,
      });
      onResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {mode === 'symptoms' && (
        <div className="mb-3">
          <label htmlFor="symptoms" className="form-label">
            Describe your symptoms
          </label>
          <textarea
            id="symptoms"
            className="form-control"
            rows={5}
            placeholder="Enter symptom descriptions (e.g., shortness of breath, chest pain, coughing)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!isActive || loading}
          />
          <small className="text-muted">
            Be as detailed as possible for better predictions.
          </small>
        </div>
      )}

      {mode === 'discharge' && (
        <div className="mb-3">
          <label htmlFor="discharge" className="form-label">
            Paste discharge summary
          </label>
          <textarea
            id="discharge"
            className="form-control"
            rows={5}
            placeholder="Paste the full discharge summary text here"
            value={discharge}
            onChange={(e) => setDischarge(e.target.value)}
            disabled={!isActive || loading}
          />
          <small className="text-muted">
            Include relevant medical history and findings.
          </small>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={!isActive || loading}
      >
        {loading ? 'Predicting...' : 'Get Prediction'}
      </button>
    </form>
  );
}

export default SymptomForm;
