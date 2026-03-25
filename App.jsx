import React, { useState, useEffect, useRef } from "react";
import {
  Heart, Clock, MapPin, Zap, Lock, List, ImageIcon, Scan, Smartphone, X, Plus, Trash2, Camera, Terminal
} from "lucide-react";
import { db, storage } from "./firebaseConfig";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- COMPONENTES UI ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(168,85,247,0.15)] ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary" }) => {
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/50 w-full",
    ghost: "text-gray-400 hover:text-white hover:bg-white/10 px-2",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30 px-2",
  };
  return (
    <button onClick={onClick} className={`py-3 px-4 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${variants[variant]}`}>
      {children}
    </button>
  );
};

// --- APPS INTERNAS ---
const SecretBoxApp = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "secrets"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const saveMessage = async () => {
    if (!newMessage.trim()) return;
    await addDoc(collection(db, "secrets"), { text: newMessage, createdAt: serverTimestamp() });
    setNewMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400">Secretos</h2>
        <Button variant="ghost" onClick={onClose}><X /></Button>
      </div>
      <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="w-full bg-zinc-900 text-white p-4 rounded-xl h-32 mb-4" placeholder="Escribe algo..." />
      <Button onClick={saveMessage}>Guardar</Button>
      <div className="flex-1 overflow-y-auto mt-6 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 relative">
            <p className="text-gray-300">{msg.text}</p>
            <button onClick={() => deleteDoc(doc(db, "secrets", msg.id))} className="absolute top-2 right-2 text-red-500"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [screen, setScreen] = useState("cover");
  const [activeApp, setActiveApp] = useState(null);
  const [time, setTime] = useState({});

  useEffect(() => {
    const start = new Date("2024-05-01T00:00:00");
    const timer = setInterval(() => {
      const diff = new Date() - start;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (screen === "cover") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <Heart className="text-red-500 animate-pulse mb-6" size={64} fill="currentColor" />
        <h1 className="text-4xl font-bold text-white mb-8">Feliz San Valentín</h1>
        <Button onClick={() => setScreen("dashboard")}><Smartphone /> ENTRAR</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {activeApp === "secrets" && <SecretBoxApp onClose={() => setActiveApp(null)} />}
      
      <header className="mb-8">
        <h2 className="text-3xl font-bold">Hola, Jhon</h2>
        <p className="text-purple-400">Contador de Amor:</p>
      </header>

      <Card className="mb-8 border-t-4 border-purple-500">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-mono">{time.days}</p><p className="text-xs text-gray-500">DÍAS</p></div>
          <div><p className="text-2xl font-mono">{time.hours}</p><p className="text-xs text-gray-500">HRS</p></div>
          <div><p className="text-2xl font-mono">{time.minutes}</p><p className="text-xs text-gray-500">MIN</p></div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => setActiveApp("secrets")} className="bg-zinc-900 p-4 rounded-2xl flex flex-col items-center gap-2">
          <Lock className="text-purple-400" /> <span className="text-xs">Secretos</span>
        </button>
      </div>
    </div>
  );
}import React, { useState, useEffect, useRef } from "react";
import {
  Heart, Clock, MapPin, Zap, Lock, Unlock, Music, Infinity, ChevronRight,
  Terminal, Play, Camera, List, ImageIcon, Scan, UserCheck, Smartphone,
  X, Plus, Trash2, Maximize2, Volume2, VolumeX, Film,
} from "lucide-react";

// --- CONEXIÓN A FIREBASE ---
import { db, storage } from "./firebaseConfig";
import { 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- COMPONENTES UI REUTILIZABLES ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(168,85,247,0.15)] ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary", className = "" }) => {
  const baseStyle = "py-3 px-4 rounded-lg font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/50 hover:shadow-purple-900/80 w-full",
    outline: "border border-purple-500 text-purple-400 hover:bg-purple-900/20 w-full",
    ghost: "text-gray-400 hover:text-white hover:bg-white/10",
    danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30",
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// --- PANTALLA DE ESCÁNER FACIAL ---
const FaceScanScreen = ({ onVerified }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        setPermission("granted");
        if (videoRef.current) videoRef.current.srcObject = stream;
        setTimeout(() => setScanning(false), 3500);
        setTimeout(onVerified, 4500);
      })
      .catch(() => {
        setPermission("denied");
        setTimeout(() => setScanning(false), 3500);
        setTimeout(onVerified, 4500);
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onVerified]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      <div className="relative w-64 h-64 border-2 border-green-500/50 rounded-full overflow-hidden mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
        {permission === "granted" ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80 filter grayscale contrast-125" />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <Scan className="w-24 h-24 text-green-500 animate-pulse" />
          </div>
        )}
        {scanning && <div className="absolute top-0 left-0 w-full h-2 bg-green-500/80 shadow-[0_0_20px_#22c55e] animate-[scan_2s_linear_infinite]"></div>}
      </div>
      <div className="text-center z-10">
        <p className="text-green-500 animate-pulse text-lg tracking-widest">{scanning ? "ESCANENDO ROSTRO..." : "IDENTIDAD CONFIRMADA"}</p>
      </div>
    </div>
  );
};

