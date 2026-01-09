import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
        EventFlow System
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
        🎉 React is working perfectly! 🎉
      </p>
      <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
        Backend: http://localhost:5000 | Frontend: http://localhost:3000
      </p>
      
      <div style={{ 
        background: 'white', 
        color: '#333', 
        padding: '30px', 
        borderRadius: '10px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{ color: '#667eea', marginBottom: '20px' }}>
          Next Steps:
        </h2>
        <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
          <li>✅ Backend API is ready</li>
          <li>✅ React frontend is running</li>
          <li>🔲 Create Login/Register pages</li>
          <li>🔲 Create Events listing</li>
          <li>🔲 Create Event detail page</li>
          <li>🔲 Create Admin dashboard</li>
          <li>🔲 Integrate Stripe payments</li>
        </ul>
      </div>
      
      <p style={{ marginTop: '30px', fontSize: '0.9rem', opacity: '0.8' }}>
        We'll build the complete UI step by step using Material UI
      </p>
    </div>
  );
}

export default App;