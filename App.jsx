import React, { useState, useEffect, useRef } from "react";
import {
  Heart, Clock, MapPin, Zap, Lock, Unlock, Music, Infinity, ChevronRight,
  Terminal, Play, Camera, List, ImageIcon, Scan, UserCheck, Smartphone,
  X, Plus, Trash2, Maximize2, Volume2, VolumeX, Film,
} from "lucide-react";

// 1. IMPORTACIÓN DE FIREBASE
import { db, storage } from "./firebaseConfig";
import { 
  collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc 
} from "firebase/firestore";
import { 
  ref, uploadBytes, getDownloadURL, deleteObject 
} from "firebase/storage";

// --- COMPONENTES UI (Mantener igual) ---
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
  return (<button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>);
};

// --- APPS INTERNAS CONECTADAS A FIREBASE ---

// 1. WISHLIST (Sincronizada)
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
      createdAt: new Date()
    });
    setNewWish("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2"><List /> Lista de Deseos</h2>
        <Button variant="ghost" onClick={onClose} className="!w-auto"><X /></Button>
      </div>
      <div className="flex gap-2 mb-6">
        <input type="text" value={newWish} onChange={(e) => setNewWish(e.target.value)} placeholder="Nuevo deseo..." className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none" />
        <Button onClick={addWish} className="!w-auto bg-green-600"><Plus /></Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {wishes.map((wish) => (
          <div key={wish.id} className="flex items-center gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <span className="flex-1 text-white">{wish.text}</span>
            <button onClick={() => deleteDoc(doc(db, "wishes", wish.id))} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. SECRET BOX (Sincronizada para que tú la veas)
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
      createdAt: new Date()
    });
    setNewMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2"><Lock /> Caja de Secretos</h2>
        <Button variant="ghost" onClick={onClose} className="!w-auto"><X /></Button>
      </div>
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-4">
        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe un secreto..." className="w-full bg-transparent text-white outline-none h-32" />
        <div className="flex justify-end mt-2"><Button onClick={saveMessage} className="!w-auto">Guardar</Button></div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50 relative">
            <p className="text-gray-300 text-sm">{msg.text}</p>
            <button onClick={() => deleteDoc(doc(db, "secrets", msg.id))} className="absolute top-2 right-2 text-red-500/50"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. GALLERY (Subida Real a la Nube)
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
        createdAt: new Date()
      });
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2"><ImageIcon /> Galería Nube</h2>
        <Button variant="ghost" onClick={onClose} className="!w-auto"><X /></Button>
      </div>
      <div className="grid grid-cols-2 gap-4 auto-rows-[150px] overflow-y-auto pb-20">
        <label className="border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer bg-zinc-900/30">
          {uploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : <><Camera /><span className="text-[10px] mt-2 font-bold">SUBIR</span></>}
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
        {items.map((item) => (
          <div key={item.id} className="rounded-xl overflow-hidden border border-zinc-800 relative bg-zinc-900">
            {item.type === "video" ? <video src={item.src} className="w-full h-full object-cover" muted loop playsInline /> : <img src={item.src} className="w-full h-full object-cover" alt="Memory" />}
            <button onClick={() => deleteDoc(doc(db, "gallery", item.id))} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- PANTALLA PRINCIPAL (Mantiene tu lógica de FaceScan y Dash) ---
export default function App() {
  // ... (Aquí va todo tu código de App() original, solo asegúrate de incluir las pantallas FaceScan, Loading, etc.)
  // Lo he omitido aquí por espacio, pero debes mantener tus estados de screen, timeTogether, etc.
}