// --- APPS INTERNAS (CONECTADAS A FIREBASE) ---

const WishlistApp = ({ onClose }) => {
  const [wishes, setWishes] = useState([]);
  const [newWish, setNewWish] = useState("");

  useEffect(() => {
    const q = query(collection(db, "wishes"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setWishes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const addWish = async () => {
    if (!newWish.trim()) return;
    await addDoc(collection(db, "wishes"), {
      text: newWish,
      completed: false,
      createdAt: serverTimestamp()
    });
    setNewWish("");
  };

  const toggleWish = async (id, currentStatus) => {
    await updateDoc(doc(db, "wishes", id), { completed: !currentStatus });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2"><List /> Deseos</h2>
        <Button variant="ghost" onClick={onClose} className="!w-auto"><X /></Button>
      </div>
      <div className="flex gap-2 mb-6">
        <input type="text" value={newWish} onChange={(e) => setNewWish(e.target.value)} placeholder="Nuevo deseo..." className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none" />
        <Button onClick={addWish} className="!w-auto bg-green-600"><Plus /></Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {wishes.map((wish) => (
          <div key={wish.id} className="flex items-center gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <input type="checkbox" checked={wish.completed} onChange={() => toggleWish(wish.id, wish.completed)} className="w-5 h-5 accent-green-500" />
            <span className={`flex-1 ${wish.completed ? "line-through text-gray-500" : "text-white"}`}>{wish.text}</span>
            <button onClick={() => deleteDoc(doc(db, "wishes", wish.id))} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SecretBoxApp = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "secrets"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const saveMessage = async () => {
    if (!newMessage.trim()) return;
    await addDoc(collection(db, "secrets"), {
      text: newMessage,
      date: new Date().toLocaleDateString(),
      createdAt: serverTimestamp()
    });
    setNewMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2"><Lock /> Secretos</h2>
        <Button variant="ghost" onClick={onClose} className="!w-auto"><X /></Button>
      </div>
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-4">
        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe lo que sientes..." className="w-full bg-transparent text-white outline-none h-32 resize-none" />
        <div className="flex justify-end mt-2"><Button onClick={saveMessage} className="!w-auto text-sm px-6">Guardar</Button></div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50 relative group">
            <p className="text-gray-300 text-sm">{msg.text}</p>
            <p className="text-xs text-gray-600 mt-2 text-right">{msg.date}</p>
            <button onClick={() => deleteDoc(doc(db, "secrets", msg.id))} className="absolute top-2 right-2 text-red-500/50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const GalleryApp = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      await addDoc(collection(db, "gallery"), {
        src: url,
        type: file.type.startsWith("video/") ? "video" : "image",
        createdAt: serverTimestamp()
      });
    } catch (error) { console.error(error); }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2"><ImageIcon /> Galería</h2>
        <Button variant="ghost" onClick={onClose} className="!w-auto"><X /></Button>
      </div>
      <div className="grid grid-cols-2 gap-4 auto-rows-[150px] overflow-y-auto pb-20">
        <label className="border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer bg-zinc-900/30">
          {uploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : <><Camera /><span className="text-xs font-bold mt-2">SUBIR</span></>}
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
        </label>
        {items.map((item) => (
          <div key={item.id} className="rounded-xl overflow-hidden border border-zinc-800 relative group bg-zinc-900">
            {item.type === "video" ? <video src={item.src} className="w-full h-full object-cover" muted loop playsInline onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} /> : <img src={item.src} className="w-full h-full object-cover" alt="Memory" />}
            <button onClick={() => deleteDoc(doc(db, "gallery", item.id))} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [screen, setScreen] = useState("cover");
  const [timeTogether, setTimeTogether] = useState({});
  const [activeModule, setActiveModule] = useState(null);
  const [activeApp, setActiveApp] = useState(null);
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const startDate = new Date("2024-05-01T00:00:00");
    const timer = setInterval(() => {
      const now = new Date();
      const diff = now - startDate;
      setTimeTogether({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (screen === "cover") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden font-serif">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
        <div className="z-10 space-y-8">
          <Heart className="w-16 h-16 text-red-500 fill-current mx-auto animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight">Feliz San Valentín</h1>
          <button onClick={() => setScreen("facescan")} className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold tracking-widest flex items-center gap-2 mx-auto">
            <Smartphone className="w-5 h-5" /> INICIAR APP
          </button>
        </div>
      </div>
    );
  }

  if (screen === "facescan") return <FaceScanScreen onVerified={() => { setScreen("loading"); setTimeout(() => setScreen("dashboard"), 3000); }} />;

  if (screen === "loading") return <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-mono text-green-500"><p className="animate-pulse tracking-widest">SINCRONIZANDO CORAZONES...</p></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 overflow-x-hidden font-sans">
      <audio ref={audioRef} src="techno.mp3" loop />
      {activeApp === "wishlist" && <WishlistApp onClose={() => setActiveApp(null)} />}
      {activeApp === "secrets" && <SecretBoxApp onClose={() => setActiveApp(null)} />}
      {activeApp === "gallery" && <GalleryApp onClose={() => setActiveApp(null)} />}

      <div className="relative w-full h-64 overflow-hidden border-b border-purple-500/20">
        <img src="image_ba08ca.jpg" className="w-full h-full object-cover opacity-60" alt="Cover" />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <h2 className="text-4xl font-bold tracking-tight text-white">Hola, Jhon</h2>
          <p className="text-purple-400 font-bold">¡Por una vida juntos!</p>
        </div>
      </div>

      <div className="px-5 space-y-6 mt-6">
        <Card className="relative overflow-hidden border-t-4 border-t-purple-500">
          <h3 className="text-xs uppercase text-gray-400 font-bold mb-6 tracking-wider">TIEMPO EN EJECUCIÓN</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[ { val: timeTogether.days, label: "DÍAS" }, { val: timeTogether.hours, label: "HRS" }, { val: timeTogether.minutes, label: "MIN" }, { val: timeTogether.seconds, label: "SEG" } ].map((item, idx) => (
              <div key={idx} className="bg-black/40 border border-white/10 p-3 rounded-lg flex flex-col">
                <span className="text-lg font-bold font-mono text-white">{item.val || "00"}</span>
                <span className="text-[9px] text-gray-500 font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          {[ {id: 'gallery', icon: ImageIcon, color: 'blue', label: 'Galería'}, {id: 'wishlist', icon: List, color: 'green', label: 'Deseos'}, {id: 'secrets', icon: Lock, color: 'purple', label: 'Secretos'} ].map(app => (
            <button key={app.id} onClick={() => setActiveApp(app.id)} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-zinc-800 transition-colors">
              <div className={`w-10 h-10 rounded-full bg-${app.color}-500/10 text-${app.color}-400 flex items-center justify-center`}>
                <app.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-gray-400">{app.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-zinc-950 rounded-lg border border-dashed border-zinc-800 font-mono text-[10px] text-gray-500">
          <div className="flex items-center gap-2 mb-3 text-green-500"><Terminal className="w-3 h-3" /><span className="font-bold tracking-widest">SYSTEM LOGS</span></div>
          <p>&gt; Connection: Firebase Cloud Established.</p>
          <p className="text-purple-400">&gt; Encryption: End-to-End Active.</p>
        </div>
      </div>
    </div>
  );
}
