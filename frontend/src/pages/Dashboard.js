import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function Dashboard() {
  const [tab, setTab] = useState('keywords');
  const [keywords, setKeywords] = useState([]);
  const [leads, setLeads] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [freelinkUrl, setFreelinkUrl] = useState('');
  const [freelinkName, setFreelinkName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadKeywords();
    loadLeads();
  }, []);

  const loadKeywords = async () => {
    try {
      const res = await axios.get('/api/keywords');
      setKeywords(res.data);
    } catch (err) {
      setError('Fehler beim Laden der Keywords');
    }
  };

  const loadLeads = async () => {
    try {
      const res = await axios.get('/api/leads');
      setLeads(res.data);
    } catch (err) {
      setError('Fehler beim Laden der Leads');
    }
  };

  const addKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim() || !freelinkUrl.trim()) {
      setError('Bitte alle Felder ausfüllen');
      return;
    }

    try {
      await axios.post('/api/keywords', {
        keyword: newKeyword,
        freebie_link: freelinkUrl,
        freebie_name: freelinkName
      });
      setMessage('Keyword erfolgreich hinzugefügt! ✅');
      setNewKeyword('');
      setFreelinkUrl('');
      setFreelinkName('');
      setError('');
      loadKeywords();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Fehler beim Hinzufügen des Keywords. Existiert es bereits?');
    }
  };

  const deleteKeyword = async (id) => {
    if (window.confirm('Wirklich löschen?')) {
      try {
        await axios.delete(`/api/keywords/${id}`);
        loadKeywords();
        setMessage('Keyword gelöscht ✅');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setError('Fehler beim Löschen');
      }
    }
  };

  const exportLeads = async () => {
    try {
      const res = await axios.get('/api/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Fehler beim Export');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>📱 Instagram Freebie Bot</h1>
        <p>Verwalte Keywords und sammle Leads mit Double Opt-In</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab-btn ${tab === 'keywords' ? 'active' : ''}`}
          onClick={() => setTab('keywords')}
        >
          🔑 Keywords ({keywords.length})
        </button>
        <button
          className={`tab-btn ${tab === 'leads' ? 'active' : ''}`}
          onClick={() => setTab('leads')}
        >
          📧 Leads ({leads.length})
        </button>
      </div>

      {/* KEYWORDS TAB */}
      {tab === 'keywords' && (
        <div>
          <h2>Keywords & Freebies</h2>
          <form onSubmit={addKeyword} style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <div className="form-group">
              <label>Keyword (z.B. "FREEBIE", "COACHING", "PDF")</label>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="FREEBIE"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label>Freebie-Name</label>
              <input
                type="text"
                value={freelinkName}
                onChange={(e) => setFreelinkName(e.target.value)}
                placeholder="z.B. Mein E-Book"
              />
            </div>

            <div className="form-group">
              <label>Freebie-Link (URL oder Drive-Link)</label>
              <input
                type="url"
                value={freelinkUrl}
                onChange={(e) => setFreelinkUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <button type="submit">➕ Keyword hinzufügen</button>
          </form>

          <h3>Aktive Keywords:</h3>
          {keywords.length === 0 ? (
            <p style={{ color: '#999' }}>Noch keine Keywords. Füge eines oben hinzu!</p>
          ) : (
            keywords.map((kw) => (
              <div key={kw.id} className="keyword-item">
                <div>
                  <strong>"{kw.keyword}"</strong> → {kw.freebie_name}
                  <br />
                  <small style={{ color: '#666' }}>Link: {kw.freebie_link}</small>
                </div>
                <button
                  className="danger"
                  onClick={() => deleteKeyword(kw.id)}
                >
                  🗑️ Löschen
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* LEADS TAB */}
      {tab === 'leads' && (
        <div>
          <h2>Gesammelte Leads</h2>
          <button onClick={exportLeads} style={{ marginBottom: '20px', background: '#27ae60' }}>
            📥 Als CSV exportieren
          </button>

          {leads.length === 0 ? (
            <p style={{ color: '#999' }}>Noch keine Leads. Teile dein Instagram Codewort!</p>
          ) : (
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Adresse</th>
                  <th>Stadt</th>
                  <th>PLZ</th>
                  <th>Keyword</th>
                  <th>Status</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.address}</td>
                    <td>{lead.city}</td>
                    <td>{lead.zip_code}</td>
                    <td>{lead.keyword_used}</td>
                    <td className={`status-${lead.status}`}>{lead.status === 'confirmed' ? '✅' : '⏳'}</td>
                    <td>{new Date(lead.optin2_date || lead.created_at).toLocaleDateString('de-DE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>📋 Setup-Anleitung:</h3>
        <ol>
          <li>Erstelle eine <strong>Instagram Business App</strong> in der Meta Developer Console</li>
          <li>Generiere einen <strong>Access Token</strong> und <strong>Verify Token</strong></li>
          <li>Setze diese in der <strong>.env</strong> Datei ein</li>
          <li>Registriere den Webhook: <code>https://deine-domain.com/api/instagram/webhook</code></li>
          <li>Nutzer schreiben dein Codewort → bekommen Formular-Link → Double Opt-In → Freebie!</li>
        </ol>
      </div>
    </div>
  );
}

export default Dashboard;
