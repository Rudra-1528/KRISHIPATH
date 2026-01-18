import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, X, Mic, Send } from 'lucide-react';
import { useNotifications } from '../NotificationContext';
import { autoTranslate } from '../autoTranslator';
import { translations } from '../translations';

const AIChatButton = ({ lang: propLang }) => {
  const { notifications } = useNotifications();
  const [lang, setLang] = useState(propLang || localStorage.getItem('harvest_lang') || 'en');
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! Ask me about live alerts, unread counts, or status. Mic works in all supported languages.' }]);

  useEffect(() => {
    setLang(propLang || localStorage.getItem('harvest_lang') || 'en');
  }, [propLang]);

  const sortedAlerts = useMemo(() => {
    return [...(notifications || [])].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [notifications]);

  const voiceLangMap = {
    en: 'en-US',
    hi: 'hi-IN',
    gu: 'gu-IN',
    gj: 'gu-IN',
    pa: 'pa-IN',
    mr: 'mr-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    bn: 'bn-IN'
  };

  const appendMessage = (from, text) => setMessages((prev) => [...prev, { from, text }]);

  const summarizeAlerts = () => {
    if (!sortedAlerts.length) return 'No live alerts right now.';
    const top = sortedAlerts.slice(0, 3).map((n) => `${n.truck || 'GJ-01-LIVE'}: ${n.message || n.value || n.type}`);
    return `Latest alerts: ${top.join(' | ')}`;
  };

  const unreadCount = useMemo(() => sortedAlerts.filter((n) => !n.isRead).length, [sortedAlerts]);

  const answerInEnglish = (q) => {
    const text = q.toLowerCase();
    if (text.includes('unread')) return `You have ${unreadCount} unread alerts.`;
    if (text.includes('latest') || text.includes('recent') || text.includes('alert')) return summarizeAlerts();
    if (text.includes('temperature') || text.includes('temp')) {
      const t = sortedAlerts.find((n) => n.type === 'temperature');
      return t ? `${t.truck || 'GJ-01-LIVE'} temperature alert: ${t.message || t.value}` : 'No temperature alerts right now.';
    }
    if (text.includes('humidity')) {
      const h = sortedAlerts.find((n) => n.type === 'humidity');
      return h ? `${h.truck || 'GJ-01-LIVE'} humidity alert: ${h.message || h.value}` : 'No humidity alerts right now.';
    }
    if (text.includes('shock') || text.includes('impact')) {
      const s = sortedAlerts.find((n) => n.type === 'shock');
      return s ? `${s.truck || 'GJ-01-LIVE'} shock alert: ${s.message || s.value}` : 'No shock alerts right now.';
    }
    if (text.includes('signal') || text.includes('connection') || text.includes('offline')) {
      const c = sortedAlerts.find((n) => n.type === 'connection');
      return c ? `${c.truck || 'GJ-01-LIVE'} connection status: ${c.message || c.value}` : 'Signal looks good; no connection drops reported.';
    }
    if (text.includes('language')) {
      const langs = Object.keys(translations.layout || {}).join(', ');
      return `Supported languages: ${langs}. Mic uses your selected language for voice.`;
    }
    return 'I can share unread counts, latest alerts, and sensor/connection issues. Ask me about temperature, humidity, shock, signal, or unread alerts.';
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    appendMessage('user', userText);

    try {
      const questionEn = lang === 'en' ? userText : await autoTranslate(userText, 'en');
      const answerEn = answerInEnglish(questionEn);
      const answerLocalized = lang === 'en' ? answerEn : await autoTranslate(answerEn, lang);
      appendMessage('bot', answerLocalized);
    } catch (e) {
      appendMessage('bot', 'Sorry, I could not process that just now.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      appendMessage('bot', 'Voice input not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.lang = voiceLangMap[lang] || 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recognitionRef.current = recog;
    setIsListening(true);
    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => `${prev} ${transcript}`.trim());
      setIsListening(false);
    };
    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);
    recog.start();
  };

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
          width: '340px', height: '480px', background: 'white',
          borderRadius: '16px', boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
          zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ background: '#2e7d32', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Harvest AI Assistant 🤖</span>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>{lang.toUpperCase()}</span>
          </div>

          <div style={{ flex: 1, padding: '15px', background: '#f5f5f5', overflowY: 'auto' }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{ ...msgStyle, alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start', background: m.from === 'user' ? '#e8f5e9' : 'white', borderRadius: m.from === 'user' ? '10px 10px 0 10px' : '10px 10px 10px 0' }}>
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Ask about alerts, status, unread..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
            />
            <button style={iconBtn} onClick={startVoice} title="Voice input">
              <Mic size={18} color={isListening ? '#d32f2f' : '#2e7d32'} />
            </button>
            <button style={iconBtn} onClick={handleSend} title="Send">
              <Send size={18} color="#2e7d32" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const msgStyle = { background: 'white', padding: '10px', borderRadius: '10px 10px 10px 0', marginBottom: '10px', fontSize: '14px', maxWidth: '85%', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const iconBtn = { background: '#eee', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };

export default AIChatButton;