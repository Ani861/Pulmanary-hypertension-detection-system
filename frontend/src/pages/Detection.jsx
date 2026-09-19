import React, { useState } from 'react';
import SymptomForm from '../components/SymptomForm';
import ImageUpload from '../components/ImageUpload';
import ResultCard from '../components/ResultCard';

import { Navigate } from 'react-router-dom';

function Detection() {
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  if (!localStorage.getItem('loggedIn')) {
    return <Navigate to="/login" replace />;
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResult(null); // clear previous result when switching tabs
  };

  return (
    <div className="container mt-5 fade-in-left">
      <div className="card p-4 shadow-lg border-0" style={{ borderRadius: '15px' }}>
        <h2 className="mb-3" style={{ color: 'var(--primary-color)' }}>Pulmonary Disease Prediction</h2>
        <p className="text-muted mb-4">
          Select one input method and enter your data. Only one prediction can
          be made at a time.{' '}
          <small className="text-danger d-block mt-2 font-monospace">
            * This is for academic demonstration only. Consult a physician for
            medical advice.
          </small>
        </p>

        {/* Input Selection Tabs */}
        <div className="mb-4 slide-up delay-100">
          <div className="btn-group w-100 shadow-sm" role="tablist">
            <button
              type="button"
              className={`btn ${
                activeTab === 'symptoms' ? 'btn-primary' : 'btn-outline-primary'
              } py-2`}
              onClick={() => handleTabChange('symptoms')}
            >
              📝 Symptoms
            </button>
            <button
              type="button"
              className={`btn ${
                activeTab === 'discharge'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              } py-2`}
              onClick={() => handleTabChange('discharge')}
            >
              📄 Discharge Summary
            </button>
            <button
              type="button"
              className={`btn ${
                activeTab === 'image' ? 'btn-primary' : 'btn-outline-primary'
              } py-2`}
              onClick={() => handleTabChange('image')}
            >
              🖼️ Prescription Image
            </button>
          </div>
        </div>

        {/* Content Based on Selected Tab */}
        <div className="slide-up delay-200" style={{ minHeight: '300px' }}>
          {activeTab === 'symptoms' && (
            <div className="tab-content fade-in">
              <SymptomForm
                mode="symptoms"
                onResult={setResult}
                isActive={activeTab === 'symptoms'}
              />
            </div>
          )}

          {activeTab === 'discharge' && (
            <div className="tab-content fade-in">
              <SymptomForm
                mode="discharge"
                onResult={setResult}
                isActive={activeTab === 'discharge'}
              />
            </div>
          )}

          {activeTab === 'image' && (
            <div className="tab-content fade-in">
              <ImageUpload
                onResult={setResult}
                isActive={activeTab === 'image'}
              />
            </div>
          )}
          {!activeTab && (
            <div className="alert alert-info text-center py-4 glass-bg border-info fade-in">
              <span className="fs-5">ℹ️ Select one of the three input methods above to begin.</span>
            </div>
          )}
        </div>

       
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}

export default Detection;