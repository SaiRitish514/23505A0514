import React, { useState } from 'react';
import './App.css';
function App() {
  const [inputs, setInputs] = useState([{ url: '', validity: '', shortcode: '' }]);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);

  const handleChange = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  const addField = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, { url: '', validity: '', shortcode: '' }]);
    }
  };

  const handleSubmit = async () => {
    const res = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (!input.url) {
        res.push({ original: '', error: 'URL is required' });
        continue;
      }

      try {
        const response = await fetch('http://localhost:5000/shorturls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: input.url,
            validity: input.validity ? Number(input.validity) : undefined,
            shortcode: input.shortcode || undefined
          })
        });

        const data = await response.json();
        if (response.ok) {
          res.push({ original: input.url, ...data });
        } else {
          res.push({ original: input.url, error: data.error });
        }
      } catch (err) {
        res.push({ original: input.url, error: 'Network Error' });
      }
    }

    setResults(res);
  };

  const fetchStats = async (code) => {
    try {
      const response = await fetch(`http://localhost:5000/shorturls/${code}`);
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error fetching stats');
    }
  };
 

  return (
    <div className="container">
  <h2>URL Shortener</h2>

  {inputs.map((input, i) => (
    <div key={i} className="input-group">
      <input
        type="text"
        placeholder="Enter URL"
        value={input.url}
        onChange={(e) => handleChange(i, 'url', e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Validity in minutes (optional)"
        value={input.validity}
        onChange={(e) => handleChange(i, 'validity', e.target.value)}
      />
      <input
        type="text"
        placeholder="Shortcode (optional)"
        value={input.shortcode}
        onChange={(e) => handleChange(i, 'shortcode', e.target.value)}
      />
    </div>
  ))}

      <button onClick={addField} disabled={inputs.length >= 5}>Add More</button>
      <button onClick={handleSubmit}>Shorten</button>

      <h3>Results</h3>
      {results.map((r, i) => (
        <div key={i}>
          {r.error ? (
            <div style={{ color: 'red' }}>Error: {r.error}</div>
          ) : (
            <div>
              {r.original} =&gt; <a href={r.shortLink} target="_blank" rel="noreferrer">{r.shortLink}</a> (expires: {new Date(r.expiry).toLocaleString()})
              <button onClick={() => fetchStats(r.shortLink.split('/').pop())}>View Stats</button>
            </div>
          )}
        </div>
      ))}

      {stats && (
  <div style={{ marginTop: '20px' }}>
    <h3>Stats</h3>
    <p><strong>Original URL:</strong> {stats.url}</p>
    <p><strong>Shortened URL:</strong> <a href={`http://localhost:5000/${stats.shortcode}`} target="_blank" rel="noreferrer">http://localhost:5000/{stats.shortcode}</a></p>
    <p><strong>Created:</strong> {new Date(stats.created).toLocaleString()}</p>
    <p><strong>Expiry:</strong> {new Date(stats.expiry).toLocaleString()}</p>
    <p><strong>Total Clicks:</strong> {stats.totalClicks}</p>
    <ul>
      {stats.clicks.map((click, index) => (
        <li key={index}>
          {new Date(click.timestamp).toLocaleString()} - {click.referrer} - {click.location}
        </li>
      ))}
    </ul>
  </div>
)}

    </div>
  );
}

export default App;
