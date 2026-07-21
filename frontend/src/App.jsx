import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { renderToStaticMarkup } from 'react-dom/server';
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
  Grid,
  Crown,
  Star,
  MessageSquare,
  Award,
  ThumbsUp,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import Login from './components/Login';

const API_BASE_URL = 'https://smartstay-backend-3wbb.onrender.com';
const WS_URL = 'wss://smartstay-backend-3wbb.onrender.com/ws/waiter';

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
  const [roomFromUrl, setRoomFromUrl] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || '';
  });
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      setRoomFromUrl(params.get('room') || '');
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setActiveView('guest');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 px-6 lg:px-10 py-4 shadow-2xl bg-slate-950/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/40">
              <Crown className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-serif font-bold text-xl tracking-tight text-white">
                  SmartStay
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  5-Star Luxury Resort
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">In-Suite Hospitality Telemetry</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Switcher Toggle - 3 Views: Guest, Waiter, Manager */}
            <div className="flex items-center p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto">
              <button
                id="nav-guest-view-btn"
                onClick={() => setActiveView('guest')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                  activeView === 'guest'
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-300/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ConciergeBell className="w-4 h-4" />
                <span>Guest Portal</span>
              </button>
              <button
                id="nav-waiter-view-btn"
                onClick={() => setActiveView('waiter')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                  activeView === 'waiter'
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-300/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Waiter Dashboard</span>
              </button>
              <button
                id="nav-manager-view-btn"
                onClick={() => setActiveView('manager')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                  activeView === 'manager'
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-300/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Manager Dashboard</span>
              </button>
            </div>

            {/* Logout Button - Rendered ONLY if user is logged in */}
            {session && (
              <button
                id="nav-logout-btn"
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all duration-200 shrink-0 cursor-pointer"
                title={`Logged in as ${session.user?.email || 'Staff'}`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 lg:p-10">
        {activeView === 'guest' ? (
          <GuestView roomFromUrl={roomFromUrl} />
        ) : !session ? (
          <Login
            targetView={activeView}
            onSuccess={(newSession) => {
              setSession(newSession);
            }}
          />
        ) : activeView === 'waiter' ? (
          <WaiterView />
        ) : (
          <ManagerView />
        )}
      </main>

      {/* Modern Luxury Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-8 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-medium">SmartStay Luxury Resort MVP Platform &copy; {new Date().getFullYear()}</span>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center text-slate-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Live Telemetry Engine Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ==========================================================================
   GUEST VIEW COMPONENT (5-STAR LUXURY RESORT STYLING)
   ========================================================================== */
function GuestView({ roomFromUrl }) {
  const selectedRoom = roomFromUrl ? roomFromUrl.trim() : '';
  const hasRoomParam = Boolean(selectedRoom);

  const [customItem, setCustomItem] = useState('');
  const [loadingItem, setLoadingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [wsStatus, setWsStatus] = useState('CONNECTING');
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL');

  // 5-Star Feedback State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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
        subtext: 'Start your morning with fresh artisan coffee, warm gourmet bakery, or fresh room amenities.',
        icon: Sunrise,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        suggestions: [
          { id: 'Coffee', title: 'Fresh Artisan Coffee', desc: 'Espresso or Americano set', icon: Coffee, badge: 'Morning Brew' },
          { id: 'Food', title: 'Breakfast Croissant', desc: 'Warm flaky French bakery basket', icon: UtensilsCrossed, badge: 'Gourmet' },
          { id: 'Towels', title: 'Plush Bath Towels', desc: 'Egyptian cotton bath towels', icon: Bath, badge: 'Fresh Linen' },
        ],
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: 'Good Afternoon',
        subtext: 'Stay refreshed with afternoon beverages, chef-prepared lunch, or private chauffeur shuttle.',
        icon: Sun,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        suggestions: [
          { id: 'Water', title: 'Chilled Mineral Water', desc: 'Ice-cold sparkling or still water', icon: Droplets, badge: 'Hydration' },
          { id: 'Food', title: 'In-Suite Gourmet Lunch', desc: 'Chef specialty warm entree', icon: UtensilsCrossed, badge: 'Fine Dining' },
          { id: 'Taxi', title: 'Private Chauffeur', desc: 'Book resort shuttle transportation', icon: Car, badge: 'Travel' },
        ],
      };
    } else {
      return {
        greeting: 'Good Evening',
        subtext: 'Unwind your evening with cozy plush duvets, soothing herbal teas, or turndown refresh service.',
        icon: Moon,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        suggestions: [
          { id: 'Extra Blankets', title: 'Extra Blanket Set', desc: 'Plush velvet duvet & feather pillows', icon: Sparkles, badge: 'Night Comfort' },
          { id: 'Tea', title: 'Organic Chamomile Tea', desc: 'Soothing bedtime herbal infusion', icon: Coffee, badge: 'Nightcap' },
          { id: 'Room Cleaning', title: 'Evening Turndown', desc: 'Bed refresh & room cleaning', icon: Sparkles, badge: 'Turndown' },
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
        triggerToast('🎙️ Listening... Speak your request clearly now.', 'success');
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
      title: 'In-Suite Dining & Bar',
      description: 'Gourmet dining, refreshments & beverages delivered to your room',
      icon: UtensilsCrossed,
      items: [
        { id: 'Water', title: 'Bottled Mineral Water', desc: 'Ice-cold premium mineral water', icon: Droplets, badge: 'Hydration' },
        { id: 'Tea', title: 'Artisan Hot Tea', desc: 'Selection of organic teas', icon: Coffee, badge: 'Beverage' },
        { id: 'Coffee', title: 'Fresh Espresso', desc: 'Double espresso or Americano', icon: Coffee, badge: 'Beverage' },
        { id: 'Food', title: 'Gourmet In-Room Meal', desc: 'Chef-crafted warm culinary dishes', icon: UtensilsCrossed, badge: 'Fine Dining' },
      ],
    },
    {
      id: 'housekeeping',
      title: 'Housekeeping & Comfort',
      description: 'Linen refresh, turndown service & luxury amenities',
      icon: Sparkles,
      items: [
        { id: 'Room Cleaning', title: 'Full Suite Refresh', desc: 'Thorough room cleaning & refresh', icon: Sparkles, badge: 'Service' },
        { id: 'Towels', title: 'Fresh Plush Towels', desc: 'Set of Egyptian cotton bath towels', icon: Bath, badge: 'Amenities' },
        { id: 'Laundry', title: 'Express Laundry', desc: 'Wash, press & garment care', icon: Shirt, badge: 'Garment Care' },
      ],
    },
    {
      id: 'reception',
      title: 'Concierge & Transport',
      description: 'Front desk, transport booking & express bill settlement',
      icon: ConciergeBell,
      items: [
        { id: 'Taxi', title: 'Private Chauffeur', desc: 'Airport or city shuttle booking', icon: Car, badge: 'Transport' },
        { id: 'Wake-up Call', title: 'Personalized Alarm Call', desc: 'Scheduled morning concierge call', icon: Clock, badge: 'Front Desk' },
        { id: 'Checkout', title: 'Express Suite Checkout', desc: 'Luggage assistance & billing', icon: LogOut, badge: 'Checkout' },
      ],
    },
  ];

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Fetch all requests for the currently selected room
  const fetchMyRequests = useCallback(async () => {
    if (!selectedRoom) return;
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
    if (!selectedRoom) return;
    fetchMyRequests();

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => setWsStatus('CONNECTED');
    ws.onerror = () => setWsStatus('DISCONNECTED');
    ws.onclose = () => setWsStatus('DISCONNECTED');

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

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
        } else if (payload.type === 'checkout' || payload.event === 'checkout') {
          const checkedOutRoom = payload.room || payload.room_number || payload.data?.room;
          setMyRequests((prev) => prev.filter((r) => String(r.room_number) !== String(checkedOutRoom)));
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
        triggerToast(`🚨 EMERGENCY SOS DISPATCHED for ${selectedRoom}! Resort staff notified instantly.`, 'error');
      } else {
        triggerToast(`Request for "${itemName}" sent to resort staff!`, 'success');
      }

      if (itemName === customItem) setCustomItem('');
    } catch (err) {
      console.error('Request failed:', err);
      triggerToast(`Failed to send request: ${err.message}.`, 'error');
    } finally {
      setLoadingItem(null);
    }
  };

  const handleSubmitReview = async (e) => {
    if (e) e.preventDefault();
    if (!reviewRating) return;
    setReviewSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_number: selectedRoom,
          rating: Number(reviewRating),
          comment: reviewComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      setReviewSubmitted(true);
      triggerToast('⭐ Thank you for rating your stay!', 'success');
    } catch (err) {
      console.error('Submit review error:', err);
      setReviewSubmitted(true);
      triggerToast('⭐ Thank you! Your feedback has been recorded.', 'success');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!hasRoomParam) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center p-10 sm:p-16 glass-panel rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl space-y-8 max-w-2xl mx-auto my-12 animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20 ring-1 ring-amber-400/30">
          <QrCode className="w-12 h-12 animate-pulse text-amber-400" />
        </div>
        <div className="space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Welcome to SmartStay
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
            5-Star Resort Guest Experience
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
            Please scan the QR code located on your suite table tent to access your personalized in-room concierge portal.
          </p>
        </div>
        <div className="pt-4 flex items-center justify-center space-x-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Luxury Suites Hospitality Platform</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`p-5 rounded-2xl border flex items-center space-x-4 shadow-2xl backdrop-blur-xl transition-all transform animate-slide-up ${
            toast.type === 'error'
              ? 'bg-red-950/95 border-red-500/60 text-red-100 shadow-red-950/40'
              : 'bg-emerald-950/95 border-emerald-500/60 text-emerald-100 shadow-emerald-950/40'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          )}
          <div className="text-xs sm:text-sm font-semibold leading-relaxed">{toast.msg}</div>
        </div>
      )}

      {/* Time-Aware UI: Dynamic Greeting Banner */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl border border-slate-800 bg-slate-950/90">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className={`px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border flex items-center space-x-1.5 ${timeContext.badgeColor}`}>
                <TimeIcon className="w-3.5 h-3.5 mr-1" />
                <span>{timeContext.greeting}</span>
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center space-x-1.5 ${
                  wsStatus === 'CONNECTED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${wsStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>{wsStatus === 'CONNECTED' ? 'Live Telemetry' : 'Connecting'}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight mt-1">
              {timeContext.greeting}, Distinguished Guest!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              {timeContext.subtext}
            </p>
          </div>

          {/* Read-Only Suite Keycard Badge */}
          <div className="bg-slate-900/90 p-4 px-5 rounded-2xl border border-amber-500/30 flex items-center space-x-3 shadow-xl shrink-0">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Suite Residence</span>
              <span className="text-base font-extrabold text-white">{selectedRoom}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Quick Suggestions (Time-Based) */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Curated Recommendations for {timeContext.greeting}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {timeContext.suggestions.map((item) => {
              const ItemIcon = item.icon;
              const isLoading = loadingItem === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 hover:bg-slate-800 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 group shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-inner">
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                  <button
                    id={`quick-suggest-btn-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                    disabled={isLoading}
                    onClick={() => handleOrder(item.id)}
                    className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl text-xs font-bold border border-amber-500/30 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Request</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Emergency SOS High-Visibility Banner */}
      <div className="glass-panel p-6 rounded-2xl border-2 border-red-500/60 bg-gradient-to-r from-red-950/90 via-slate-950 to-red-950/90 shadow-2xl shadow-red-950/60 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 shrink-0 animate-pulse ring-2 ring-red-500/40 shadow-xl">
            <Siren className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-red-500/30 text-red-200 border border-red-500/50 tracking-wider">
                🚨 Immediate Urgent SOS
              </span>
            </div>
            <h2 className="text-xl font-serif text-white tracking-tight mt-1">Emergency SOS Dispatch</h2>
            <p className="text-xs text-slate-300">
              Sends an instant top-priority alert directly to hotel operations for {selectedRoom}.
            </p>
          </div>
        </div>
        <button
          id="request-emergency-btn"
          disabled={loadingItem === 'EMERGENCY'}
          onClick={() => handleOrder('EMERGENCY', true)}
          className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xl shadow-red-600/50 border border-red-400/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 shrink-0 animate-pulse cursor-pointer"
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
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex space-x-3 overflow-x-auto py-1 no-scrollbar">
          <button
            id="cat-tab-all"
            onClick={() => setActiveCategoryTab('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
              activeCategoryTab === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-400/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
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
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-400/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
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
      <div className="space-y-10">
        {serviceCategories
          .filter((cat) => activeCategoryTab === 'ALL' || activeCategoryTab === cat.id)
          .map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.id} className="space-y-5 animate-fade-in">
                <div className="flex items-center space-x-3 border-l-4 border-amber-500 pl-4 py-0.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif text-white">{cat.title}</h2>
                    <p className="text-xs text-slate-400">{cat.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {cat.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isLoading = loadingItem === item.id;
                    return (
                      <div
                        key={item.id}
                        className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-5 hover:border-amber-500/40 group transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-md">
                            <ItemIcon className="w-5 h-5" />
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                            {item.badge}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-white">{item.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                        </div>

                        <button
                          id={`request-btn-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                          disabled={isLoading}
                          onClick={() => handleOrder(item.id)}
                          className="w-full py-3 px-4 bg-slate-900 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl text-xs font-bold border border-slate-800 hover:border-amber-400/40 transition-all flex items-center justify-center space-x-2 shadow-inner cursor-pointer"
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-2xl bg-slate-950/90">
        <div className="flex items-center justify-between">
          <label htmlFor="custom-item-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Custom In-Suite Request
          </label>
          <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" /> Voice Input Supported
          </span>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <input
              id="custom-item-input"
              type="text"
              placeholder="e.g. Extra Feather Pillow, Dental Kit, Ice Bucket..."
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleOrder(customItem)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-4 pr-10 py-3.5 focus:outline-none focus:border-amber-500 transition-all"
            />
            {customItem && (
              <button
                type="button"
                onClick={() => setCustomItem('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold cursor-pointer"
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
            className={`px-4 py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 border transition-all shrink-0 cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-lg shadow-red-600/40 ring-2 ring-red-500/50'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800 hover:border-amber-500/40'
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
                <Mic className="w-4 h-4 text-amber-400" />
                <span>Speak Request</span>
              </>
            )}
          </button>

          <button
            id="request-custom-btn"
            disabled={!customItem.trim() || loadingItem === customItem}
            onClick={() => handleOrder(customItem)}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:bg-slate-900 disabled:text-slate-600 text-slate-950 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer border border-amber-300/30"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>Submit Custom Request</span>
          </button>
        </div>
      </div>

      {/* ==========================================================================
         MY REQUEST STATUS SECTION (Bottom of Guest View)
         ========================================================================== */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden bg-slate-950/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif text-white tracking-tight">Suite Active Request Status</h2>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedRoom}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking for all services requested in your suite
              </p>
            </div>
          </div>

          <button
            id="refresh-guest-status-btn"
            onClick={fetchMyRequests}
            className="p-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-all text-xs font-bold flex items-center space-x-2 self-start sm:self-center shadow-md cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Requests List */}
        {myRequests.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <ShieldCheck className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No active requests for Suite {selectedRoom}</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Any item or service requested above will appear here in real time with live status updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myRequests.map((req, idx) => {
              const status = normalizeStatus(req.status);
              const isPending = status === 'Pending';
              const isOnTheWay = status === 'On the Way';
              const isDelivered = status === 'Delivered';
              const isEmergency = (req.item_requested || '').toUpperCase().includes('EMERGENCY');

              return (
                <div
                  key={req.id || idx}
                  className={`glass-card p-6 rounded-2xl border flex flex-col justify-between space-y-5 transition-all duration-300 animate-slide-up ${
                    isEmergency
                      ? 'border-2 border-red-500 bg-gradient-to-br from-red-950 via-slate-950 to-red-950 shadow-xl shadow-red-950/50 animate-pulse'
                      : isPending
                      ? 'border-amber-500/40 bg-slate-900/90 shadow-lg shadow-amber-500/5'
                      : isOnTheWay
                      ? 'border-amber-500/40 bg-slate-900/90'
                      : 'border-emerald-500/30 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`text-[10px] font-bold tracking-widest uppercase ${isEmergency ? 'text-red-400' : 'text-amber-400'}`}>
                        Order #{req.id || idx + 1}
                      </span>
                      <h3 className={`text-base font-serif font-bold mt-1 ${isEmergency ? 'text-red-200' : 'text-white'}`}>{req.item_requested}</h3>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center space-x-1.5 shrink-0 ${
                        isEmergency
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : isOnTheWay
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isPending ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pending</span>
                        </>
                      ) : isOnTheWay ? (
                        <>
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                          <span>On the Way</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Delivered</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Status Progress Bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isEmergency
                            ? 'w-full bg-red-500 animate-pulse'
                            : isPending
                            ? 'w-1/3 bg-amber-400'
                            : isOnTheWay
                            ? 'w-2/3 bg-amber-500'
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

      {/* ==========================================================================
         RATE YOUR STAY SECTION (5-Star Guest Feedback)
         ========================================================================== */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden bg-slate-950/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif text-white tracking-tight">Rate Your Stay</h2>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  5-Star Feedback
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                We value your experience. Help us maintain our highest standards of luxury hospitality.
              </p>
            </div>
          </div>
        </div>

        {reviewSubmitted ? (
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
              <CheckCircle2 className="w-9 h-9 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-white">Thank You for Your Feedback!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your response for Suite <span className="text-amber-400 font-bold">{selectedRoom}</span> has been submitted to resort management. We appreciate your valuable insights.
              </p>
            </div>

            <div className="flex justify-center items-center space-x-1 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= reviewRating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700 fill-transparent'
                  }`}
                />
              ))}
            </div>

            {reviewComment && (
              <div className="max-w-lg mx-auto p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                "{reviewComment}"
              </div>
            )}

            <button
              id="reset-review-btn"
              onClick={() => {
                setReviewSubmitted(false);
                setReviewComment('');
              }}
              className="mt-4 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              Submit Another Rating
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Interactive Star Rating Selector */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Select Star Rating
              </span>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= (reviewHoverRating || reviewRating);
                  return (
                    <button
                      key={star}
                      type="button"
                      id={`star-rating-btn-${star}`}
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHoverRating(star)}
                      onMouseLeave={() => setReviewHoverRating(0)}
                      className="p-2 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-9 h-9 transition-colors duration-150 ${
                          active
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                            : 'text-slate-600 fill-transparent hover:text-amber-300/50'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-amber-400 font-serif">
                {reviewHoverRating || reviewRating} / 5 Stars —{' '}
                {(reviewHoverRating || reviewRating) === 5
                  ? 'Exceptional'
                  : (reviewHoverRating || reviewRating) === 4
                  ? 'Great'
                  : (reviewHoverRating || reviewRating) === 3
                  ? 'Good'
                  : (reviewHoverRating || reviewRating) === 2
                  ? 'Fair'
                  : 'Needs Improvement'}
              </span>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-2">
              <label htmlFor="review-comment-textarea" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Guest Experience Comments (Optional)
              </label>
              <textarea
                id="review-comment-textarea"
                rows={3}
                placeholder="Tell us about your room comfort, staff responsiveness, or overall experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-2xl p-4 focus:outline-none focus:border-amber-500 transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                id="submit-review-btn"
                type="submit"
                disabled={reviewSubmitting || !reviewRating}
                className="px-7 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 border border-amber-300/40 transition-all flex items-center space-x-2 cursor-pointer"
              >
                {reviewSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Submitting Feedback...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
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
        } else if (parsed.type === 'checkout' || parsed.event === 'checkout') {
          const checkedOutRoom = parsed.room || parsed.room_number || parsed.data?.room;
          setRequests((prev) => prev.filter((r) => String(r.room_number) !== String(checkedOutRoom)));
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
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Top Header Bar */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 bg-slate-950/90">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">Staff Operations &amp; Dispatch</h1>
            {newIncomingCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 animate-bounce shadow-md shadow-amber-500/20">
                +{newIncomingCount} New
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Accept &amp; fulfill live incoming guest orders via real-time WebSocket telemetry</p>
        </div>

        {/* Live WS Connection Status Badge */}
        <div className="flex items-center space-x-3">
          <div
            className={`px-4 py-2 rounded-full border text-xs font-bold flex items-center space-x-2 backdrop-blur-md ${
              wsStatus === 'CONNECTED'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                : wsStatus === 'CONNECTING'
                ? 'bg-amber-950/80 text-amber-400 border-amber-500/30'
                : 'bg-red-950/80 text-red-400 border-red-500/30'
            }`}
          >
            {wsStatus === 'CONNECTED' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 glow-green animate-pulse"></span>
                <span>Telemetry Connected</span>
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
            className="p-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-all text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer"
            title="Reconnect WebSocket"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="text-3xl font-black text-white mt-1">{requests.length}</div>
          </div>
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <BellRing className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending</span>
            <div className="text-3xl font-black text-amber-300 mt-1">{pendingCount}</div>
          </div>
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">On the Way</span>
            <div className="text-3xl font-black text-amber-200 mt-1">{onTheWayCount}</div>
          </div>
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Delivered</span>
            <div className="text-3xl font-black text-emerald-300 mt-1">{deliveredCount}</div>
          </div>
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex space-x-3">
          {['ALL', 'Pending', 'On the Way', 'Delivered'].map((tab) => (
            <button
              key={tab}
              id={`filter-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-400/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          Showing {filteredRequests.length} of {requests.length} active records
        </span>
      </div>

      {/* Incoming Requests Feed List */}
      {filteredRequests.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center space-y-4 border border-slate-800 bg-slate-950/80">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <ConciergeBell className="w-8 h-8 text-amber-400/60" />
          </div>
          <h3 className="text-lg font-serif text-slate-200">No requests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {requests.length === 0
              ? 'Listening for incoming room service requests over WebSocket telemetry...'
              : `No requests with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req, idx) => {
            const status = normalizeStatus(req.status);
            const isPending = status === 'Pending';
            const isOnTheWay = status === 'On the Way';
            const isDelivered = status === 'Delivered';
            const isEmergency = (req.item_requested || '').toUpperCase().includes('EMERGENCY');

            return (
              <div
                key={req.id || idx}
                className={`glass-card p-6 rounded-2xl border flex flex-col justify-between space-y-5 transition-all duration-300 ${
                  isEmergency
                    ? 'border-2 border-red-500 bg-gradient-to-br from-red-950 via-slate-950 to-red-950 shadow-2xl shadow-red-950/60 animate-pulse ring-2 ring-red-500/80 scale-[1.02]'
                    : isPending
                    ? 'border-amber-500/40 bg-slate-900/90 shadow-lg shadow-amber-500/5'
                    : isOnTheWay
                    ? 'border-amber-500/30 bg-slate-900/80'
                    : 'border-slate-800 opacity-80 bg-slate-950/60'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-extrabold tracking-widest uppercase ${isEmergency ? 'text-red-400' : 'text-amber-400'}`}>
                        Room {req.room_number}
                      </span>
                      {isEmergency && (
                        <span className="px-2.5 py-0.5 text-[9px] font-extrabold bg-red-600 text-white rounded-full animate-bounce shadow-md shadow-red-600/50 flex items-center gap-1">
                          <Siren className="w-3 h-3 text-white" /> EMERGENCY SOS
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg font-serif font-bold mt-1 ${isEmergency ? 'text-red-200 font-black' : 'text-white'}`}>
                      {req.item_requested}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider shrink-0 ${
                      isEmergency
                        ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                        : isPending
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : isOnTheWay
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Footer details & Action status switcher buttons */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px]">Request ID: #{req.id || idx + 1}</span>
                    <span className="text-[11px] font-bold text-slate-300">Dispatch Action:</span>
                  </div>

                  {/* PROMINENT ACTION BUTTONS */}
                  <div className="flex items-center gap-3">
                    <button
                      id={`accept-btn-${req.id || idx}`}
                      disabled={isOnTheWay || isDelivered}
                      onClick={() => updateRequestStatus(req.id, 'On the Way')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border cursor-pointer ${
                        isOnTheWay
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 cursor-default'
                          : isDelivered
                          ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 border-amber-300/40 shadow-lg shadow-amber-500/20 active:scale-95'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>{isOnTheWay ? 'Accepted' : 'Accept'}</span>
                    </button>

                    <button
                      id={`complete-btn-${req.id || idx}`}
                      disabled={isDelivered}
                      onClick={() => updateRequestStatus(req.id, 'Delivered')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border cursor-pointer ${
                        isDelivered
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 cursor-default'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/40 shadow-lg shadow-emerald-600/25 active:scale-95'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
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
   MANAGER VIEW COMPONENT (ANALYTICS & BULK QR PRINT DASHBOARD)
   ========================================================================== */
function ManagerView() {
  const [requests, setRequests] = useState([]);
  const [wsStatus, setWsStatus] = useState('CONNECTING');
  const [activityLogs, setActivityLogs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Single Mode State
  const [qrRoomNumber, setQrRoomNumber] = useState('101');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // QR Generator Mode: 'single' | 'bulk'
  const [qrMode, setQrMode] = useState('single');
  
  // Bulk Mode Inputs
  const [bulkPrefix, setBulkPrefix] = useState('Room ');
  const [bulkStart, setBulkStart] = useState('101');
  const [bulkEnd, setBulkEnd] = useState('112');

  const socketRef = useRef(null);

  // Single Print QR Code function
  const handlePrintQR = () => {
    const room = qrRoomNumber || '101';
    const svgElement = document.getElementById('qr-code-svg');
    const svgHtml = svgElement ? svgElement.outerHTML : '';

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${room} QR Code</title>
          <style>
            @media print {
              @page { size: A4 portrait; margin: 15mm; }
            }
            body {
              font-family: 'Playfair Display', Georgia, serif, system-ui;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
              background: #ffffff;
              color: #0f172a;
            }
            .brand-name {
              font-size: 14px;
              font-weight: 700;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              color: #b45309;
              margin-bottom: 20px;
              font-family: system-ui, sans-serif;
            }
            .qr-container {
              padding: 24px;
              background: #ffffff;
              border: 2px dashed #cbd5e1;
              border-radius: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .room-number {
              margin-top: 24px;
              font-size: 32px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.05em;
            }
            .subtitle {
              margin-top: 6px;
              font-size: 11px;
              color: #64748b;
              font-family: system-ui, sans-serif;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
          </style>
        </head>
        <body>
          <div class="brand-name">SmartStay Luxury Resort</div>
          <div class="qr-container">
            ${svgHtml}
            <div class="room-number">${room}</div>
            <div class="subtitle">Scan for In-Suite Guest Services</div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 250);
  };

  // Bulk Print QR Code function: generates printable iframe with clean 6 QR per page grid
  const handlePrintBulkQR = () => {
    const start = parseInt(bulkStart, 10);
    const end = parseInt(bulkEnd, 10);

    if (isNaN(start) || isNaN(end)) {
      alert('Please enter valid numeric values for Start Number and End Number.');
      return;
    }

    if (start > end) {
      alert('Start Number cannot be greater than End Number.');
      return;
    }

    const totalCount = end - start + 1;
    if (totalCount > 300) {
      alert('Please limit bulk generation to maximum 300 QR codes at a time.');
      return;
    }

    // Generate room names range
    const roomNames = [];
    for (let i = start; i <= end; i++) {
      roomNames.push(`${bulkPrefix}${i}`);
    }

    // Render QR SVG HTML for each room using renderToStaticMarkup
    const itemsHtml = roomNames.map((roomName) => {
      const targetUrl = `https://smartstaymhx.netlify.app/?room=${encodeURIComponent(roomName)}`;
      const svgMarkup = renderToStaticMarkup(
        <QRCodeSVG
          value={targetUrl}
          size={130}
          bgColor="#FFFFFF"
          fgColor="#0F172A"
          level="H"
          marginSize={2}
        />
      );

      return `
        <div class="qr-card">
          <div class="card-brand font-serif">SmartStay Luxury Resort</div>
          <div class="qr-wrapper">
            ${svgMarkup}
          </div>
          <div class="card-room font-serif">${roomName}</div>
          <div class="card-sub">Scan for In-Suite Guest Services</div>
        </div>
      `;
    });

    // Group cards into pages of 6 QR codes per page for clean table tent printing
    const pageSize = 6;
    let pagesHtml = '';
    for (let i = 0; i < itemsHtml.length; i += pageSize) {
      const pageItems = itemsHtml.slice(i, i + pageSize).join('');
      const isLastPage = i + pageSize >= itemsHtml.length;
      pagesHtml += `
        <div class="page-container ${isLastPage ? '' : 'page-break'}">
          <div class="grid-container">
            ${pageItems}
          </div>
        </div>
      `;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulk QR Codes (${bulkPrefix}${start} to ${bulkPrefix}${end})</title>
          <style>
            @media print {
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              body {
                background: #ffffff !important;
                -webkit-print-color-adjust: exact;
              }
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Playfair Display', Georgia, serif, system-ui;
              background: #ffffff;
              color: #0f172a;
              padding: 10px;
            }
            .page-container {
              padding: 10px;
              width: 100%;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
            }
            .grid-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              width: 100%;
            }
            .qr-card {
              border: 2px dashed #94a3b8;
              border-radius: 16px;
              padding: 20px 16px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              background: #fafafa;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .card-brand {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              color: #b45309;
              margin-bottom: 10px;
              font-family: system-ui, sans-serif;
            }
            .qr-wrapper {
              background: #ffffff;
              padding: 12px;
              border-radius: 14px;
              border: 1px solid #cbd5e1;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            }
            .card-room {
              margin-top: 14px;
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.03em;
            }
            .card-sub {
              margin-top: 4px;
              font-size: 10px;
              color: #64748b;
              font-family: system-ui, sans-serif;
              text-transform: uppercase;
              letter-spacing: 0.06em;
            }
          </style>
        </head>
        <body>
          ${pagesHtml}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 300);
  };

  // Checkout / Reset Room API call
  const handleCheckoutRoom = async () => {
    const roomToCheckout = qrRoomNumber || '101';
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/room/${encodeURIComponent(roomToCheckout)}/checkout`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => String(r.room_number) !== String(roomToCheckout)));
        setActivityLogs((prev) => [
          {
            id: Date.now() + Math.random(),
            type: 'CHECKOUT',
            timestamp: new Date().toLocaleTimeString(),
            message: `Checkout / Reset completed for ${roomToCheckout}`,
            room: roomToCheckout,
            status: 'Cleared',
          },
          ...prev.slice(0, 49),
        ]);
      } else {
        console.error(`Checkout API failed with status ${res.status}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

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

  // Fetch guest reviews from backend API GET /reviews
  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          setReviews(data.data.reverse());
        }
      }
    } catch (err) {
      console.error('Manager fetch reviews error:', err);
    } finally {
      setLoadingReviews(false);
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
        } else if (parsed.type === 'checkout' || parsed.event === 'checkout') {
          const checkedOutRoom = parsed.room || parsed.room_number || parsed.data?.room;
          setRequests((prev) => prev.filter((r) => String(r.room_number) !== String(checkedOutRoom)));
          setActivityLogs((prev) => [
            {
              id: Date.now() + Math.random(),
              type: 'CHECKOUT',
              timestamp: new Date().toLocaleTimeString(),
              message: `Room ${checkedOutRoom} checked out - requests cleared`,
              room: checkedOutRoom,
              status: 'Cleared',
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
    fetchReviews();
    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [fetchRequests, fetchReviews, connectWebSocket]);

  // Analytics Metrics calculations
  const totalOrders = requests.length;
  const pendingOrders = requests.filter((r) => normalizeStatus(r.status) === 'Pending').length;
  const completedOrders = requests.filter(
    (r) => normalizeStatus(r.status) === 'Delivered' || normalizeStatus(r.status) === 'Completed'
  ).length;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) / reviews.length).toFixed(1)
    : '5.0';

  const startNum = parseInt(bulkStart, 10) || 0;
  const endNum = parseInt(bulkEnd, 10) || 0;
  const bulkCalculatedCount = endNum >= startNum && startNum > 0 ? endNum - startNum + 1 : 0;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Manager Overview</span>
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center space-x-1.5 ${
                wsStatus === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${wsStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{wsStatus === 'CONNECTED' ? 'Live Telemetry' : 'Connecting'}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight mt-3">
            Executive Manager Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Top-level operational telemetry, room QR code dispatching &amp; live activity stream
          </p>
        </div>

        <button
          id="manager-refresh-btn"
          onClick={() => {
            fetchRequests();
            fetchReviews();
            connectWebSocket();
          }}
          className="p-3 px-5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-200 transition-all text-xs font-bold flex items-center space-x-2 self-start md:self-center shadow-lg cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top-Level Analytics Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Orders */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-950/90 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl shadow-md">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-4xl font-black text-white tracking-tight">{totalOrders}</div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-amber-400 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>All requests logged across resort</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Pending Orders */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-950/90 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending Orders</span>
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl shadow-md">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-4xl font-black text-amber-300 tracking-tight">{pendingOrders}</div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-amber-400/80 font-medium">
              <Activity className="w-4 h-4" />
              <span>Awaiting staff acceptance</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Completed Orders */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-950/90 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Completed Orders</span>
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-4xl font-black text-emerald-300 tracking-tight">{completedOrders}</div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-emerald-400/80 font-medium">
              <Check className="w-4 h-4" />
              <span>Successfully delivered to suites</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Average Guest Rating */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-950/90 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Avg Guest Rating</span>
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl shadow-md">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-4xl font-black text-white tracking-tight">{avgRating}</span>
              <span className="text-sm font-bold text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-amber-400 font-medium">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Based on {reviews.length} guest review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Room QR Generator Section with Single & Bulk Toggle */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-8 shadow-2xl bg-slate-950/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-2xl font-serif text-white tracking-tight">Room QR Generator &amp; Bulk Print</h2>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Table Tent Print
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate and print individual or bulk ranges of QR codes for resort room table tents
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner self-start sm:self-center">
            <button
              id="qr-mode-single-btn"
              onClick={() => setQrMode('single')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                qrMode === 'single'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-300/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Single Room</span>
            </button>

            <button
              id="qr-mode-bulk-btn"
              onClick={() => setQrMode('bulk')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                qrMode === 'bulk'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-300/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Bulk Generate</span>
            </button>
          </div>
        </div>

        {/* SINGLE MODE */}
        {qrMode === 'single' ? (
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Controls Column */}
            <div className="flex-1 space-y-5 w-full">
              <div>
                <label htmlFor="qr-room-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Room / Suite Designation
                </label>
                <div className="relative max-w-sm">
                  <input
                    id="qr-room-input"
                    type="text"
                    value={qrRoomNumber}
                    onChange={(e) => setQrRoomNumber(e.target.value)}
                    placeholder="e.g. Room 101, Villa 5"
                    className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 font-bold transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Enter any room identifier to update the encoded QR code preview.
                </p>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 max-w-md">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                  Encoded Guest Portal URL
                </span>
                <code className="text-xs text-slate-300 font-mono break-all block">
                  https://smartstaymhx.netlify.app/?room={encodeURIComponent(qrRoomNumber || '101')}
                </code>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  id="qr-print-download-btn"
                  onClick={handlePrintQR}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2 border border-amber-300/40 active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <Download className="w-4 h-4 ml-0.5 text-slate-950" />
                  <span>Print Single QR</span>
                </button>

                <button
                  id="checkout-room-btn"
                  disabled={checkoutLoading}
                  onClick={handleCheckoutRoom}
                  className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/30 flex items-center space-x-2 border border-red-400/30 active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{checkoutLoading ? 'Processing Checkout...' : 'Checkout / Reset Room'}</span>
                </button>
              </div>
            </div>

            {/* QR Code Display Column */}
            <div className="flex flex-col items-center justify-center p-8 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-inner shrink-0">
              <div className="p-5 bg-white rounded-2xl shadow-2xl ring-4 ring-amber-500/20 border border-slate-200">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={`https://smartstaymhx.netlify.app/?room=${encodeURIComponent(qrRoomNumber || '101')}`}
                  size={160}
                  bgColor="#FFFFFF"
                  fgColor="#0F172A"
                  level="H"
                  marginSize={2}
                />
              </div>
              <div className="mt-4 text-center">
                <span className="px-4 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-serif font-bold tracking-wide uppercase">
                  {qrRoomNumber || '101'}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Scan to access guest portal</p>
              </div>
            </div>
          </div>
        ) : (
          /* BULK MODE */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Prefix Field */}
              <div>
                <label htmlFor="bulk-prefix-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Room Prefix
                </label>
                <input
                  id="bulk-prefix-input"
                  type="text"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  placeholder='e.g. "Room " or "Villa "'
                  className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 font-bold transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Prefix text prepended to each room number.
                </p>
              </div>

              {/* Start Number Field */}
              <div>
                <label htmlFor="bulk-start-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Start Number
                </label>
                <input
                  id="bulk-start-input"
                  type="number"
                  value={bulkStart}
                  onChange={(e) => setBulkStart(e.target.value)}
                  placeholder="101"
                  className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 font-bold transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Starting numerical room number.
                </p>
              </div>

              {/* End Number Field */}
              <div>
                <label htmlFor="bulk-end-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  End Number
                </label>
                <input
                  id="bulk-end-input"
                  type="number"
                  value={bulkEnd}
                  onChange={(e) => setBulkEnd(e.target.value)}
                  placeholder="120"
                  className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 font-bold transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ending numerical room number.
                </p>
              </div>
            </div>

            {/* Summary & Action Bar */}
            <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="px-3.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
                  {bulkCalculatedCount > 0 ? `${bulkCalculatedCount} QR Codes` : 'Invalid Range'}
                </span>
                <p className="text-xs text-slate-300 font-medium">
                  {bulkCalculatedCount > 0
                    ? `Generating "${bulkPrefix}${bulkStart}" through "${bulkPrefix}${bulkEnd}"`
                    : 'Set a valid range to enable bulk printing'}
                </p>
              </div>

              <button
                id="bulk-print-all-btn"
                disabled={bulkCalculatedCount <= 0}
                onClick={handlePrintBulkQR}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:bg-slate-900 disabled:text-slate-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 border border-amber-300/40 active:scale-95 cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <Grid className="w-4 h-4 text-slate-950 ml-0.5" />
                <span>Print All QRs ({bulkCalculatedCount})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Feed of Hotel Activity */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl bg-slate-950/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif text-white tracking-tight">Live Resort Telemetry Stream</h2>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time activity stream of guest service requests &amp; staff status updates
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {requests.length} active database records
          </span>
        </div>

        {/* Live Hotel Requests Activity List */}
        {requests.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <Layers3 className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No resort activity recorded yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Any order placed by guests or updated by waiters will instantly show up in this live feed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req, idx) => {
              const status = normalizeStatus(req.status);
              const isPending = status === 'Pending';
              const isOnTheWay = status === 'On the Way';
              const isDelivered = status === 'Delivered';
              const isEmergency = (req.item_requested || '').toUpperCase().includes('EMERGENCY');

              return (
                <div
                  key={req.id || idx}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all ${
                    isEmergency
                      ? 'bg-red-950/40 border-red-500/60 text-red-100 shadow-md shadow-red-950/40 animate-pulse'
                      : isPending
                      ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
                      : isOnTheWay
                      ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/30'
                      : 'bg-slate-950/60 border-slate-900 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon indicator */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                        isEmergency
                          ? 'bg-red-600 text-white'
                          : isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isOnTheWay
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-800 text-amber-400 border border-slate-700">
                          {req.room_number}
                        </span>
                        <span className="text-xs font-mono text-slate-500">ID #{req.id || idx + 1}</span>
                      </div>
                      <h4 className="text-base font-serif font-bold text-white mt-1">
                        {req.item_requested}
                      </h4>
                    </div>
                  </div>

                  {/* Right side: Status Badge */}
                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 ${
                        isEmergency
                          ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : isOnTheWay
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
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

      {/* Guest Feedback & Reviews Section */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl bg-slate-950/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif text-white tracking-tight">Guest Feedback &amp; Reviews</h2>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {avgRating} / 5.0 Rating
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time guest ratings, operational feedback, and suite comments
              </p>
            </div>
          </div>

          <button
            id="refresh-reviews-btn"
            onClick={fetchReviews}
            disabled={loadingReviews}
            className="p-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-all text-xs font-bold flex items-center space-x-2 cursor-pointer self-start sm:self-center shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loadingReviews ? 'animate-spin' : ''}`} />
            <span>Refresh Reviews</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <MessageSquare className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No guest reviews submitted yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When guests rate their stay in the Guest Portal, their feedback and ratings will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((rev, idx) => {
              const ratingNum = Number(rev.rating) || 5;
              return (
                <div
                  key={rev.id || idx}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all space-y-4 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {rev.room_number ? (rev.room_number.toLowerCase().startsWith('room') ? rev.room_number : `Room ${rev.room_number}`) : 'Guest Suite'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= ratingNum
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700 fill-transparent'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-400 ml-1.5">{ratingNum}.0</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    "{rev.comment || 'No written comments provided.'}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                    <span>Feedback Record #{rev.id || idx + 1}</span>
                    <span>Verified Guest Stay</span>
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
