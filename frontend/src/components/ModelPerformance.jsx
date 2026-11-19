import React from 'react';
import { Award, CheckCircle, TrendingUp, Cpu, Activity } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';

export default function ModelPerformance({ modelData, datasetLoaded, apiUrl }) {
  if (!datasetLoaded) {
    return (
      <div className="waiting-banner">
        <div className="waiting-icon">
          <Cpu size={28} />
        </div>
        <h3>Model Benchmarks Pending</h3>
        <p>
          Once your dataset is provided, the R training script will fit and cross-evaluate
          <strong> Linear Regression</strong>, <strong>Decision Tree Regression</strong>, and
          <strong> Random Forest Regression</strong> with MAE, RMSE, and R² scores.
        </p>
        <span className="dataset-path-pill">Awaiting: dataset/*.csv</span>
      </div>
    );
  }

  const {
    models = [],
    bestModel = '',
    actualVsPredicted = [],
    testSampleSize = 0
  } = modelData || {};

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <div>
            <h2>Machine Learning Model Evaluation</h2>
            <p>Comparative performance analysis of trained algorithms on held-out test data</p>
          </div>
          {bestModel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', color: '#047857', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '0.82rem', fontWeight: 700 }}>
              <Award size={18} />
              Best Model: {bestModel}
            </div>
          )}
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>R-Squared (R²)</th>
                <th>RMSE (Root Mean Sq Error)</th>
                <th>MAE (Mean Absolute Error)</th>
                <th>Status / Selection</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => {
                const isBest = m.name === bestModel;
                return (
                  <tr key={m.name} style={isBest ? { backgroundColor: '#f0fdf4' } : {}}>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={16} color={isBest ? '#16a34a' : '#64748b'} />
                      {m.name}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                      {(m.rSquared * 100).toFixed(2)}%
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {Number(m.rmse).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {Number(m.mae).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      {isBest ? (
                        <span className="badge-best">
                          <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                          Selected for Inference
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {actualVsPredicted && actualVsPredicted.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2>Actual vs. Predicted Property Prices</h2>
              <p>Test set evaluation points compared with the ideal 45-degree line of perfect prediction</p>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Test samples: {testSampleSize}
            </span>
          </div>

          <div style={{ width: '100%', height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={actualVsPredicted} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="actual" name="Actual Price" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="predicted" name="Predicted Price" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Test Observations" dataKey="predicted" fill="#2563eb" opacity={0.65} />
                <Line type="monotone" dataKey="ideal" stroke="#ef4444" strokeWidth={2} dot={false} name="Ideal Fit (y = x)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

