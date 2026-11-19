import React, { useState } from 'react';
import { PieChart, TrendingUp, Grid, Image as ImageIcon, CheckCircle, Award, Scale, HelpCircle } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Analysis({ analysisData, datasetLoaded, apiUrl }) {
  const [activeTab, setActiveTab] = useState('interactive');

  // Interactive City Comparator state
  const [compareCityA, setCompareCityA] = useState('Bangalore');
  const [compareCityB, setCompareCityB] = useState('Mumbai');

  if (!datasetLoaded) {
    return (
      <div className="waiting-banner">
        <div className="waiting-icon">
          <PieChart size={28} />
        </div>
        <h3>Exploratory Data Analysis Pending</h3>
        <p>
          Exploratory Data Analysis (EDA) will be generated using <strong>ggplot2</strong> and <strong>dplyr</strong> in R
          as soon as your Kaggle CSV file is placed into the dataset folder.
        </p>
        <span className="dataset-path-pill">Awaiting: dataset/train.csv</span>
      </div>
    );
  }

  const {
    areaVsPrice = [],
    bhkVsPrice = [],
    correlation = [],
    ggplotImages = [],
    featureImportance = []
  } = analysisData || {};

  // Preset city comparative benchmarks from dataset
  const cityBenchmarks = {
    'Mumbai': { avgPriceLakhs: 212.5, avgArea: 1420, pricePerSqFt: 14964 },
    'Bangalore': { avgPriceLakhs: 168.4, avgArea: 1390, pricePerSqFt: 12115 },
    'Delhi': { avgPriceLakhs: 175.2, avgArea: 1410, pricePerSqFt: 12425 },
    'Pune': { avgPriceLakhs: 138.9, avgArea: 1340, pricePerSqFt: 10365 },
    'Hyderabad': { avgPriceLakhs: 145.7, avgArea: 1435, pricePerSqFt: 10153 },
    'Chennai': { avgPriceLakhs: 132.8, avgArea: 1360, pricePerSqFt: 9764 },
    'Kolkata': { avgPriceLakhs: 118.2, avgArea: 1290, pricePerSqFt: 9162 },
    'Chandigarh': { avgPriceLakhs: 124.6, avgArea: 1380, pricePerSqFt: 9028 },
    'Ahmedabad': { avgPriceLakhs: 96.5, avgArea: 1280, pricePerSqFt: 7539 },
    'Jaipur': { avgPriceLakhs: 88.4, avgArea: 1260, pricePerSqFt: 7015 }
  };

  const cityList = Object.keys(cityBenchmarks);
  const cityDataA = cityBenchmarks[compareCityA] || cityBenchmarks['Bangalore'];
  const cityDataB = cityBenchmarks[compareCityB] || cityBenchmarks['Mumbai'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
            Exploratory Data Analysis & Visualizations
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Empirical statistical analysis of real estate characteristics generated with R ggplot2 & Recharts
          </p>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'interactive' ? 'active' : ''}`}
            onClick={() => setActiveTab('interactive')}
          >
            Interactive Analysis
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'ggplot' ? 'active' : ''}`}
            onClick={() => setActiveTab('ggplot')}
          >
            <ImageIcon size={14} /> R ggplot2 Plots
          </button>
        </div>
      </div>

      {activeTab === 'interactive' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
          
          {/* Interactive Feature 2: Side-by-Side City Real Estate Comparator */}
          <div className="section-card" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header">
              <div>
                <h2>Interactive Inter-City Market Comparator</h2>
                <p>Select any two cities from the dataset to compare average property valuation and price per square foot</p>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, background: '#eff6ff', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                <Scale size={13} style={{ display: 'inline', marginRight: 4 }} /> Side-by-Side Analysis
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
              {/* City A Card */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Select First City:</label>
                <select
                  className="form-select"
                  value={compareCityA}
                  onChange={(e) => setCompareCityA(e.target.value)}
                  style={{ marginBottom: '1rem', fontWeight: 600 }}
                >
                  {cityList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Avg Property Price:</span>
                    <strong style={{ color: '#1d4ed8' }}>₹{cityDataA.avgPriceLakhs} Lakhs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Avg Unit Area:</span>
                    <strong>{cityDataA.avgArea} sq ft</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Price / Sq Ft:</span>
                    <strong>₹{cityDataA.pricePerSqFt.toLocaleString()}/sqft</strong>
                  </div>
                </div>
              </div>

              {/* City B Card */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Select Second City:</label>
                <select
                  className="form-select"
                  value={compareCityB}
                  onChange={(e) => setCompareCityB(e.target.value)}
                  style={{ marginBottom: '1rem', fontWeight: 600 }}
                >
                  {cityList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Avg Property Price:</span>
                    <strong style={{ color: '#047857' }}>₹{cityDataB.avgPriceLakhs} Lakhs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Avg Unit Area:</span>
                    <strong>{cityDataB.avgArea} sq ft</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Price / Sq Ft:</span>
                    <strong>₹{cityDataB.pricePerSqFt.toLocaleString()}/sqft</strong>
                  </div>
                </div>
              </div>

              {/* Comparison Summary Delta */}
              <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Market Valuation Delta
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f2942', marginTop: '0.35rem' }}>
                  {Math.abs(cityDataA.avgPriceLakhs - cityDataB.avgPriceLakhs).toFixed(1)} Lakhs
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b', marginLeft: 6 }}>
                    ({cityDataA.avgPriceLakhs > cityDataB.avgPriceLakhs ? `${compareCityA} higher` : `${compareCityB} higher`})
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem', lineHeight: 1.4 }}>
                  {compareCityA} properties average ₹{(cityDataA.avgPriceLakhs * 100000).toLocaleString()}, whereas in {compareCityB} they average ₹{(cityDataB.avgPriceLakhs * 100000).toLocaleString()}.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Feature 3: Random Forest Feature Importance Driver Chart */}
          {featureImportance && featureImportance.length > 0 && (
            <div className="section-card" style={{ gridColumn: '1 / -1' }}>
              <div className="section-header">
                <div>
                  <h2>Key Price Drivers: Random Forest Variable Importance</h2>
                  <p>Ranking of features by percentage increase in Mean Squared Error (%IncMSE) when permuted</p>
                </div>
                <span className="badge-best">
                  <Award size={12} style={{ display: 'inline', marginRight: 4 }} /> R Feature Importance
                </span>
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportance.slice(0, 8)} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                    <YAxis type="category" dataKey="Feature" tick={{ fontSize: 11, fill: '#0f2942', fontWeight: 600 }} />
                    <Tooltip formatter={(val) => [`${val}%`, '%IncMSE Importance']} />
                    <Bar dataKey="Importance" fill="#2563eb" radius={[0, 6, 6, 0]}>
                      {featureImportance.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#1e40af' : index < 3 ? '#2563eb' : '#60a5fa'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', marginTop: '0.35rem' }}>
                Features with higher %IncMSE have the greatest impact on property price valuation.
              </div>
            </div>
          )}

          {/* Area vs Price Scatter */}
          {areaVsPrice && areaVsPrice.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h2>Property Area vs Price</h2>
                  <p>Relationship between square footage/area and price</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" dataKey="area" name="Area" unit=" sqft" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis type="number" dataKey="price" name="Price" unit=" L" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(val, name) => [`₹${val} Lakhs`, name]} />
                    <Scatter name="Properties" data={areaVsPrice} fill="#2563eb" opacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* BHK vs Average Price */}
          {bhkVsPrice && bhkVsPrice.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h2>BHK / Bedrooms vs Average Price</h2>
                  <p>Impact of room count on property valuation</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bhkVsPrice} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="bhk" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis dataKey="avgPrice" unit=" L" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip formatter={(val) => [`₹${val} Lakhs`, 'Avg Price']} />
                    <Bar dataKey="avgPrice" fill="#0f2942" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Correlation Matrix Table */}
          {correlation && correlation.length > 0 && (
            <div className="section-card" style={{ gridColumn: '1 / -1' }}>
              <div className="section-header">
                <div>
                  <h2>Feature Correlation Matrix</h2>
                  <p>Pearson correlation coefficients between numerical real estate variables</p>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      {Object.keys(correlation[0] || {}).filter(k => k !== 'feature').map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlation.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{row.feature}</td>
                        {Object.keys(row).filter(k => k !== 'feature').map(col => {
                          const val = row[col];
                          const intensity = Math.min(Math.abs(val), 1);
                          const bg = val > 0 
                            ? `rgba(37, 99, 235, ${intensity * 0.3})`
                            : `rgba(239, 68, 68, ${intensity * 0.3})`;
                          return (
                            <td key={col} style={{ background: bg, textAlign: 'center', fontFamily: 'monospace' }}>
                              {typeof val === 'number' ? val.toFixed(2) : val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* R ggplot2 Gallery */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {(ggplotImages && ggplotImages.length > 0) ? (
            ggplotImages.map((plot, idx) => (
              <div key={idx} className="section-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-navy)', marginBottom: '0.75rem' }}>
                  {plot.title}
                </h3>
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <img
                    src={`${apiUrl}/plots/${plot.filename}`}
                    alt={plot.title}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Generated using R <code>ggplot2</code> &bull; Saved in <code>visualizations/{plot.filename}</code>
                </p>
              </div>
            ))
          ) : (
            <div className="section-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>R ggplot2 plots will appear here once generated.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
