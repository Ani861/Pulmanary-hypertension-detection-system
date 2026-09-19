import React, { useState } from 'react';
import api from '../services/api';

function ImageUpload({ onResult, isActive }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File is too large (max 5 MB). Please choose a smaller image.');
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await api.post('/predict-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onResult(res.data);
      if (!res.data.input_text) {
        alert('OCR succeeded but no text was found in the image');
      }
    } catch (err) {
      console.error('ocr error', err);
      
      let msg = err.response?.data?.detail || err.message || 'OCR prediction failed';
      if (err.code === 'ECONNABORTED' && err.message.includes('timeout')) {
        msg = 'Request took too long – please try a smaller image or wait and try again.';
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="prescription" className="form-label">
          Upload prescription image
        </label>
        <input
          type="file"
          className="form-control"
          id="prescription"
          accept="image/*"
          onChange={handleFileChange}
          disabled={!isActive || loading}
        />
        <small className="text-muted">
          Supports JPG, PNG, and other common image formats. Max 5 MB.
        </small>
      </div>
      <button type="submit" className="btn btn-primary" disabled={!isActive || loading}>
        {loading ? 'Uploading...' : 'Get Prediction'}
      </button>
    </form>
  );
}

export default ImageUpload;