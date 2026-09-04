import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function OptInForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip_code: '',
    phone: ''
  });
  const [isChecked, setIsChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [freelink, setFreelink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const keyword = urlParams.get('keyword');
  const instagram_id = urlParams.get('ig');

  useEffect(() => {
    if (keyword) {
      // Freebie-Link abrufen
      axios.get(`/api/keywords?kw=${keyword}`).catch(() => {});
    }
  }, [keyword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isChecked) {
      setError('Bitte akzeptiere die Datenschutzbedingungen ✓');
      return;
    }

    if (!formData.name || !formData.email || !formData.address) {
      setError('Bitte alle erforderlichen Felder ausfüllen!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/form-submit', {
        ...formData,
        keyword,
        instagram_id
      });

      setFreelink(res.data.freebie_link);
      setSubmitted(true);
      setError('');
    } catch (err) {
      setError('Fehler beim Speichern. Bitte später versuchen!');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
        <h1>Herzlichen Glückwunsch!</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>
          Deine Daten wurden gespeichert. Hier ist dein Freebie:
        </p>

        <a
          href={freelink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '15px 40px',
            background: '#27ae60',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginBottom: '30px'
          }}
        >
          📥 Freebie herunterladen
        </a>

        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          Danke dass du dich angemeldet hast! 💚
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '500px' }}>
      <div className="header">
        <h1>🎁 Dein Freebie wartet!</h1>
        <p>Double Opt-In Formular (Deine Daten sind sicher)</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>👤 Vorname & Nachname *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Max Mustermann"
            required
          />
        </div>

        <div className="form-group">
          <label>📧 Email-Adresse *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="deine@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label>🏠 Straße & Hausnummer *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Musterstraße 123"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>🏙️ Stadt</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Berlin"
            />
          </div>

          <div className="form-group">
            <label>📮 Postleitzahl</label>
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              placeholder="10115"
            />
          </div>
        </div>

        <div className="form-group">
          <label>☎️ Telefon (optional)</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+49 123 456789"
          />
        </div>

        {/* DOUBLE OPT-IN CHECKBOX */}
        <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', margin: 0 }}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <span style={{ color: '#333' }}>
              <strong>✓ Ich akzeptiere die Datenschutzerklärung</strong><br />
              <small style={{ color: '#666' }}>
                Ich bestätige, dass ich die oben angegebenen Daten zur Versendung meines Freebies freigebe. Ich kann mich jederzeit abmelden.
              </small>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: isChecked ? '#667eea' : '#ccc',
            cursor: isChecked ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? '⏳ Wird verarbeitet...' : '🚀 Freebie freischalten!'}
        </button>

        <p style={{ textAlign: 'center', color: '#999', fontSize: '0.85rem', marginTop: '15px' }}>
          * Erforderliche Felder
        </p>
      </form>
    </div>
  );
}

export default OptInForm;
