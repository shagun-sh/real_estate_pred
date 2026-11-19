import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, CheckCircle2, AlertTriangle, Sparkles, Award, 
  Activity, ArrowDown, ChevronRight, Sliders, DollarSign, 
  Percent, Calendar, HelpCircle, Layers, RefreshCw
} from 'lucide-react';
import { 
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

export default function Prediction({ schema, modelData, datasetLoaded, apiUrl }) {
  // Model selection state: random_forest (default), decision_tree, linear_regression
  const [selectedModel, setSelectedModel] = useState('random_forest');
  const [formData, setFormData] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Interactive EMI Calculator State
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [loanTenureYears, setLoanTenureYears] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);

  const resultsRef = useRef(null);

  // Pre-fill form with realistic median defaults once schema loads
  useEffect(() => {
    if (schema?.features && Object.keys(formData).length === 0) {
      const defaults = {};
      schema.features.forEach((feat) => {
        if (feat.type === 'categorical') {
          defaults[feat.name] = feat.options[0] || '';
        } else {
          defaults[feat.name] = feat.example !== undefined ? feat.example : feat.min || 0;
        }
      });
      setFormData(defaults);
    }
  }, [schema]);

  if (!datasetLoaded) {
    return (
      <div className="waiting-banner">
        <div className="waiting-icon">
          <Calculator size={28} />
        </div>
        <h3>Model Waiting for Dataset</h3>
        <p>
          Once your dataset is loaded, this module will enable you to select between
          <strong> Linear Regression</strong>, <strong>Decision Tree</strong>, and <strong>Random Forest</strong>,
          predict property valuations, and inspect model performance graphs.
        </p>
        <span className="dataset-path-pill">Awaiting: dataset/train.csv</span>
      </div>
    );
  }

  const features = schema?.features || [];
  const availableModels = [
    {
      id: 'random_forest',
      name: 'Random Forest Regression',
      shortName: 'Random Forest',
      r2: '70.67%',
      mae: '36.40 L',
      rmse: '82.90 L',
      isBest: true,
      desc: 'Ensemble of 80 decision trees with feature sub-sampling'
    },
    {
      id: 'decision_tree',
      name: 'Decision Tree Regression',
      shortName: 'Decision Tree',
      r2: '63.07%',
      mae: '47.54 L',
      rmse: '93.03 L',
      isBest: false,
      desc: 'Recursive partitioning tree (max depth: 12, min split: 15)'
    },
    {
      id: 'linear_regression',
      name: 'Linear Regression',
      shortName: 'Linear Regression',
      r2: '62.69%',
      mae: '47.74 L',
      rmse: '93.50 L',
      isBest: false,
      desc: 'Parametric ordinary least squares (OLS) baseline model'
    }
  ];

  const handleInputChange = (featureName, value) => {
    setFormData((prev) => ({
      ...prev,
      [featureName]: value
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        selectedModel: selectedModel
      };

      const response = await fetch(`${apiUrl}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result);

      // Smooth scroll down to results & evaluation section
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      setError(err.message || 'Failed to communicate with R Plumber API');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency = 'INR') => {
    if (!price) return '₹0';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Crore`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakhs`;
    return `${currency} ${Number(price).toLocaleString()}`;
  };

  // EMI Calculation Logic
  const calculateEMI = () => {
    if (!prediction?.predictedPrice) return null;
    const principal = prediction.predictedPrice * (1 - downPaymentPct / 100);
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = loanTenureYears * 12;

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const totalPayable = emi * totalMonths;
    const totalInterest = totalPayable - principal;

    return {
      principal: Math.round(principal),
      downPayment: Math.round(prediction.predictedPrice * (downPaymentPct / 100)),
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable)
    };
  };

  const emiDetails = calculateEMI();

  // Active evaluation points for Actual vs Predicted
  const evalData = prediction?.actualVsPredicted || modelData?.actualVsPredicted || [];

  return (
    <div>
      {/* 1. Header & Interactive Model Selector Bar */}
      <div className="section-card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Real Estate Price Predictor & Model Evaluation
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Select a machine learning algorithm, enter property characteristics, and evaluate prediction accuracy.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            <Sliders size={15} /> Switch Active ML Algorithm:
          </div>
        </div>

        {/* Interactive Model Toggle Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {availableModels.map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                style={{
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  background: isSelected ? '#eff6ff' : '#f8fafc',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? '#1e40af' : '#0f172a' }}>
                    {m.shortName}
                  </span>
                  {m.isBest && (
                    <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                      Best R² (70.67%)
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.65rem' }}>
                  {m.desc}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div><strong style={{ color: '#0f172a' }}>R²:</strong> {m.r2}</div>
                  <div><strong style={{ color: '#0f172a' }}>RMSE:</strong> {m.rmse}</div>
                  <div><strong style={{ color: '#0f172a' }}>MAE:</strong> {m.mae}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Property Input Form */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h2>Property Specifications</h2>
            <p>Input real estate attributes to generate an instant prediction using the selected model</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, background: '#eff6ff', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
            Inference Engine: {availableModels.find(m => m.id === selectedModel)?.name}
          </span>
        </div>

        <form onSubmit={handlePredict}>
          <div className="form-grid">
            {features.map((feat) => (
              <div key={feat.name} className="form-group">
                <label className="form-label">
                  {feat.label || feat.name} {feat.unit ? `(${feat.unit})` : ''}
                </label>
                {feat.type === 'categorical' ? (
                  <select
                    className="form-select"
                    required
                    value={formData[feat.name] !== undefined ? formData[feat.name] : ''}
                    onChange={(e) => handleInputChange(feat.name, e.target.value)}
                  >
                    <option value="">Select {feat.label || feat.name}...</option>
                    {(feat.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {feat.name === 'Parking' || feat.name === 'Lift_Available' || feat.name === 'Gated_Community'
                          ? opt === '1' ? 'Yes (Available)' : 'No (None)'
                          : opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    step={feat.step || 'any'}
                    min={feat.min !== undefined ? feat.min : ''}
                    max={feat.max !== undefined ? feat.max : ''}
                    placeholder={`e.g. ${feat.example || feat.min || ''}`}
                    className="form-input"
                    required
                    value={formData[feat.name] !== undefined ? formData[feat.name] : ''}
                    onChange={(e) => handleInputChange(feat.name, parseFloat(e.target.value) || '')}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
              <Sparkles size={18} />
              {loading ? 'Evaluating Model in R...' : `Predict Price with ${availableModels.find(m => m.id === selectedModel)?.shortName}`}
            </button>
            {loading && <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Executing inference via R Plumber...</span>}
          </div>
        </form>

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#991b1b', fontSize: '0.875rem' }}>
            <AlertTriangle size={20} />
            <div>
              <strong>Prediction Error:</strong> {error}
            </div>
          </div>
        )}
      </div>

      {/* 3. Prediction Result & Integrated Performance Graph */}
      {prediction && (
        <div ref={resultsRef} style={{ marginTop: '2rem' }}>
          {/* Main Price Output Card */}
          <div className="result-card">
            <span className="result-badge">
              Predicted Valuation &bull; {prediction.modelName}
            </span>
            <div className="result-price">
              {formatPrice(prediction.predictedPrice, prediction.currency)}
            </div>
            <div className="result-meta">
              Valuation: <strong>₹{prediction.predictedLakhs} Lakhs</strong> &bull; Model Test R²: <strong>{(prediction.rSquared * 100).toFixed(2)}%</strong> &bull; MAE: <strong>{prediction.mae || 36.4} Lakhs</strong>
            </div>

            {/* Input Summary Pill Badges */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.18)', width: '100%', maxWidth: '750px' }}>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem', opacity: 0.85 }}>
                Entered Property Parameters
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {Object.entries(formData).map(([k, v]) => (
                  <span key={k} style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                    <strong>{k.replace(/_/g, ' ')}:</strong> {v === 1 ? 'Yes' : v === 0 ? 'No' : v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Model Performance & Actual vs Predicted Graph */}
          <div className="section-card" style={{ marginTop: '1.75rem' }}>
            <div className="section-header">
              <div>
                <h2>Model Performance & Validation: {prediction.modelName}</h2>
                <p>Comparison of actual test observations against predictions generated by {prediction.modelName}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge-best" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                  Model R²: {(prediction.rSquared * 100).toFixed(2)}%
                </span>
                <span className="badge-best" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>
                  RMSE: {prediction.rmse} Lakhs
                </span>
              </div>
            </div>

            <div style={{ width: '100%', height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={evalData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="actual" name="Actual Price (Lakhs)" tick={{ fontSize: 11, fill: '#64748b' }} unit=" L" />
                  <YAxis dataKey="predicted" name="Predicted Price (Lakhs)" tick={{ fontSize: 11, fill: '#64748b' }} unit=" L" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(val, name) => [`₹${val} Lakhs`, name]} />
                  <Scatter name="Test Observations" dataKey="predicted" fill="#2563eb" opacity={0.65} />
                  <Line type="monotone" dataKey="ideal" stroke="#ef4444" strokeWidth={2} dot={false} name="Ideal Fit (y = x)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', marginTop: '0.5rem' }}>
              Points closer to the red dashed line indicate higher prediction precision. Generated on held-out test data in R.
            </div>
          </div>

          {/* 4. Interactive Feature 1: EMI & Mortgage Affordability Calculator */}
          {emiDetails && (
            <div className="section-card" style={{ marginTop: '1.75rem' }}>
              <div className="section-header">
                <div>
                  <h2>Interactive EMI & Mortgage Affordability Calculator</h2>
                  <p>Calculate monthly installments and financing breakdown based on the predicted property valuation</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    Down Payment: {downPaymentPct}% ({formatPrice(emiDetails.downPayment)})
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                    <span>10%</span>
                    <span>20% (Standard)</span>
                    <span>50%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Loan Tenure: {loanTenureYears} Years ({loanTenureYears * 12} Months)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={loanTenureYears}
                    onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                    <span>5 Yrs</span>
                    <span>20 Yrs</span>
                    <span>30 Yrs</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Annual Interest Rate: {interestRate}%
                  </label>
                  <input
                    type="range"
                    min="7.0"
                    max="12.0"
                    step="0.25"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                    <span>7.0%</span>
                    <span>8.5% (Avg Bank)</span>
                    <span>12.0%</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Estimated Monthly EMI</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                    ₹{emiDetails.emi.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/month</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Loan Principal Amount</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                    {formatPrice(emiDetails.principal)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Interest Payable</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#dc2626', marginTop: '0.2rem' }}>
                    {formatPrice(emiDetails.totalInterest)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Financing Amount</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f2942', marginTop: '0.2rem' }}>
                    {formatPrice(emiDetails.totalPayable)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
