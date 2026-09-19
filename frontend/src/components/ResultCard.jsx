import React from 'react';
import jsPDF from 'jspdf';

function ResultCard({ result }) {
  let label = result.final_prediction;


  if (label === '0' || label === 'No PH') {
    label = 'Low Chances of PH';
  } else if (label === '1' || label === 'PH detected') {
    if (result.confidence > 0.8) label = "High Chances of PH";
    else if (result.confidence > 0.6) label = "Moderate Chances of PH";
    else label = "Possible Indications of PH";
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    let y = margin;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.getHeight();

    const addText = (text, isHeader = false, isBold = false) => {
      const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
      
      if (isHeader) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        y += lineHeight;
      } else if (isBold) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
      }

      const lines = doc.splitTextToSize(text, maxWidth);
      
      for (let i = 0; i < lines.length; i++) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(lines[i], margin, y);
        y += lineHeight;
      }
      y += 2; 
    };

    addText('Patient Case Summary', true);
    y += 5; 

    addText('Input Symptoms / Text:', false, true);
    addText(result.input_text);

    if (result.extracted_keywords && result.extracted_keywords.length > 0) {
      y += 5;
      addText('Detected Keywords:', false, true);
      addText(result.extracted_keywords.join(', '));
    }

    y += 5;
    addText('Predicted Condition:', false, true);
    addText(label);

    y += 5;
    addText('Confidence Score:', false, true);
    addText(`${(result.confidence * 100).toFixed(0)}%`);

    if (result.related_conditions && result.related_conditions.length > 0) {
      y += 5;
      addText('Other Possible Conditions:', false, true);
      result.related_conditions.forEach(cond => {
        addText(`- ${cond.disease} (${cond.probability})`);
      });
    }

    y += 5;
    addText('Risk Level:', false, true);
    addText(result.risk_level || 'Not determined');

    y += 5;
    addText('Medical Insight:', false, true);
    addText(result.medical_insight || 'No specific insights currently available.');

    if (result.next_steps && result.next_steps.length > 0) {
      y += 5;
      addText('Suggested Actions:', false, true);
      result.next_steps.forEach(step => {
        addText(`- ${step}`);
      });
    }

    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    const disclaimer = "Disclaimer: This prediction is generated using machine learning models and should not be considered a medical diagnosis. Please consult a qualified healthcare professional for proper medical advice.";
    
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const dLines = doc.splitTextToSize(disclaimer, maxWidth);
    for (let i = 0; i < dLines.length; i++) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(dLines[i], margin, y);
        y += lineHeight;
    }

    doc.save('patient_case_summary.pdf');
  };

  return (
    <div className="card mt-4 shadow-lg border-0 slide-up" style={{ borderRadius: '15px' }}>
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
        <h5 className="mb-0 fw-bold">Patient Case Summary</h5>
        <button className="btn btn-light btn-sm animate-hover" onClick={handleDownloadPDF}>
          📥 Download PDF
        </button>
      </div>
      <div className="card-body">
        
        <div className="row mb-3">
          <div className="col-md-12">
            <h6 className="text-secondary border-bottom pb-2">Patient Input Summary</h6>
            <div className="p-3 bg-light rounded">
              <p className="mb-0" style={{whiteSpace: 'pre-wrap'}}>{result.input_text}</p>
            </div>
          </div>
        </div>

        {result.extracted_keywords && result.extracted_keywords.length > 0 && (
          <div className="row mb-3">
            <div className="col-md-12">
              <h6 className="text-secondary">Extracted Key Medical Terms</h6>
              <div>
                {result.extracted_keywords.map((kw, idx) => (
                  <span key={idx} className="badge bg-secondary me-2 p-2 mb-1">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="card h-100 border-success text-success bg-opacity-10 py-2">
              <div className="card-body text-center">
                <h6 className="card-title text-muted">Predicted Disease</h6>
                <h4 className="fw-bold">{label}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-6">
             <div className="card h-100 border-info text-info bg-opacity-10 py-2">
              <div className="card-body text-center">
                <h6 className="card-title text-muted">Confidence Score</h6>
                <h4 className="fw-bold">{(result.confidence * 100).toFixed(0)}%</h4>
              </div>
            </div>
          </div>
        </div>

        {result.risk_level && (
          <div className="row mb-3">
              <div className="col-md-12">
                  <div className={`alert ${result.risk_level === 'High' ? 'alert-danger' : result.risk_level.includes('Moderate') ? 'alert-warning' : 'alert-success'}`}>
                      <strong>Risk Level Indicator: </strong> {result.risk_level}
                  </div>
              </div>
          </div>
        )}

        {result.medical_insight && (
            <div className="row mb-3">
                <div className="col-md-12">
                    <h6 className="text-secondary border-bottom pb-2">Medical Insight</h6>
                    <p>{result.medical_insight}</p>
                </div>
            </div>
        )}

        {result.related_conditions && result.related_conditions.length > 0 && (
          <div className="row mb-3">
            <div className="col-md-12">
              <h6 className="text-secondary border-bottom pb-2">Possible Related Conditions</h6>
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Condition</th>
                    <th>Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {result.related_conditions.map((cond, idx) => (
                    <tr key={idx}>
                      <td>{cond.disease}</td>
                      <td>{cond.probability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {result.next_steps && result.next_steps.length > 0 && (
          <div className="row mb-3">
            <div className="col-md-12">
               <h6 className="text-secondary border-bottom pb-2">Recommended Next Steps</h6>
               <ul className="list-group list-group-flush">
                  {result.next_steps.map((step, idx) => (
                      <li key={idx} className="list-group-item bg-transparent border-0 px-0 py-1">
                          <span className="text-primary me-2">➔</span>
                          {step}
                      </li>
                  ))}
               </ul>
            </div>
          </div>
        )}

        <hr className="my-4"/>
        <div className="text-center text-muted small">
          <em>Disclaimer: This prediction is generated using machine learning models and should not be considered a medical diagnosis. Please consult a qualified healthcare professional for proper medical advice.</em>
        </div>

      </div>
    </div>
  );
}

export default ResultCard;