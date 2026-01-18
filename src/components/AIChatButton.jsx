import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, X, Mic, Send, MapPin, Truck, Users } from 'lucide-react';
import { useNotifications } from '../NotificationContext';
import { useUser } from '../UserContext';
import { autoTranslate } from '../autoTranslator';
import { translations } from '../translations';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../firebase';

const AIChatButton = ({ lang: propLang }) => {
  const { notifications } = useNotifications();
  const { user } = useUser();
  const [lang, setLang] = useState(propLang || localStorage.getItem('harvest_lang') || 'en');
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [shipments, setShipments] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setLang(propLang || localStorage.getItem('harvest_lang') || 'en');
  }, [propLang]);
  
  // Initialize with translated greeting
  useEffect(() => {
    const initGreeting = async () => {
      const greeting = `Hello${user?.name ? ' ' + user.name : ''}! 👋 I can help you with:\n• Dashboard data (trucks, drivers, shipments)\n• Current locations\n• Alert summaries\n• Navigation help\n\nTry asking: "How many trucks?", "Where is truck GJ-01?", "Show alerts", "Help me change language"`;
      const translatedGreeting = lang === 'en' ? greeting : await autoTranslate(greeting, lang);
      setMessages([{ from: 'bot', text: translatedGreeting }]);
    };
    if (messages.length === 0) initGreeting();
  }, [lang, user]);

  // Listen to shipments data from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "shipments"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShipments(data);
    });
    return () => unsubscribe();
  }, []);

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

  const appendMessage = async (from, text) => {
    if (from === 'bot' && lang !== 'en') {
      try {
        const translatedText = await autoTranslate(text, lang);
        setMessages((prev) => [...prev, { from, text: translatedText }]);
      } catch {
        setMessages((prev) => [...prev, { from, text }]);
      }
    } else {
      setMessages((prev) => [...prev, { from, text }]);
    }
  };

  const summarizeAlerts = () => {
    if (!sortedAlerts.length) return 'No live alerts right now.';
    const top = sortedAlerts.slice(0, 3).map((n) => `${n.truck || 'GJ-01-LIVE'}: ${n.message || n.value || n.type}`);
    return `Latest alerts: ${top.join(' | ')}`;
  };

  const answerInEnglish = (q) => {
    const text = q.toLowerCase();
    
    // Fleet/Driver database with names, truck numbers, and phone numbers
    const fleetDrivers = [
      { name: 'Rohit Sharma', driverId: 'DRV-999', truck: 'GJ-01-LIVE', route: 'Lavad → Gandhinagar', cargo: 'Fresh Tomatoes', phone: '+916204773940' },
      { name: 'Amit Patel', driverId: 'DRV-888', truck: 'MH-12-9988', route: 'Pune → Mumbai', cargo: 'Alphonso Mangoes', phone: '+919876543210' },
      { name: 'Suresh Shah', driverId: 'DRV-777', truck: 'GJ-05-1122', route: 'Surat → Vadodara', cargo: 'Organic Bananas', phone: '+919988776655' }
    ];
    
    // Dashboard data queries
    if (text.includes('how many truck') || text.includes('number of truck') || text.includes('total truck')) {
      const count = fleetDrivers.length + shipments.length;
      return `There are ${count} trucks in the fleet currently being tracked.`;
    }
    
    if (text.includes('how many driver') || text.includes('number of driver') || text.includes('total driver')) {
      const count = fleetDrivers.length + shipments.length;
      return `The system is tracking ${count} active drivers right now.`;
    }
    
    if (text.includes('list driver') || text.includes('show driver') || text.includes('all driver') || text.includes('driver names')) {
      const driverList = fleetDrivers.map((d, i) => `${i + 1}. ${d.name} (${d.driverId})\n   🚛 Truck: ${d.truck}\n   📞 Phone: ${d.phone}`).join('\n\n');
      return `👥 Active Drivers (${fleetDrivers.length}):\n\n${driverList}`;
    }
    
    if (text.includes('fleet') || text.includes('fleet management') || text.includes('fleet details')) {
      const fleetDetails = fleetDrivers.map((d, i) => 
        `${i + 1}. ${d.name} (${d.driverId})\n   🚛 Truck: ${d.truck}\n   📞 Phone: ${d.phone}\n   📍 Route: ${d.route}\n   📦 Cargo: ${d.cargo}`
      ).join('\n\n');
      return `🚚 Fleet Management Details:\n\n${fleetDetails}`;
    }
    
    if (text.includes('list truck') || text.includes('show truck') || text.includes('all truck')) {
      const trucks = fleetDrivers.map(d => d.truck);
      return `🚛 Active trucks:\n${trucks.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
    }
    
    // Driver-specific queries
    if (text.includes('who is driving') || text.includes('driver of')) {
      const truckMatch = text.match(/gj-01|mh-12|gj-05/i);
      if (truckMatch) {
        const truckId = truckMatch[0].toUpperCase();
        const driver = fleetDrivers.find(d => d.truck.includes(truckId));
        if (driver) {
          return `👤 ${driver.name} (${driver.driverId}) is driving ${driver.truck}\n📞 Phone: ${driver.phone}\n📍 Route: ${driver.route}\n📦 Cargo: ${driver.cargo}`;
        }
      }
      return 'Please specify a truck number (e.g., "Who is driving GJ-01?")';
    }
    
    // Location queries
    if (text.includes('where is') || text.includes('location of') || text.includes('current location')) {
      const truckMatch = text.match(/gj-01|mh-12|gj-05/i);
      if (truckMatch) {
        const truckId = truckMatch[0].toUpperCase();
        const driver = fleetDrivers.find(d => d.truck.includes(truckId));
        if (driver) {
          return `🚛 ${driver.truck}\n👤 Driver: ${driver.name} (${driver.driverId})\n📞 Phone: ${driver.phone}\n📍 Currently on: ${driver.route}\n📦 Carrying: ${driver.cargo}`;
        }
      }
      return 'Please specify a truck number (e.g., "Where is truck GJ-01?")';
    }
    
    // Cargo/Crop queries
    if (text.includes('cargo') || text.includes('carrying') || text.includes('shipment')) {
      const cargoList = fleetDrivers.map((d, i) => 
        `${i + 1}. ${d.truck} - ${d.name}\n   📦 ${d.cargo}\n   📞 ${d.phone}`
      ).join('\n\n');
      return `📦 Active Shipments:\n${cargoList}`;
    }
    
    // Help/Guide queries
    if (text.includes('help') || text.includes('guide') || text.includes('how to')) {
      if (text.includes('language')) {
        return '🌐 To change language:\n1. Click Settings from sidebar\n2. Select your preferred language\n3. Click "Save Changes"\nSupported: English, Hindi, Gujarati, Punjabi, Marathi, Tamil, Telugu, Bengali';
      }
      if (text.includes('setting')) {
        return '⚙️ Access Settings:\n1. Look for Settings icon in sidebar (bottom)\n2. Click to view your profile\n3. Update language, notifications, or account details';
      }
      if (text.includes('map') || text.includes('track')) {
        return '🗺️ To track vehicles:\n1. Go to Dashboard/Fleet view\n2. Check the live map section\n3. Click on truck markers for details\n4. Live updates happen automatically';
      }
      return '💡 I can help with:\n• Dashboard navigation\n• Changing settings\n• Understanding alerts\n• Finding truck locations\nAsk me specific questions!';
    }
    
    // Alert queries
    if (text.includes('unread')) return `You have ${unreadCount} unread alerts.`;
    if (text.includes('latest') || text.includes('recent') || text.includes('alert')) return summarizeAlerts();
    if (text.includes('temperature') || text.includes('temp')) {
      const t = sortedAlerts.find((n) => n.type === 'temperature');
      return t ? `🌡️ ${t.truck || 'GJ-01-LIVE'} temperature alert: ${t.message || t.value}` : 'No temperature alerts right now.';
    }
    if (text.includes('humidity')) {
      const h = sortedAlerts.find((n) => n.type === 'humidity');
      return h ? `💧 ${h.truck || 'GJ-01-LIVE'} humidity alert: ${h.message || h.value}` : 'No humidity alerts right now.';
    }
    if (text.includes('shock') || text.includes('impact')) {
      const s = sortedAlerts.find((n) => n.type === 'shock');
      return s ? `⚡ ${s.truck || 'GJ-01-LIVE'} shock alert: ${s.message || s.value}` : 'No shock alerts right now.';
    }
    if (text.includes('signal') || text.includes('connection') || text.includes('offline')) {
      const c = sortedAlerts.find((n) => n.type === 'connection');
      return c ? `📡 ${c.truck || 'GJ-01-LIVE'} connection status: ${c.message || c.value}` : 'All trucks have good signal connection.';
    }
    
    // Status queries
    if (text.includes('status') || text.includes('overview')) {
      return `📊 Quick Status:\n• Trucks: ${fleetDrivers.length + shipments.length} active\n• Drivers: ${fleetDrivers.length + shipments.length}\n• Alerts: ${unreadCount} unread\n• Role: ${user?.role || 'User'}\n• Language: ${lang.toUpperCase()}`;
    }
    
    // Phone number queries
    if (text.includes('phone') || text.includes('contact') || text.includes('number') || text.includes('call')) {
      if (text.includes('gj-01') || text.includes('rohit')) {
        const driver = fleetDrivers.find(d => d.truck.includes('GJ-01'));
        return `📞 ${driver.name} (${driver.driverId})\nTruck: ${driver.truck}\nPhone: ${driver.phone}`;
      }
      const phoneList = fleetDrivers.map((d, i) => `${i + 1}. ${d.name}: ${d.phone}`).join('\n');
      return `📞 Driver Contact Numbers:\n${phoneList}`;
    }
    
    // Default response
    return 'I can help with:\n🚛 Fleet info ("show all drivers")\n👤 Driver details ("who is driving GJ-01?")\n📍 Locations ("where is truck MH-12?")\n📞 Phone numbers ("phone number of driver")\n🚨 Alerts ("show latest alerts")\n💡 Help ("how to change language?")\n\nWhat would you like to know?';
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    appendMessage('user', userText);

    try {
      const questionEn = lang === 'en' ? userText : await autoTranslate(userText, 'en');
      const answerEn = answerInEnglish(questionEn);
      await appendMessage('bot', answerEn);
    } catch (e) {
      await appendMessage('bot', 'Sorry, I could not process that just now.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startVoice = async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const errorMsg = 'Voice input not supported in this browser.';
      const translatedError = lang === 'en' ? errorMsg : await autoTranslate(errorMsg, lang);
      appendMessage('bot', translatedError);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Multi-language support: Try primary language first, fallback to others
    const supportedLangs = [
      voiceLangMap[lang] || 'en-US',  // Primary: current language
      'en-US',   // English
      'hi-IN',   // Hindi
      'gu-IN',   // Gujarati
      'mr-IN'    // Marathi
    ];
    
    // Remove duplicates
    const uniqueLangs = [...new Set(supportedLangs)];
    let currentLangIndex = 0;
    
    const tryRecognition = () => {
      const recog = new SpeechRecognition();
      recog.lang = uniqueLangs[currentLangIndex];
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recognitionRef.current = recog;
      
      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => `${prev} ${transcript}`.trim());
        setIsListening(false);
      };
      
      recog.onerror = (event) => {
        // If no-speech or language not supported, try next language
        if (event.error === 'no-speech' || event.error === 'language-not-supported') {
          currentLangIndex++;
          if (currentLangIndex < uniqueLangs.length) {
            setTimeout(() => tryRecognition(), 100);
          } else {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };
      
      recog.onend = () => setIsListening(false);
      recog.start();
    };
    
    setIsListening(true);
    tryRecognition();
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
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', fontSize: '13px' }}
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