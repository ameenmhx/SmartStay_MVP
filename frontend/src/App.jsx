import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ConciergeBell,
  Droplets,
  Coffee,
  UtensilsCrossed,
  Sparkles,
  Bath,
  Shirt,
  Car,
  Clock,
  LogOut,
  Siren,
  CheckCircle2,
  Wifi,
  WifiOff,
  RefreshCw,
  BellRing,
  Send,
  Building2,
  Check,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Truck,
  PhoneCall,
  Flame,
  Layers,
  Mic,
  MicOff,
  Sun,
  Sunrise,
  Moon,
  Zap,
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Shield,
  Layers3,
  QrCode,
  Printer,
  Download,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000/ws/waiter';

// Status Normalizer helper
const normalizeStatus = (statusStr) => {
  if (!statusStr) return 'Pending';
  const s = statusStr.toLowerCase().trim();
  if (s === 'pending') return 'Pending';
  if (s === 'in_progress' || s === 'on the way' || s === 'on_the_way') return 'On the Way';
  if (s === 'completed' || s === 'delivered') return 'Delivered';
  return statusStr;
};

export default function App() {
  const [activeView, setActiveView] = useState('guest'); // 'guest' | 'waiter' | 'manager'
  const [selectedRoom, setSelectedRoom] = useState('101');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                  SmartStay
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Luxury Suites
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Real-Time Hospitality Platform</p>
            </div>
          </div>

          {/* View Switcher Toggle - 3 Views: Guest, Waiter, Manager */}
          <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner overflow-x-auto">
            <button
              id="nav-guest-view-btn"
              onClick={() => setActiveView('guest')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 ${
                activeView === 'guest'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ConciergeBell className="w-4 h-4" />
              <span>Guest Portal</span>
            </button>
            <button
              id="nav-waiter-view-btn"
              onClick={() => setActiveView('waiter')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 ${
                activeView === 'waiter'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Waiter Dashboard</span>
            </button>
            <button
              id="nav-manager-view-btn"
              onClick={() => setActiveView('manager')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 ${
                activeView === 'manager'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Manager Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'guest' ? (
          <GuestView selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
        ) : activeView === 'waiter' ? (
          <WaiterView />
        ) : (
          <ManagerView />
        )}
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SmartStay MVP Platform &copy; {new Date().getFullYear()}</span>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              API Online: {API_BASE_URL}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ==========================================================================
   GUEST VIEW COMPONENT
   ========================================================================== */
function GuestView({ selectedRoom, setSelectedRoom }) {
  const [customItem, setCustomItem] = useState('');
  const [loadingItem, setLoadingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [wsStatus, setWsStatus] = useState('CONNECTING');
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL');

  // Voice Request State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const socketRef = useRef(null);

  // Dynamic Time-Aware UI Context Helper
  const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Good Morning',
        subtext: 'Start your morning with fresh coffee, warm breakfast, or fresh room amenities.',
        icon: Sunrise,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        suggestions: [
          { id: 'Coffee', title: 'Fresh Coffee', desc: 'Espresso or Americano', icon: Coffee, badge: 'Morning Drink' },
          { id: 'Food', title: 'Breakfast Croissant', desc: 'Warm flaky bakery set', icon: UtensilsCrossed, badge: 'Breakfast' },
          { id: 'Towels', title: 'Fresh Towels', desc: 'Plush morning bath towels', icon: Bath, badge: 'Freshness' },
        ],
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: 'Good Afternoon',
        subtext: 'Stay refreshed with afternoon beverages, lunch, or city shuttle booking.',
        icon: Sun,
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        suggestions: [
          { id: 'Water', title: 'Chilled Bottled Water', desc: 'Ice-cold mineral water', icon: Droplets, badge: 'Hydration' },
          { id: 'Food', title: 'In-Room Lunch', desc: 'Chef gourmet warm lunch', icon: UtensilsCrossed, badge: 'Dining' },
          { id: 'Taxi', title: 'Taxi Shuttle', desc: 'Book city transportation', icon: Car, badge: 'Travel' },
        ],
      };
    } else {
      return {
        greeting: 'Good Evening',
        subtext: 'Unwind your evening with cozy blankets, nighttime teas, or turndown service.',
        icon: Moon,
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        suggestions: [
          { id: 'Extra Blankets', title: 'Extra Blankets', desc: 'Warm plush duvet & pillow', icon: Sparkles, badge: 'Night Comfort' },
          { id: 'Tea', title: 'Hot Herbal Tea', desc: 'Soothing chamomile tea', icon: Coffee, badge: 'Nightcap' },
          { id: 'Room Cleaning', title: 'Turndown Refresh', desc: 'Evening bed refresh & cleaning', icon: Sparkles, badge: 'Turndown' },
        ],
      };
    }
  };

  const timeContext = getTimeContext();
  const TimeIcon = timeContext.icon;

  // Voice Request Toggle using WebSpeech API
  const toggleVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast('Speech Recognition API is not supported in this browser.', 'error');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        triggerToast('🎙️ Listening... Speak your request now.', 'success');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setCustomItem(transcript);
          triggerToast(`Speech transcribed: "${transcript}"`, 'success');
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          triggerToast(`Speech recognition error: ${event.error}`, 'error');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
      setIsListening(false);
      triggerToast('Microphone access unavailable for voice input.', 'error');
    }
  };

  // Request Categories Scope
  const serviceCategories = [
    {
      id: 'room_service',
      title: 'Room Service',
      description: 'Refreshments, beverages & in-room dining',
      icon: UtensilsCrossed,
      color: 'indigo',
      items: [
        { id: 'Water', title: 'Bottled Water', desc: 'Chilled mineral water', icon: Droplets, badge: 'Hydration' },
        { id: 'Tea', title: 'Hot Tea', desc: 'Selection of premium teas', icon: Coffee, badge: 'Beverage' },
        { id: 'Coffee', title: 'Fresh Coffee', desc: 'Espresso or Americano', icon: Coffee, badge: 'Beverage' },
        { id: 'Food', title: 'In-Room Dining', desc: 'Chef snacks & warm meal', icon: UtensilsCrossed, badge: 'Dining' },
      ],
    },
    {
      id: 'housekeeping',
      title: 'Housekeeping',
      description: 'Room care, linen & cleaning services',
      icon: Sparkles,
      color: 'cyan',
      items: [
        { id: 'Room Cleaning', title: 'Room Cleaning', desc: 'Full room refresh', icon: Sparkles, badge: 'Service' },
        { id: 'Towels', title: 'Fresh Towels', desc: 'Set of plush bath towels', icon: Bath, badge: 'Amenities' },
        { id: 'Laundry', title: 'Laundry Service', desc: 'Wash, dry & press', icon: Shirt, badge: 'Care' },
      ],
    },
    {
      id: 'reception',
      title: 'Reception',
      description: 'Front desk, transportation & checkout',
      icon: ConciergeBell,
      color: 'emerald',
      items: [
        { id: 'Taxi', title: 'Taxi Booking', desc: 'Airport or city shuttle', icon: Car, badge: 'Travel' },
        { id: 'Wake-up Call', title: 'Wake-up Call', desc: 'Scheduled morning alarm', icon: Clock, badge: 'Front Desk' },
        { id: 'Checkout', title: 'Express Checkout', desc: 'Bag handling & bill review', icon: LogOut, badge: 'Billing' },
      ],
    },
  ];

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Fetch all requests for the currently selected room
  const fetchMyRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests`);
      if (res.ok) {
        const result = await res.json();
        if (result && Array.isArray(result.data)) {
          const roomRequests = result.data
            .filter((req) => String(req.room_number) === String(selectedRoom))
            .map((req) => ({ ...req, status: normalizeStatus(req.status) }))
            .reverse();
          setMyRequests(roomRequests);
        }
      }
    } catch (err) {
      console.error('Error fetching room requests:', err);
    }
  }, [selectedRoom]);

  // Connect WebSocket for real-time guest status updates
  useEffect(() => {
    fetchMyRequests();

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => setWsStatus('CONNECTED');
    ws.onerror = () => setWsStatus('DISCONNECTED');
    ws.onclose = () => setWsStatus('DISCONNECTED');

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('Guest WS event received:', payload);

        if (payload.event === 'NEW_SERVICE_REQUEST' && payload.data) {
          const req = payload.data;
          if (String(req.room_number) === String(selectedRoom)) {
            setMyRequests((prev) => [
              { ...req, status: normalizeStatus(req.status) },
              ...prev.filter((r) => String(r.id) !== String(req.id)),
            ]);
          }
        } else if (payload.event === 'STATUS_UPDATE' && payload.data) {
          const updated = payload.data;
          setMyRequests((prev) =>
            prev.map((r) =>
              String(r.id) === String(updated.id)
                ? { ...r, status: normalizeStatus(updated.status) }
                : r
            )
          );
        }
      } catch (err) {
        console.error('Error parsing Guest WS event:', err);
      }
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [selectedRoom, fetchMyRequests]);

  const handleOrder = async (itemName, isEmergency = false) => {
    if (!itemName.trim()) return;
    setLoadingItem(itemName);

    const targetItemName = isEmergency ? 'EMERGENCY' : itemName;

    try {
      const response = await fetch(`${API_BASE_URL}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_number: selectedRoom,
          item_requested: targetItemName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const resData = await response.json();
      const newRecord = resData?.data || {
        id: 'Req-' + Math.floor(Math.random() * 1000),
        room_number: selectedRoom,
        item_requested: targetItemName,
        status: 'Pending',
      };

      setMyRequests((prev) => [
        { ...newRecord, status: normalizeStatus(newRecord.status) },
        ...prev.filter((r) => String(r.id) !== String(newRecord.id)),
      ]);

      if (isEmergency) {
        triggerToast(`🚨 EMERGENCY SOS DISPATCHED for Room ${selectedRoom}! Waiter & Manager notified.`, 'error');
      } else {
        triggerToast(`Request for "${itemName}" sent to front desk staff!`, 'success');
      }

      if (itemName === customItem) setCustomItem('');
    } catch (err) {
      console.error('Request failed:', err);
      triggerToast(`Failed to send request: ${err.message}. Ensure backend is running.`, 'error');
    } finally {
      setLoadingItem(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 shadow-2xl backdrop-blur-md transition-all transform animate-slide-up ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200 shadow-red-900/20'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-900/20'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          )}
          <div className="text-xs sm:text-sm font-semibold">{toast.msg}</div>
        </div>
      )}

      {/* Time-Aware UI: Dynamic Greeting Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex items-center space-x-1 ${timeContext.badgeColor}`}>
                <TimeIcon className="w-3.5 h-3.5 mr-1" />
                <span>{timeContext.greeting}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
                  wsStatus === 'CONNECTED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${wsStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>{wsStatus === 'CONNECTED' ? 'Live Sync' : 'Connecting'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
              <span>{timeContext.greeting}, Suite Guest!</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              {timeContext.subtext}
            </p>
          </div>

          {/* Room Selector Dropdown */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center space-x-3 self-start sm:self-center shadow-inner shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room:</span>
            <select
              id="room-select-input"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="bg-slate-800 text-white text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="101">Suite 101</option>
              <option value="102">Suite 102</option>
              <option value="204">Deluxe 204</option>
              <option value="305">Penthouse 305</option>
            </select>
          </div>
        </div>

        {/* Dynamic Quick Suggestions (Time-Based) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              Quick Suggestions for {timeContext.greeting}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {timeContext.suggestions.map((item) => {
              const ItemIcon = item.icon;
              const isLoading = loadingItem === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/80 hover:bg-slate-800/90 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                    </div>
                  </div>
                  <button
                    id={`quick-suggest-btn-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                    disabled={isLoading}
                    onClick={() => handleOrder(item.id)}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-[11px] font-bold border border-indigo-500/30 transition-all shrink-0 flex items-center gap-1"
                  >
                    {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Order</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Emergency SOS High-Visibility Banner */}
      <div className="glass-panel p-5 rounded-2xl border-2 border-red-500/60 bg-gradient-to-r from-red-950/80 via-slate-900/90 to-red-950/80 shadow-2xl shadow-red-950/50 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 shrink-0 animate-pulse ring-2 ring-red-500/40">
            <Siren className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-red-500/30 text-red-200 border border-red-500/40 tracking-wider">
                🚨 Immediate Urgent Priority
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight mt-1">Emergency SOS</h2>
            <p className="text-xs text-slate-300">
              Dispatches an immediate high-priority red alert to staff for Room {selectedRoom}.
            </p>
          </div>
        </div>
        <button
          id="request-emergency-btn"
          disabled={loadingItem === 'EMERGENCY'}
          onClick={() => handleOrder('EMERGENCY', true)}
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xl shadow-red-600/50 border border-red-400/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 shrink-0 animate-pulse"
        >
          {loadingItem === 'EMERGENCY' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>DISPATCHING SOS...</span>
            </>
          ) : (
            <>
              <Siren className="w-4 h-4 text-white" />
              <span>SEND EMERGENCY SOS</span>
            </>
          )}
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex space-x-2 overflow-x-auto py-1 no-scrollbar">
          <button
            id="cat-tab-all"
            onClick={() => setActiveCategoryTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeCategoryTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Categories</span>
          </button>
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategoryTab === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => setActiveCategoryTab(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorized Request UI Grid */}
      <div className="space-y-8">
        {serviceCategories
          .filter((cat) => activeCategoryTab === 'ALL' || activeCategoryTab === cat.id)
          .map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.id} className="space-y-4 animate-fade-in">
                <div className="flex items-center space-x-3 border-l-4 border-indigo-500 pl-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{cat.title}</h2>
                    <p className="text-xs text-slate-400">{cat.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cat.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isLoading = loadingItem === item.id;
                    return (
                      <div
                        key={item.id}
                        className="glass-card p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 group transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md">
                            <ItemIcon className="w-5 h-5" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {item.badge}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-white">{item.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                        </div>

                        <button
                          id={`request-btn-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                          disabled={isLoading}
                          onClick={() => handleOrder(item.id)}
                          className="w-full py-2.5 px-3 bg-slate-900 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg text-xs font-bold border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-center space-x-1.5 shadow-inner"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <span>Order Now</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Custom Request Input Section with Voice Requests */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <label htmlFor="custom-item-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Custom Special Request
          </label>
          <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
            <Mic className="w-3.5 h-3.5" /> Voice Input Supported
          </span>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative flex-1">
            <input
              id="custom-item-input"
              type="text"
              placeholder="e.g. Extra Feather Pillow, Dental Kit, Extra Hangers..."
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleOrder(customItem)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-indigo-500 transition-all"
            />
            {customItem && (
              <button
                type="button"
                onClick={() => setCustomItem('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Voice Requests Microphone Button */}
          <button
            id="voice-request-btn"
            type="button"
            onClick={toggleVoiceRecognition}
            className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 border transition-all shrink-0 ${
              isListening
                ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-lg shadow-red-600/40 ring-2 ring-red-500/50'
                : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border-slate-800 hover:border-indigo-500/40'
            }`}
            title={isListening ? 'Click to stop listening' : 'Speak your request using voice'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span>Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-indigo-400" />
                <span>Speak Request</span>
              </>
            )}
          </button>

          <button
            id="request-custom-btn"
            disabled={!customItem.trim() || loadingItem === customItem}
            onClick={() => handleOrder(customItem)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Submit Custom Request</span>
          </button>
        </div>
      </div>

      {/* ==========================================================================
         MY REQUEST STATUS SECTION (Bottom of Guest View)
         ========================================================================== */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">My Request Status</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Room {selectedRoom}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time tracking for services requested in your suite
              </p>
            </div>
          </div>

          <button
            id="refresh-guest-status-btn"
            onClick={fetchMyRequests}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-all text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Requests List */}
        {myRequests.length === 0 ? (
          <div className="text-center py-10 space-y-3 bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <ShieldCheck className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No active requests for Room {selectedRoom}</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Any item or service requested above will appear here in real time with live status updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRequests.map((req, idx) => {
              const status = normalizeStatus(req.status);
              const isPending = status === 'Pending';
              const isOnTheWay = status === 'On the Way';
              const isDelivered = status === 'Delivered';
              const isEmergency = (req.item_requested || '').toUpperCase().includes('EMERGENCY');

              return (
                <div
                  key={req.id || idx}
                  className={`glass-card p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all duration-300 animate-slide-up ${
                    isEmergency
                      ? 'border-2 border-red-500/80 bg-gradient-to-br from-red-950/80 via-slate-900 to-red-950/80 shadow-xl shadow-red-950/50 animate-pulse'
                      : isPending
                      ? 'border-amber-500/40 bg-slate-900/90 shadow-lg shadow-amber-500/5'
                      : isOnTheWay
                      ? 'border-indigo-500/40 bg-slate-900/90 shadow-lg shadow-indigo-500/10'
                      : 'border-emerald-500/30 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold tracking-widest uppercase ${isEmergency ? 'text-red-400' : 'text-indigo-400'}`}>
                        Request #{req.id || idx + 1}
                      </span>
                      <h3 className={`text-base font-bold mt-0.5 ${isEmergency ? 'text-red-200' : 'text-white'}`}>{req.item_requested}</h3>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold border flex items-center space-x-1.5 shrink-0 ${
                        isEmergency
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : isOnTheWay
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isPending ? (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pending</span>
                        </>
                      ) : isOnTheWay ? (
                        <>
                          <Truck className="w-3 h-3 text-indigo-400" />
                          <span>On the Way</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Delivered</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Status Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isEmergency
                            ? 'w-full bg-red-500 animate-pulse'
                            : isPending
                            ? 'w-1/3 bg-amber-400'
                            : isOnTheWay
                            ? 'w-2/3 bg-indigo-400'
                            : 'w-full bg-emerald-400'
                        }`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Received</span>
                      <span>En Route</span>
                      <span>Fulfilled</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   WAITER VIEW COMPONENT (REAL-TIME DASHBOARD)
   ========================================================================== */
function WaiterView() {
  const [requests, setRequests] = useState([]);
  const [wsStatus, setWsStatus] = useState('CONNECTING');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'Pending' | 'On the Way' | 'Delivered'
  const [newIncomingCount, setNewIncomingCount] = useState(0);

  const socketRef = useRef(null);

  // Fetch all requests from backend API GET /requests
  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          const normalizedList = data.data
            .map((r) => ({ ...r, status: normalizeStatus(r.status) }))
            .reverse();
          setRequests(normalizedList);
        }
      }
    } catch (err) {
      console.error('Failed to pre-fetch requests:', err);
    }
  }, []);

  // Setup WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    setWsStatus('CONNECTING');
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected to', WS_URL);
      setWsStatus('CONNECTED');
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        console.log('Waiter WS message received:', parsed);

        if (parsed.event === 'NEW_SERVICE_REQUEST' && parsed.data) {
          const newReq = { ...parsed.data, status: normalizeStatus(parsed.data.status) };
          setRequests((prev) => {
            if (newReq.id && prev.some((r) => String(r.id) === String(newReq.id))) {
              return prev;
            }
            return [newReq, ...prev];
          });
          setNewIncomingCount((c) => c + 1);
        } else if (parsed.event === 'STATUS_UPDATE' && parsed.data) {
          const updated = parsed.data;
          setRequests((prev) =>
            prev.map((r) =>
              String(r.id) === String(updated.id)
                ? { ...r, status: normalizeStatus(updated.status) }
                : r
            )
          );
        }
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsStatus('DISCONNECTED');
    };

    ws.onclose = () => {
      setWsStatus('DISCONNECTED');
    };
  }, []);

  useEffect(() => {
    fetchRequests();
    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [fetchRequests, connectWebSocket]);

  // Update status via backend API PUT /request/{id}
  const updateRequestStatus = async (id, newStatus) => {
    // Optimistic UI Update
    setRequests((prev) =>
      prev.map((req) => (String(req.id) === String(id) ? { ...req, status: newStatus } : req))
    );

    try {
      const res = await fetch(`${API_BASE_URL}/request/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        console.error(`Status update HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to update status on server:', err);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'ALL') return true;
    return normalizeStatus(req.status).toLowerCase() === filter.toLowerCase();
  });

  const pendingCount = requests.filter((r) => normalizeStatus(r.status) === 'Pending').length;
  const onTheWayCount = requests.filter((r) => normalizeStatus(r.status) === 'On the Way').length;
  const deliveredCount = requests.filter((r) => normalizeStatus(r.status) === 'Delivered').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard Top Header Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Waiter Service Dashboard</h1>
            {newIncomingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white animate-bounce">
                +{newIncomingCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Accept & complete live incoming requests from hotel rooms via WebSockets</p>
        </div>

        {/* Live WS Connection Status Badge */}
        <div className="flex items-center space-x-3">
          <div
            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center space-x-2 backdrop-blur-md ${
              wsStatus === 'CONNECTED'
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                : wsStatus === 'CONNECTING'
                ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                : 'bg-red-950/60 text-red-400 border-red-500/30'
            }`}
          >
            {wsStatus === 'CONNECTED' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 glow-green animate-pulse"></span>
                <span>WS Connected</span>
                <Wifi className="w-3.5 h-3.5 ml-1" />
              </>
            ) : wsStatus === 'CONNECTING' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 glow-amber animate-spin"></span>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 glow-red"></span>
                <span>Disconnected</span>
                <WifiOff className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </div>

          <button
            id="ws-reconnect-btn"
            onClick={() => {
              fetchRequests();
              connectWebSocket();
            }}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-all text-xs font-semibold flex items-center space-x-1"
            title="Reconnect WebSocket"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Total Orders</span>
            <div className="text-2xl font-extrabold text-white mt-1">{requests.length}</div>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <BellRing className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-amber-400">Pending</span>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">{pendingCount}</div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-indigo-400">On the Way</span>
            <div className="text-2xl font-extrabold text-indigo-300 mt-1">{onTheWayCount}</div>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-400">Delivered</span>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">{deliveredCount}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex space-x-2">
          {['ALL', 'Pending', 'On the Way', 'Delivered'].map((tab) => (
            <button
              key={tab}
              id={`filter-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          Showing {filteredRequests.length} of {requests.length} requests
        </span>
      </div>

      {/* Incoming Requests Feed List */}
      {filteredRequests.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3 border border-slate-800">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <ConciergeBell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-300">No requests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {requests.length === 0
              ? 'Waiting for incoming room service requests over WebSocket...'
              : `No requests with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((req, idx) => {
            const status = normalizeStatus(req.status);
            const isPending = status === 'Pending';
            const isOnTheWay = status === 'On the Way';
            const isDelivered = status === 'Delivered';
            const isEmergency = (req.item_requested || '').toUpperCase().includes('EMERGENCY');

            return (
              <div
                key={req.id || idx}
                className={`glass-card p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all duration-300 ${
                  isEmergency
                    ? 'border-2 border-red-500 bg-gradient-to-br from-red-950 via-slate-900 to-red-950 shadow-2xl shadow-red-950/60 animate-pulse ring-2 ring-red-500/80 scale-[1.02]'
                    : isPending
                    ? 'border-amber-500/40 bg-slate-900/90 shadow-lg shadow-amber-500/5'
                    : isOnTheWay
                    ? 'border-indigo-500/40 bg-slate-900/70'
                    : 'border-slate-800/80 opacity-80 bg-slate-950/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-extrabold tracking-widest uppercase ${isEmergency ? 'text-red-400' : 'text-indigo-400'}`}>
                        Room {req.room_number}
                      </span>
                      {isEmergency && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold bg-red-600 text-white rounded-full animate-bounce shadow-md shadow-red-600/50 flex items-center gap-1">
                          <Siren className="w-3 h-3 text-white" /> EMERGENCY SOS
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base font-bold mt-0.5 ${isEmergency ? 'text-red-200 text-lg font-black' : 'text-white'}`}>
                      {req.item_requested}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${
                      isEmergency
                        ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                        : isPending
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : isOnTheWay
                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Footer details & Action status switcher buttons */}
                <div className="pt-3 border-t border-slate-800/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px]">Request ID: #{req.id || idx + 1}</span>
                    <span className="text-[11px] font-semibold text-slate-300">Staff Actions:</span>
                  </div>

                  {/* PROMINENT ACTION BUTTONS: Accept (sets status to 'On the Way') & Complete (sets status to 'Delivered') */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`accept-btn-${req.id || idx}`}
                      disabled={isOnTheWay || isDelivered}
                      onClick={() => updateRequestStatus(req.id, 'On the Way')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 border ${
                        isOnTheWay
                          ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40 cursor-default'
                          : isDelivered
                          ? 'bg-slate-900 text-slate-600 border-slate-800/80 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-indigo-400/40 shadow-lg shadow-indigo-600/25 active:scale-95'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{isOnTheWay ? 'Accepted' : 'Accept'}</span>
                    </button>

                    <button
                      id={`complete-btn-${req.id || idx}`}
                      disabled={isDelivered}
                      onClick={() => updateRequestStatus(req.id, 'Delivered')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 border ${
                        isDelivered
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 cursor-default'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/40 shadow-lg shadow-emerald-600/25 active:scale-95'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isDelivered ? 'Delivered' : 'Complete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   MANAGER VIEW COMPONENT (ANALYTICS & HOTEL ACTIVITY DASHBOARD)
   ========================================================================== */
function ManagerView() {
  const [requests, setRequests] = useState([]);
  const [wsStatus, setWsStatus] = useState('CONNECTING');
  const [activityLogs, setActivityLogs] = useState([]);
  const [qrRoomNumber, setQrRoomNumber] = useState('101');

  const socketRef = useRef(null);

  // Fetch all requests from backend API GET /requests
  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          const normalizedList = data.data
            .map((r) => ({ ...r, status: normalizeStatus(r.status) }))
            .reverse();
          setRequests(normalizedList);
        }
      }
    } catch (err) {
      console.error('Manager fetch requests error:', err);
    }
  }, []);

  // Setup WebSocket connection for real-time manager updates
  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    setWsStatus('CONNECTING');
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('Manager WebSocket connected');
      setWsStatus('CONNECTED');
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        console.log('Manager WS message received:', parsed);

        if (parsed.event === 'NEW_SERVICE_REQUEST' && parsed.data) {
          const newReq = { ...parsed.data, status: normalizeStatus(parsed.data.status) };
          setRequests((prev) => {
            if (newReq.id && prev.some((r) => String(r.id) === String(newReq.id))) {
              return prev;
            }
            return [newReq, ...prev];
          });
          setActivityLogs((prev) => [
            {
              id: Date.now() + Math.random(),
              type: 'NEW_ORDER',
              timestamp: new Date().toLocaleTimeString(),
              message: `New request "${newReq.item_requested}" received from Room ${newReq.room_number}`,
              room: newReq.room_number,
              status: newReq.status,
            },
            ...prev.slice(0, 49),
          ]);
        } else if (parsed.event === 'STATUS_UPDATE' && parsed.data) {
          const updated = parsed.data;
          const normalizedStat = normalizeStatus(updated.status);
          setRequests((prev) =>
            prev.map((r) =>
              String(r.id) === String(updated.id)
                ? { ...r, status: normalizedStat }
                : r
            )
          );
          setActivityLogs((prev) => [
            {
              id: Date.now() + Math.random(),
              type: 'STATUS_CHANGE',
              timestamp: new Date().toLocaleTimeString(),
              message: `Order #${updated.id} status changed to "${normalizedStat}"`,
              status: normalizedStat,
            },
            ...prev.slice(0, 49),
          ]);
        }
      } catch (err) {
        console.error('Error parsing Manager WS event:', err);
      }
    };

    ws.onerror = () => setWsStatus('DISCONNECTED');
    ws.onclose = () => setWsStatus('DISCONNECTED');
  }, []);

  useEffect(() => {
    fetchRequests();
    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [fetchRequests, connectWebSocket]);

  // Analytics Metrics calculations
  const totalOrders = requests.length;
  const pendingOrders = requests.filter((r) => normalizeStatus(r.status) === 'Pending').length;
  const completedOrders = requests.filter(
    (r) => normalizeStatus(r.status) === 'Delivered' || normalizeStatus(r.status) === 'Completed'
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Manager Overview</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
                wsStatus === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${wsStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{wsStatus === 'CONNECTED' ? 'Live Telemetry' : 'Connecting'}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-2">
            <span>Executive Manager Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Top-level operational analytics & real-time hotel activity stream
          </p>
        </div>

        <button
          id="manager-refresh-btn"
          onClick={() => {
            fetchRequests();
            connectWebSocket();
          }}
          className="p-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-200 transition-all text-xs font-bold flex items-center space-x-2 self-start md:self-center shadow-lg"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top-Level Analytics Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Orders */}
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/90 shadow-xl relative overflow-hidden group hover:border-indigo-500/60 transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl shadow-md">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-black text-white tracking-tight">{totalOrders}</div>
            <div className="flex items-center space-x-1 mt-1 text-xs text-indigo-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>All requests logged across hotel</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Pending Orders */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-slate-900/90 shadow-xl relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending Orders</span>
            <div className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl shadow-md">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-black text-amber-300 tracking-tight">{pendingOrders}</div>
            <div className="flex items-center space-x-1 mt-1 text-xs text-amber-400/80 font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>Requires waiter acceptance</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Completed Orders */}
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-slate-900/90 shadow-xl relative overflow-hidden group hover:border-emerald-500/60 transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Completed Orders</span>
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-black text-emerald-300 tracking-tight">{completedOrders}</div>
            <div className="flex items-center space-x-1 mt-1 text-xs text-emerald-400/80 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Successfully delivered to rooms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Room QR Generator Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Room QR Generator</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  Guest Portal QR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate printable QR codes linking guests directly to their suite ordering view
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Controls Column */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label htmlFor="qr-room-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Room Number
              </label>
              <div className="relative max-w-xs">
                <input
                  id="qr-room-input"
                  type="text"
                  value={qrRoomNumber}
                  onChange={(e) => setQrRoomNumber(e.target.value)}
                  placeholder="e.g. 101, 102"
                  className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Enter any room number to instantly update the encoded URL &amp; QR code preview.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1.5 max-w-md">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">
                Encoded Guest Portal URL
              </span>
              <code className="text-xs text-slate-300 font-mono break-all block">
                http://localhost:5174/?room={qrRoomNumber || '101'}
              </code>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                id="qr-print-download-btn"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2 border border-indigo-400/30 active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <Download className="w-4 h-4 ml-0.5" />
                <span>Print / Download</span>
              </button>
            </div>
          </div>

          {/* QR Code Display Column */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner shrink-0">
            <div className="p-4 bg-white rounded-2xl shadow-2xl ring-4 ring-indigo-500/20 border border-slate-200">
              <QRCodeSVG
                value={`http://localhost:5174/?room=${qrRoomNumber || '101'}`}
                size={160}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
                level="H"
                marginSize={2}
              />
            </div>
            <div className="mt-4 text-center">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-extrabold tracking-wide uppercase">
                Suite {qrRoomNumber || '101'}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Scan to access guest portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Feed of Hotel Activity */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Live Hotel Activity Feed</h2>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time activity stream of guest service requests & staff status updates
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {requests.length} active records in database
          </span>
        </div>

        {/* Live Hotel Requests Activity List */}
        {requests.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <Layers3 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No hotel activity recorded yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Any order placed by guests or updated by waiters will instantly show up in this live feed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req, idx) => {
              const status = normalizeStatus(req.status);
              const isPending = status === 'Pending';
              const isOnTheWay = status === 'On the Way';
              const isDelivered = status === 'Delivered';
              const isEmergency = (req.item_requested || '').toUpperCase().includes('EMERGENCY');

              return (
                <div
                  key={req.id || idx}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isEmergency
                      ? 'bg-red-950/40 border-red-500/60 text-red-100 shadow-md shadow-red-950/40 animate-pulse'
                      : isPending
                      ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
                      : isOnTheWay
                      ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-900 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon indicator */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isEmergency
                          ? 'bg-red-600 text-white'
                          : isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isOnTheWay
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isEmergency ? (
                        <Siren className="w-5 h-5" />
                      ) : isPending ? (
                        <Clock className="w-5 h-5" />
                      ) : isOnTheWay ? (
                        <Truck className="w-5 h-5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-800 text-slate-200 border border-slate-700">
                          Room {req.room_number}
                        </span>
                        <span className="text-xs font-mono text-slate-500">ID #{req.id || idx + 1}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        {req.item_requested}
                      </h4>
                    </div>
                  </div>

                  {/* Right side: Status Badge */}
                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border flex items-center space-x-1.5 ${
                        isEmergency
                          ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : isOnTheWay
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      <span>{status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
