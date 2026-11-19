import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calculator, BarChart3, Building } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Prediction from './components/Prediction';
import Analysis from './components/Analysis';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('predict'); // Default to Price Prediction as requested!
  const [apiConnected, setApiConnected] = useState(false);
  const [datasetLoaded, setDatasetLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [schema, setSchema] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [modelData, setModelData] = useState(null);

  const fetchAppData = async () => {
    try {
      const statusRes = await fetch(`${API_BASE_URL}/api/status`).catch(() => null);
      if (statusRes && statusRes.ok) {
        setApiConnected(true);
        const statusJson = await statusRes.json();
        setDatasetLoaded(statusJson.datasetLoaded || false);

        if (statusJson.datasetLoaded) {
          const [statsRes, schemaRes, analysisRes, modelsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/summary`).catch(() => null),
            fetch(`${API_BASE_URL}/api/schema`).catch(() => null),
            fetch(`${API_BASE_URL}/api/analysis`).catch(() => null),
            fetch(`${API_BASE_URL}/api/models`).catch(() => null)
          ]);

          if (statsRes && statsRes.ok) setStats(await statsRes.json());
          if (schemaRes && schemaRes.ok) setSchema(await schemaRes.json());
          if (analysisRes && analysisRes.ok) setAnalysisData(await analysisRes.json());
          if (modelsRes && modelsRes.ok) setModelData(await modelsRes.json());
        }
      } else {
        setApiConnected(false);
      }
    } catch (e) {
      console.error('API connection check:', e);
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
    const interval = setInterval(fetchAppData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <Building size={22} />
            </div>
            <div className="brand-text">
              <h1>Real Estate Price Predictor & Analytics</h1>
              <p>College PBL Project &bull; Machine Learning with R & React</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <nav className="nav-tabs">
              <button
                className={`nav-tab-btn ${activeTab === 'predict' ? 'active' : ''}`}
                onClick={() => setActiveTab('predict')}
              >
                <Calculator size={16} /> Price Prediction
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={16} /> Market Dashboard
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('analysis')}
              >
                <BarChart3 size={16} /> Data Analysis
              </button>
            </nav>

            <div className={`status-pill ${apiConnected ? 'status-online' : 'status-waiting'}`}>
              <div className="dot"></div>
              {apiConnected
                ? datasetLoaded
                  ? 'R API Connected'
                  : 'Awaiting Dataset'
                : 'R API Offline'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-wrapper">
        {activeTab === 'predict' && (
          <Prediction
            schema={schema}
            modelData={modelData}
            datasetLoaded={datasetLoaded}
            apiUrl={API_BASE_URL}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            isConnected={apiConnected}
            datasetLoaded={datasetLoaded}
          />
        )}

        {activeTab === 'analysis' && (
          <Analysis
            analysisData={analysisData}
            datasetLoaded={datasetLoaded}
            apiUrl={API_BASE_URL}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Real Estate Price Prediction and Analysis &bull; Built with R, Plumber, and React.js &bull; Academic PBL Project
        </p>
      </footer>
    </div>
  );
}
