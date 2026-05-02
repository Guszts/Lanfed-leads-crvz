import React, { useState, useEffect } from 'react';
import { Download, Plus, Clock, MapPin, Phone, User, CheckCircle2, Play, RefreshCcw, MessageCircle, X, Send } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  mapsLink: string;
  phone: string;
}

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

export default function App() {
  const [target, setTarget] = useState<number | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [tempTarget, setTempTarget] = useState<string>('');

  const [newName, setNewName] = useState('');
  const [newMaps, setNewMaps] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Chat Modal State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tempPostContent, setTempPostContent] = useState('');
  const [chatAuthorName, setChatAuthorName] = useState('');

  // 5 hours in milliseconds
  const FIVE_HOURS = 5 * 60 * 60 * 1000;

  useEffect(() => {
    let interval: number;
    if (startTime && target && target > 300) {
      interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000) as unknown as number;
    }
    return () => clearInterval(interval);
  }, [startTime, target]);

  const handleStart = () => {
    const parsed = parseInt(tempTarget, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setTarget(parsed);
      setStartTime(Date.now());
      setCurrentTime(Date.now());
    }
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newMaps.trim() || !newPhone.trim()) return;

    const newLead: Lead = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      mapsLink: newMaps.trim(),
      phone: newPhone.trim(),
    };

    setLeads([newLead, ...leads]);
    setNewName('');
    setNewMaps('');
    setNewPhone('');
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPostContent.trim() || !chatAuthorName.trim()) return;

    const newPost: Post = {
      id: crypto.randomUUID(),
      author: chatAuthorName.trim(),
      content: tempPostContent.trim(),
      timestamp: Date.now(),
    };

    setPosts([newPost, ...posts]);
    setTempPostContent('');
  };

  const exportToCSV = () => {
    const header = ["Nome", "Google Maps", "Telefone"];
    const rows = leads.map(l => [l.name, l.mapsLink, l.phone]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows]
        .map(e => e.map(item => `"${item.replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lanfed_leads_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar tudo? Isso apagará os leads não exportados.')) {
      setTarget(null);
      setLeads([]);
      setStartTime(null);
      setTempTarget('');
    }
  };

  // Timer calculation
  const isTimerActive = target && target > 300;
  let remainingMs = 0;
  let timeExpired = false;

  if (isTimerActive && startTime) {
    const elapsed = currentTime - startTime;
    remainingMs = Math.max(0, FIVE_HOURS - elapsed);
    if (elapsed >= FIVE_HOURS) {
      timeExpired = true;
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isFormValid = newName.trim() && newMaps.trim() && newPhone.trim();
  const leadsRemaining = target ? target - leads.length : 0;
  const progressPercent = target ? Math.min(100, (leads.length / target) * 100) : 0;

  if (!target) {
    return (
      <div className="min-h-screen bg-wise-dark text-wise-light p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-wise-green rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-wise-green rounded-full opacity-10 blur-3xl"></div>

        <div className="w-full max-w-md bg-wise-light text-wise-dark p-8 md:p-12 rounded-[2rem] shadow-[12px_12px_0px_#9FE870] border-[6px] border-wise-dark relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-wise-green rounded-3xl border-4 border-wise-dark flex items-center justify-center mb-8 brutalist-shadow rotate-3">
            <svg viewBox="0 0 100 100" className="w-16 h-16">
              <path d="M 70 30 A 28 28 0 1 1 30 30" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-center mb-4 leading-tight">
            Lanfed<br/>Leads
          </h1>
          <p className="text-xl font-medium text-center mb-10 opacity-80">
            Defina sua meta e comece a capturar contatos.
          </p>

          <div className="w-full relative mb-8">
            <div className="absolute -top-4 left-6 bg-wise-green px-4 py-1 rounded-full border-2 border-wise-dark font-bold text-sm brutalist-shadow z-10">
              Meta de Leads
            </div>
            <input
              type="number"
              value={tempTarget}
              onChange={(e) => setTempTarget(e.target.value)}
              placeholder="Ex: 1000"
              className="w-full px-6 py-6 text-3xl font-black rounded-3xl border-4 border-wise-dark bg-white focus:outline-none focus:ring-4 focus:ring-wise-green transition-all"
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!tempTarget || parseInt(tempTarget) <= 0}
            className="w-full flex items-center justify-center gap-3 bg-wise-green text-wise-dark py-6 text-2xl font-black rounded-3xl border-4 border-wise-dark brutalist-shadow hover:translate-y-1 hover:shadow-[4px_4px_0px_#163300] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Play fill="currentColor" size={28} />
            INICIAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wise-dark text-wise-light font-sans relative pb-24">
      {/* Top Header */}
      <div className="bg-wise-green text-wise-dark border-b-8 border-wise-dark p-4 md:p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl border-4 border-wise-dark flex items-center justify-center brutalist-shadow text-wise-dark">
               <svg viewBox="0 0 100 100" className="w-10 h-10">
                 <path d="M 70 30 A 28 28 0 1 1 30 30" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
               </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black leading-none">Lanfed Leads</h1>
              <p className="font-bold text-wise-dark/70 text-lg">
                {leads.length} / {target} leads capturados
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 w-full md:w-auto">
            {isTimerActive && (
              <div className={`px-6 py-3 rounded-2xl border-4 border-wise-dark font-black text-2xl flex items-center gap-3 ${timeExpired ? 'bg-red-500 text-white' : 'bg-white text-wise-dark'}`}>
                <Clock strokeWidth={3} />
                {timeExpired ? "00:00:00" : formatTime(remainingMs)}
              </div>
            )}

            <button
              onClick={exportToCSV}
              className="px-6 py-3 bg-white text-wise-dark rounded-2xl border-4 border-wise-dark font-black text-xl flex items-center gap-2 brutalist-shadow hover:translate-y-1 transition-all"
            >
              <Download strokeWidth={3} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
                onClick={() => setIsChatOpen(true)}
                className="p-3 bg-wise-dark text-white rounded-2xl border-4 border-transparent hover:border-white transition-all font-bold"
                aria-label="Comunidade"
                title="Fórum Público"
            >
                <MessageCircle strokeWidth={3} />
            </button>
            <button
                onClick={handleReset}
                className="p-3 bg-wise-dark text-white rounded-2xl border-4 border-transparent hover:border-red-500 transition-all font-bold group"
                aria-label="Resetar"
                title="Resetar contagem"
            >
                <RefreshCcw strokeWidth={3} className="group-hover:text-red-500" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="max-w-6xl mx-auto mt-6 bg-white border-4 border-wise-dark rounded-full h-8 overflow-hidden relative">
          <div 
            className="h-full bg-wise-dark transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 grid lg:grid-cols-[400px_1fr] gap-8 mt-6">
        {/* Input Form Area */}
        <div className="order-1">
          <form 
            onSubmit={handleAddLead} 
            className="bg-wise-light text-wise-dark p-6 md:p-8 rounded-[2.5rem] border-[6px] border-wise-dark shadow-[8px_8px_0px_#9FE870] flex flex-col gap-6 sticky top-48"
          >
            <h2 className="text-3xl font-black border-b-4 border-wise-dark pb-4 flex items-center gap-3">
              <Plus size={36} strokeWidth={4} />
              Novo Lead
            </h2>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xl ml-2 flex items-center gap-2">
                <User size={24} strokeWidth={3}/> Nome do Negócio
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Padaria do João"
                className="w-full px-5 py-4 text-xl font-bold rounded-2xl border-4 border-wise-dark bg-white focus:outline-none focus:ring-4 focus:ring-wise-green transition-all placeholder:font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xl ml-2 flex items-center gap-2">
                <MapPin size={24} strokeWidth={3}/> Link do Google Maps
              </label>
              <input
                type="url"
                value={newMaps}
                onChange={(e) => setNewMaps(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-5 py-4 text-xl font-bold rounded-2xl border-4 border-wise-dark bg-white focus:outline-none focus:ring-4 focus:ring-wise-green transition-all placeholder:font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xl ml-2 flex items-center gap-2">
                <Phone size={24} strokeWidth={3}/> Telefone
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full px-5 py-4 text-xl font-bold rounded-2xl border-4 border-wise-dark bg-white focus:outline-none focus:ring-4 focus:ring-wise-green transition-all placeholder:font-medium placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || (timeExpired && isTimerActive)}
              className="mt-4 w-full flex items-center justify-center gap-3 bg-wise-green text-wise-dark py-5 text-2xl font-black rounded-3xl border-4 border-wise-dark brutalist-shadow hover:translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              <CheckCircle2 size={32} strokeWidth={3} />
              {isTimerActive && timeExpired ? 'Tempo Esgotado' : 'Salvar Lead'}
            </button>

            {!isFormValid && (
              <p className="text-center font-bold text-red-600 bg-red-100 rounded-xl py-2 px-4 border-2 border-red-200 mt-2">
                Preencha tudo para validar!
              </p>
            )}
          </form>
        </div>

        {/* Leads List */}
        <div className="order-2 flex flex-col gap-6">
          <div className="flex justify-between items-end mb-2">
             <h2 className="text-4xl font-black text-wise-green">Lista de Leads</h2>
             <span className="text-xl font-bold text-wise-light/60 bg-white/10 px-4 py-2 rounded-xl">Faltam: {Math.max(0, leadsRemaining)}</span>
          </div>

          {leads.length === 0 ? (
            <div className="bg-white/5 border-4 border-white/10 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center gap-4">
              <User size={64} className="text-wise-green opacity-50" />
              <h3 className="text-3xl font-black text-wise-green opacity-80">Nenhum lead ainda</h3>
              <p className="text-xl font-medium text-white/50">
                Preencha o formulário ao lado para adicionar o primeiro contato.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead, i) => (
                <div 
                  key={lead.id} 
                  className="bg-white text-wise-dark p-6 rounded-3xl border-[5px] border-wise-dark shadow-[6px_6px_0px_#9FE870] flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
                >
                  <div className="flex items-start sm:items-center gap-6 overflow-hidden">
                    <div className="bg-wise-dark text-wise-green w-10 h-10 min-w-10 rounded-full font-black text-xl flex items-center justify-center shrink-0">
                      {leads.length - i}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <h3 className="text-2xl font-black truncate">{lead.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1">
                        <a 
                          href={lead.mapsLink.startsWith('http') ? lead.mapsLink : `http://${lead.mapsLink}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
                        >
                          <MapPin size={18} strokeWidth={3}/> Abrir Mapa
                        </a>
                        <span className="flex items-center gap-1.5 font-bold text-wise-dark/70 shrink-0">
                          <Phone size={18} strokeWidth={3}/> {lead.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat / Community Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-wise-dark/80 backdrop-blur-sm"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white text-wise-dark h-[80vh] flex flex-col rounded-[2.5rem] border-[6px] border-wise-dark shadow-[12px_12px_0px_#9FE870] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-wise-green p-6 border-b-6 border-wise-dark flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl border-4 border-wise-dark brutalist-shadow">
                  <MessageCircle size={32} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-3xl font-black leading-none">Fórum Público</h2>
                  <p className="font-bold text-wise-dark/70">Converse com outros prospectores</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="bg-white p-2 rounded-xl border-4 border-wise-dark hover:bg-red-500 hover:text-white transition-colors brutalist-shadow"
              >
                <X size={28} strokeWidth={4} />
              </button>
            </div>

            {/* Posts List */}
            <div className="flex-1 overflow-y-auto p-6 bg-wise-light flex flex-col gap-4">
              {posts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <MessageCircle size={64} className="mb-4" />
                  <h3 className="text-2xl font-black">Nenhuma mensagem ainda</h3>
                  <p className="text-lg font-bold">Seja o primeiro a enviar algo!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white p-5 rounded-3xl border-4 border-wise-dark brutalist-shadow flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-black text-xl text-wise-green bg-wise-dark px-3 py-1 rounded-xl">
                        {post.author}
                      </span>
                      <span className="font-bold text-sm text-gray-500">
                        {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-medium text-lg leading-snug mt-2">{post.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Compose Area */}
            <form onSubmit={handleAddPost} className="p-6 bg-white border-t-6 border-wise-dark shrink-0 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Seu nome..."
                value={chatAuthorName}
                onChange={(e) => setChatAuthorName(e.target.value)}
                className="w-full px-5 py-3 text-lg font-bold rounded-2xl border-4 border-wise-dark focus:outline-none focus:ring-4 focus:ring-wise-green transition-all"
                maxLength={30}
              />
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Escreva uma mensagem..."
                  value={tempPostContent}
                  onChange={(e) => setTempPostContent(e.target.value)}
                  className="flex-1 px-5 py-4 text-xl font-bold rounded-2xl border-4 border-wise-dark focus:outline-none focus:ring-4 focus:ring-wise-green transition-all"
                />
                <button
                  type="submit"
                  disabled={!tempPostContent.trim() || !chatAuthorName.trim()}
                  className="bg-wise-green px-6 rounded-2xl border-4 border-wise-dark brutalist-shadow flex items-center justify-center hover:translate-y-1 hover:shadow-[2px_2px_0px_#163300] transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <Send size={28} strokeWidth={3} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


