import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Clock,
  MapPin,
  Zap,
  Lock,
  Unlock,
  Music,
  Infinity,
  ChevronRight,
  Terminal,
  Play,
  Camera,
  List,
  ImageIcon,
  Scan,
  UserCheck,
  Smartphone,
  X,
  Plus,
  Trash2,
  Maximize2,
  Volume2,
  VolumeX,
  Film,
} from "lucide-react";
// Importamos la conexión a nuestra base de datos
import { db, storage } from "./firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// --- COMPONENTES UI ---
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(168,85,247,0.15)] ${className}`}
  >
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary", className = "" }) => {
  const baseStyle =
    "py-3 px-4 rounded-lg font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/50 hover:shadow-purple-900/80 w-full",
    outline:
      "border border-purple-500 text-purple-400 hover:bg-purple-900/20 w-full",
    ghost: "text-gray-400 hover:text-white hover:bg-white/10",
    danger:
      "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const TypewriterText = ({ text, delay = 50 }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);
  return <span>{displayedText}</span>;
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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover opacity-80 filter grayscale contrast-125"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <Scan className="w-24 h-24 text-green-500 animate-pulse" />
          </div>
        )}

        {scanning && (
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500/80 shadow-[0_0_20px_#22c55e] animate-[scan_2s_linear_infinite]"></div>
        )}

        <div className="absolute inset-0 border-[4px] border-t-green-500 border-b-green-500 border-l-transparent border-r-transparent rounded-full animate-spin-slow opacity-50"></div>
      </div>

      <div className="space-y-2 text-center z-10">
        {scanning ? (
          <>
            <p className="text-green-500 animate-pulse text-lg tracking-widest">
              ESCANENDO ROSTRO...
            </p>
            <p className="text-xs text-green-700">
              Comparando con base de datos...
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 text-green-400 text-xl font-bold tracking-widest animate-bounce">
              <UserCheck className="w-6 h-6" /> IDENTIDAD CONFIRMADA
            </div>
            <p className="text-xs text-gray-400">Bienvenido, Jhon.</p>
          </>
        )}
      </div>
    </div>
  );
};

// --- APPS INTERNAS ---

// 1. WISHLIST
const WishlistApp = ({ onClose }) => {
  const [wishes, setWishes] = useState(() => {
    const saved = localStorage.getItem("eternity_wishes");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, text: "Ir a un festival en Berlín", completed: false },
          { id: 2, text: "Comprar nuestra casa", completed: false },
        ];
  });
  const [newWish, setNewWish] = useState("");

  useEffect(() => {
    localStorage.setItem("eternity_wishes", JSON.stringify(wishes));
  }, [wishes]);

  const addWish = () => {
    if (!newWish.trim()) return;
    setWishes([...wishes, { id: Date.now(), text: newWish, completed: false }]);
    setNewWish("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
          <List className="w-6 h-6" /> Lista de Deseos
        </h2>
        <Button variant="ghost" onClick={onClose} className="!w-auto">
          <X />
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newWish}
          onChange={(e) => setNewWish(e.target.value)}
          placeholder="Nuevo deseo..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none"
        />
        <Button onClick={addWish} className="!w-auto bg-green-600">
          <Plus />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {wishes.map((wish) => (
          <div
            key={wish.id}
            className="flex items-center gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800"
          >
            <input
              type="checkbox"
              checked={wish.completed}
              onChange={() =>
                setWishes(
                  wishes.map((w) =>
                    w.id === wish.id ? { ...w, completed: !w.completed } : w
                  )
                )
              }
              className="w-5 h-5 accent-green-500"
            />
            <span
              className={`flex-1 ${
                wish.completed ? "line-through text-gray-500" : "text-white"
              }`}
            >
              {wish.text}
            </span>
            <button
              onClick={() => setWishes(wishes.filter((w) => w.id !== wish.id))}
              className="text-gray-500 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. SECRET BOX
const SecretBoxApp = ({ onClose }) => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("eternity_secrets");
    return saved ? JSON.parse(saved) : [];
  });
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("eternity_secrets", JSON.stringify(messages));
  }, [messages]);

  const saveMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([
      {
        id: Date.now(),
        text: newMessage,
        date: new Date().toLocaleDateString(),
      },
      ...messages,
    ]);
    setNewMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
          <Lock className="w-6 h-6" /> Caja de Secretos
        </h2>
        <Button variant="ghost" onClick={onClose} className="!w-auto">
          <X />
        </Button>
      </div>

      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-4">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe lo que sientes, o lo que le quisieras decir a Cris pero no puedes decírselo en persona..."
          className="w-full bg-transparent text-white outline-none resize-none h-32 placeholder-gray-500 text-sm leading-relaxed"
        />
        <div className="flex justify-end mt-2">
          <Button onClick={saveMessage} className="!w-auto text-sm px-6">
            Guardar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50 relative group"
          >
            <p className="text-gray-300 text-sm">{msg.text}</p>
            <p className="text-xs text-gray-600 mt-2 text-right">{msg.date}</p>
            <button
              onClick={() =>
                setMessages(messages.filter((m) => m.id !== msg.id))
              }
              className="absolute top-2 right-2 text-red-500/50 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. GALLERY
const GalleryApp = ({ onClose }) => {
  const [items, setItems] = useState([
    {
      id: "custom1",
      type: "image",
      src: "17F1C044-B661-467A-8208-996F356A7413.jpg",
    },
    {
      id: "custom2",
      type: "image",
      src: "257AE73F-F79A-4560-9541-D94E74461367.jpg",
    },
    {
      id: "custom3",
      type: "image",
      src: "F4414ECE-F175-449F-8C9B-2A2A2F559A68.png",
    },
  ]);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.startsWith("video/") ? "video" : "image";
      const reader = new FileReader();
      reader.onloadend = () => {
        setItems([{ id: Date.now(), type, src: reader.result }, ...items]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    setItems(items.filter((item) => item.id !== id));
    if (selectedItem && selectedItem.id === id) setSelectedItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
          <ImageIcon className="w-6 h-6" /> Galería Multimedia
        </h2>
        <Button variant="ghost" onClick={onClose} className="!w-auto">
          <X />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 auto-rows-[150px] overflow-y-auto pb-20">
        <label className="border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 cursor-pointer bg-zinc-900/30">
          <Camera className="w-8 h-8 mb-2" />
          <span className="text-xs font-bold text-center">FOTO O VIDEO</span>
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="rounded-xl overflow-hidden border border-zinc-800 relative group cursor-pointer bg-zinc-900"
          >
            {item.type === "video" ? (
              <>
                <video
                  src={item.src}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  muted
                  loop
                  playsInline
                  onMouseOver={(e) => e.target.play()}
                  onMouseOut={(e) => e.target.pause()}
                />
                <div className="absolute bottom-2 left-2 bg-black/50 p-1 rounded-full">
                  <Film className="w-3 h-3 text-white" />
                </div>
              </>
            ) : (
              <img
                src={item.src}
                alt="Memory"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.classList.add("bg-zinc-800");
                }}
              />
            )}

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
              <Maximize2 className="text-white drop-shadow-lg" />
            </div>

            <button
              onClick={(e) => handleDelete(item.id, e)}
              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors z-10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 p-2 bg-zinc-800/50 rounded-full text-white hover:bg-zinc-700 z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {selectedItem.type === "video" ? (
            <video
              src={selectedItem.src}
              className="max-w-full max-h-[85vh] shadow-2xl"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={selectedItem.src}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl"
              alt="Full View"
            />
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center">
            <Button
              variant="danger"
              onClick={() => handleDelete(selectedItem.id)}
              className="!w-auto px-6 py-2 rounded-full flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Eliminar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [screen, setScreen] = useState("cover");
  const [timeTogether, setTimeTogether] = useState({});
  const [activeModule, setActiveModule] = useState(null);
  const [activeApp, setActiveApp] = useState(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  // Fecha de inicio: 1 de Mayo 2024, 00:00
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

  const handleFaceVerified = () => {
    setScreen("loading");
    setTimeout(() => setScreen("dashboard"), 3500);
  };

  useEffect(() => {
    if (activeModule === 2 && videoRef.current) {
      videoRef.current.play().catch((e) => console.log("Autoplay prevent", e));
    }
  }, [activeModule]);

  useEffect(() => {
    if (audioRef.current) {
      if (activeModule === 1) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play prevent", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [activeModule]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  // --- PANTALLAS ---
  if (screen === "cover") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden font-serif">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
        <div className="z-10 animate-in fade-in zoom-in duration-1000 space-y-8">
          <Heart className="w-16 h-16 text-red-500 fill-current mx-auto animate-pulse" />
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight">
              Feliz San Valentín
            </h1>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto my-4"></div>
            <p className="text-purple-300 text-lg italic">
              14 de Febrero, 2026
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 max-w-sm mx-auto transform hover:scale-105 transition-transform duration-500">
            <p className="text-gray-300 mb-2 font-sans text-sm uppercase tracking-widest">
              Desarrollado con amor
            </p>
            <p className="text-2xl font-bold text-white">De Cris para John</p>
          </div>
          <button
            onClick={() => setScreen("facescan")}
            className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold tracking-widest hover:bg-gray-200 transition-colors animate-bounce flex items-center gap-2 mx-auto"
          >
            <Smartphone className="w-5 h-5" /> INICIAR APP
          </button>
        </div>
      </div>
    );
  }

  if (screen === "facescan")
    return <FaceScanScreen onVerified={handleFaceVerified} />;

  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-mono">
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-green-500 animate-[width_3s_ease-in-out_forwards] w-full"></div>
        </div>
        <p className="text-green-500 mt-4 text-sm animate-pulse">
          &gt; ACCESO BIOMÉTRICO CONCEDIDO...
        </p>
        <div className="text-gray-600 text-xs mt-4 space-y-1 text-center">
          <p>Desencriptando archivos del Rave...</p>
          <p>Procesando datos del Océano...</p>
          <p>Sincronizando corazones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 overflow-x-hidden font-sans selection:bg-purple-500 selection:text-white">
      {/* ELEMENTO DE AUDIO OCULTO */}
      <audio ref={audioRef} src="techno.mp3" loop />

      {activeApp === "wishlist" && (
        <WishlistApp onClose={() => setActiveApp(null)} />
      )}
      {activeApp === "secrets" && (
        <SecretBoxApp onClose={() => setActiveApp(null)} />
      )}
      {activeApp === "gallery" && (
        <GalleryApp onClose={() => setActiveApp(null)} />
      )}

      {/* HEADER TIPO FACEBOOK CON PORTADA */}
      <div className="relative w-full h-64 overflow-hidden border-b border-purple-500/20">
        <img
          src="image_ba08ca.jpg" // PORTADA NUEVA (Comic)
          className="w-full h-full object-cover opacity-60 animate-in fade-in zoom-in duration-1000"
          alt="Cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/40 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-xs font-bold text-green-400 tracking-widest drop-shadow-md">
                ONLINE
              </p>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
              Hola, Jhon
            </h2>
            <p className="text-gray-200 text-sm mt-1 drop-shadow-md">
              Proyecto:{" "}
              <span className="text-purple-400 font-bold">
                Por una vida juntos!
              </span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-white/20 shadow-xl">
            <span className="text-2xl">♊</span>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-6 mt-6">
        {/* VIDEO FAVORITO DESTACADO */}
        <Card className="p-0 overflow-hidden border-purple-500/50 shadow-2xl shadow-purple-900/20">
          <div className="relative h-64 w-full bg-zinc-900">
            <video
              src="DJI_0567.MP4" // VIDEO NUEVO (Playa)
              className="w-full h-full object-cover"
              controls
              muted
              loop
              playsInline
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-2 border border-white/10">
              <Play className="w-3 h-3 fill-current" /> Momentos
            </div>
          </div>
          <div className="p-4 bg-zinc-900/80 backdrop-blur border-t border-white/5">
            <p className="text-sm text-gray-300 italic">
              "Momento favorito de Cris cuando lo llevaste a conocer el mar..."
            </p>
          </div>
        </Card>

        {/* TIEMPO EN EJECUCION */}
        <Card className="relative overflow-hidden group border-t-4 border-t-purple-500">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24 text-purple-500 -mr-4 -mt-4" />
          </div>
          <h3 className="text-xs uppercase text-gray-400 font-bold mb-6 tracking-wider">
            TIEMPO EN EJECUCIÓN
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center relative z-10">
            {[
              { val: timeTogether.days, label: "DÍAS" },
              { val: timeTogether.hours, label: "HRS" },
              { val: timeTogether.minutes, label: "MIN" },
              { val: timeTogether.seconds, label: "SEG" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-black/40 backdrop-blur border border-white/10 p-3 rounded-lg flex flex-col justify-center"
              >
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent font-mono">
                  {item.val || "00"}
                </span>
                <span className="text-[9px] text-gray-500 mt-1 font-bold">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <h3 className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1 mb-3">
            TUS APLICACIONES
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setActiveApp("gallery")}
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-zinc-800 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-gray-400">
                Galería
              </span>
            </button>
            <button
              onClick={() => setActiveApp("wishlist")}
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-zinc-800 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <List className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-gray-400">
                Deseos
              </span>
            </button>
            <button
              onClick={() => setActiveApp("secrets")}
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-zinc-800 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-gray-400">
                Secretos
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1 mb-2">
            LINEA DE TIEMPO
          </h3>

          {/* Módulo 1: El Glitch (RAVE + AUDIO) */}
          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 shadow-sm transition-all duration-300">
            <div
              onClick={() => setActiveModule(activeModule === 1 ? null : 1)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 relative">
                  <Zap className="w-5 h-5" />
                  {activeModule === 1 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Fase 1: El Glitch
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    30 Abril 2024 • Cali
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  activeModule === 1 ? "rotate-90" : ""
                }`}
              />
            </div>

            {activeModule === 1 && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="h-48 w-full bg-zinc-800 relative group overflow-hidden">
                  <img
                    src="257AE73F-F79A-4560-9541-D94E74461367.jpg"
                    className="w-full h-full object-cover opacity-90"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20"></div>

                  {/* Player Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-purple-300 border border-purple-500/30">
                      {/* Equalizer Bar Animation */}
                      <div className="flex gap-0.5 items-end h-3">
                        <span className="w-0.5 h-full bg-purple-400 animate-[bounce_0.5s_infinite]"></span>
                        <span className="w-0.5 h-2 bg-purple-400 animate-[bounce_0.7s_infinite]"></span>
                        <span className="w-0.5 h-3 bg-purple-400 animate-[bounce_0.4s_infinite]"></span>
                      </div>
                      <span>Now Playing: 999999999</span>
                    </div>

                    {/* Mute Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="p-2 bg-black/60 backdrop-blur rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-5 text-sm text-gray-300 leading-relaxed border-t border-zinc-800">
                  <p>
                    <strong className="text-white">Anomalía detectada.</strong>{" "}
                    Ese beso no estaba planeado, pero reescribió todo nuestro
                    código.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 shadow-sm">
            <div
              onClick={() => setActiveModule(activeModule === 2 ? null : 2)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Fase 2: Expedición Pacífico
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    03 Sept 2025 • El Mar
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  activeModule === 2 ? "rotate-90" : ""
                }`}
              />
            </div>
            {activeModule === 2 && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="h-48 w-full bg-zinc-800 relative overflow-hidden">
                  <video
                    ref={videoRef}
                    src="GG010251.MP4"
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    autoPlay
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur p-2 rounded-full">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="p-5 text-sm text-gray-300 border-t border-zinc-800">
                  <p>
                    <strong className="text-white">Logro desbloqueado:</strong>{" "}
                    Conocer la inmensidad del mar contigo.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 shadow-sm">
            <div
              onClick={() => setActiveModule(activeModule === 3 ? null : 3)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                  <Infinity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Fase 3: Futuro
                  </h4>
                  <p className="text-[10px] text-gray-400">En Progreso...</p>
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  activeModule === 3 ? "rotate-90" : ""
                }`}
              />
            </div>
            {activeModule === 3 && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="h-64 w-full bg-zinc-800 relative overflow-hidden">
                  <img
                    src="IMG_9669.jpg"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-serif italic text-xl text-white text-center">
                      "Te amo con todo lo que soy, John Fernando."
                    </p>
                  </div>
                </div>
                <div className="p-5 text-sm text-gray-300 border-t border-zinc-800">
                  <div className="flex justify-center">
                    <Heart className="w-6 h-6 text-red-500 fill-current animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-zinc-950 rounded-lg border border-dashed border-zinc-800 font-mono text-[10px] text-gray-500 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-green-500">
            <Terminal className="w-3 h-3" />
            <span className="font-bold tracking-widest">SYSTEM LOGS</span>
          </div>
          <div className="space-y-1">
            <p>&gt; User: Jhon (Gemini) verified.</p>
            <p className="text-green-400">&gt; Wishlist Module Loaded.</p>
            <p className="text-purple-400">&gt; Secret Box Encrypted.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
