import React from 'react';
import { Link, Navigate } from 'react-router-dom';

function Home() {
  if (!localStorage.getItem('loggedIn')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <header
        className="parallax text-white py-5 position-relative"
        style={{
          backgroundImage: `url('https://via.placeholder.com/1500x800?text=Pulmonary+Hypertension')`,
        }}
      >
        
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
        <div className="container text-center fade-in position-relative">
          <h1 className="display-4 slide-up">Pulmonary Hypertension (PH)</h1>
          <p className="lead slide-up delay-100">
            Pulmonary hypertension is high blood pressure in the arteries of the
            lungs. It can lead to shortness of breath, dizziness, and fatigue.
            Early detection and treatment are vital to improve outcomes.
          </p>
        </div>
      </header>

      <div className="container mt-5 py-4">
        <div className="container text-center position-relative slide-up delay-200">
        <h2 className="mb-4" style={{ color: 'var(--primary-color)' }}>About PH</h2>
        <p className="text-muted" style={{ lineHeight: '1.8' }}>
          Pulmonary hypertension (PH) is a progressive condition characterized
          by increased pressure in the pulmonary arteries. It may result from
          heart disease, lung disorders, or blood clotting abnormalities. Key
          symptoms include breathlessness during activity, chest pain, and
          syncope. Diagnosis typically involves echocardiograms and right-sided
          heart catheterization. Treatment focuses on underlying causes and may
          use vasodilators, diuretics, or anticoagulants.
        </p>
        <p className="text-muted mt-3">
          This website offers a prediction tool to assist in identifying
          pulmonary issues based on symptoms or prescription images. It is
          intended for academic demonstration only and not as medical advice.
        </p>
       </div>  
      </div>

      <section
        className="parallax text-white py-5 position-relative"
        style={{
          backgroundImage: `url('https://via.placeholder.com/1500x600?text=Early+Detection')`,
        }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
        <div className="container text-center position-relative slide-up delay-300">
          <h2 className="mb-3">Why Early Detection Matters</h2>
          <p className="lead mb-4">
            Recognizing symptoms early can significantly improve treatment
            outcomes and quality of life. Use our detection tool to get an
            academic-level indication of potential pulmonary issues.
          </p>
          <div className="mt-4">
            <Link to="/detection" className="btn btn-lg btn-primary animate-hover px-5 rounded-pill shadow">
              Start Prediction
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
