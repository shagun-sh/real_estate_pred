import React from 'react';
import { Home, IndianRupee, TrendingUp, TrendingDown, Layers, BarChart2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

export default function Dashboard({ stats, isConnected, datasetLoaded }) {
  if (!datasetLoaded) {
    return (
      <div className="waiting-banner">
        <div className="waiting-icon">
          <Layers size={28} />
        </div>
        <h3>Dataset Not Yet Loaded</h3>
        <p>
          Please place your Kaggle CSV dataset into the <strong>dataset/</strong> directory.
          The R backend will process the dataset and populate the dashboard statistics automatically.
        </p>
        <span className="dataset-path-pill">R_PBL/dataset/*.csv</span>
      </div>
    );
  }

  const {
    totalProperties = 0,
    avgPrice = 0,
    maxPrice = 0,
    minPrice = 0,
    currency = 'INR',
    priceByLocation = [],
    priceDistribution = []
  } = stats || {};

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `${currency} ${Number(val).toLocaleString()}`;
  };

  return (
    <div>
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Home size={24} />
          </div>
          <div className="stat-content">
            <div className="label">Total Properties</div>
            <div className="value">{totalProperties.toLocaleString()}</div>
            <div className="hint">Validated records in dataset</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <IndianRupee size={24} />
          </div>
          <div className="stat-content">
            <div className="label">Average Price</div>
            <div className="value">{formatCurrency(avgPrice)}</div>
            <div className="hint">Dataset mean market value</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="label">Highest Price</div>
            <div className="value">{formatCurrency(maxPrice)}</div>
            <div className="hint">Maximum recorded price</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <div className="label">Lowest Price</div>
            <div className="value">{formatCurrency(minPrice)}</div>
            <div className="hint">Minimum recorded price</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {priceByLocation && priceByLocation.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>Average Price by Location</h2>
                <p>Top localities by average property valuation</p>
              </div>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceByLocation} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="location" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Avg Price']} />
                  <Bar dataKey="avgPrice" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {priceDistribution && priceDistribution.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>Price Range Distribution</h2>
                <p>Density of property listings across price brackets</p>
              </div>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceDistribution} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#0f2942" fill="#bfdbfe" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

