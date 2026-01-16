import React, { useState } from 'react';
import { MessageSquare, X, Mic, Send } from 'lucide-react';

const AIChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
           position: 'fixed', bottom: '25px', right: '25px', 
           width: '60px', height: '60px', background: '#2e7d32', 
           borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
           boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 9999 
        }}
      >
        {isOpen ? <X color="white" /> : <MessageSquare color="white" />}
      </div>

      {isOpen && (
        <div style={{ 
           position: 'fixed', bottom: '100px', right: '25px', 
           width: '320px', height: '450px', background: 'white', 
           borderRadius: '16px', boxShadow: '0 5px 25px rgba(0,0,0,0.2)', 
           zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
           <div style={{ background: '#2e7d32', color: 'white', padding: '15px', fontWeight: 'bold' }}>
              Harvest AI Assistant 🤖
           </div>
           
           <div style={{ flex: 1, padding: '15px', background: '#f5f5f5', overflowY: 'auto' }}>
              <div style={msgStyle}>Namaste! How can I help you? (Hindi/Eng/Guj)</div>
           </div>
           
           <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Ask anything..." style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }} />
              <button style={iconBtn}><Mic size={18} color="#2e7d32" /></button>
              <button style={iconBtn}><Send size={18} color="#2e7d32" /></button>
           </div>
        </div>
      )}
    </>
  );
};

const msgStyle = { background: 'white', padding: '10px', borderRadius: '10px 10px 10px 0', marginBottom: '10px', fontSize: '14px', maxWidth: '85%', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const iconBtn = { background: '#eee', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };

export default AIChatButton;