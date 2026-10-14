import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Flame, 
  Zap, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Target, 
  Check, 
  Edit3, 
  Save, 
  Headphones, 
  Radio, 
  ShieldAlert, 
  Quote, 
  HelpCircle,
  Skull,
  Award,
  X
} from 'lucide-react';
import { UserProfile, AIAdvice, MotivationalVision } from '../types';
import { safeStorage } from '../utils/safeStorage';

interface MotivationEngineProps {
  profile: UserProfile;
  onAddPDP: (points: number, reason: string) => void;
}

interface PowerSpeech {
  id: string;
  title: string;
  tag: string;
  mentor: string;
  description: string;
  text: string;
}

const POWER_SPEECHES: PowerSpeech[] = [
  {
    id: 'goggins',
    title: 'Modo Furia Guerrera',
    tag: 'Sin Piedad',
    mentor: 'Mentalidad David Goggins',
    description: 'Golpe directo de realidad para cuando estás dudando o buscando la salida fácil.',
    text: '¡Justin, despierta! ¿Crees que las metas se cumplen esperando a tener ganas? Mientras tú estás dudando o perdiendo el tiempo scrolleando tonterías, el mundo sigue avanzando sin esperarte. Nadie va a construir tu futuro por ti, Justin. Nadie va a sentir orgullo por tus excusas. Levanta la cabeza, ponte los auriculares, respira hondo y sal a devorarte este bloque de trabajo. Tienes el fuego adentro, úsalo ahora mismo. ¡Cero excusas, Justin, cero excusas!'
  },
  {
    id: 'mamba',
    title: 'Mamba Mentality',
    tag: 'Obsesión por la Excelencia',
    mentor: 'Kobe Bryant & Steve Jobs',
    description: 'Enfoque implacable en el oficio, la maestría y el orgullo por el trabajo bien hecho.',
    text: 'Justin, la grandeza no es un accidente; es una decisión silenciosa que tomas cuando nadie te está mirando. Los mediocres solo trabajan cuando se sienten inspirados; los verdaderos maestros ejecutan con precisión quirúrgica todos los días. Cada línea de código, cada minuto de concentración profunda y cada distracción que rechazas te está separando de la multitud. Si quieres resultados que el noventa y nueve por ciento nunca alcanzará, entrégate con una disciplina que ellos no soportarían. Este bloque es tuyo, Justin.'
  },
  {
    id: 'stoic',
    title: 'El General Estoico',
    tag: 'Calma Bajo Presión',
    mentor: 'Marco Aurelio & Séneca',
    description: 'Paz mental absoluta ante el caos, dominio del impulso y templanza.',
    text: 'Justin, reflexiona en esto: puedes ser un hombre admirable hoy mismo, o puedes posponerlo para mañana. El tiempo que se te escapa nunca regresará. No malgastes lo que te queda de energía lamentando lo que no hiciste: haz lo que debes hacer en este momento presente. Si el obstáculo parece enorme, recuerda que el obstáculo es el camino. Mantén tu mente fría, tu pulso firme y tu atención en la siguiente acción. Eres el dueño de tu mente, Justin. Domínala.'
  },
  {
    id: 'shock',
    title: 'Reinicio Relámpago de 15 Segundos',
    tag: 'Anti-Pereza Inmediata',
    mentor: 'Regla de Oro de Acción Rápida',
    description: 'Inyección rápida para arrancar cuando la pereza te quiere paralizar.',
    text: '¡Justin, cuenta conmigo ahora mismo: tres, dos, uno... ¡Arranca ya! No lo pienses más. La mente que piensa demasiado es la mente que no ejecuta. Abre el editor, pon tus manos sobre el teclado y da el primer paso. La acción crea la motivación, jamás al revés. ¡A trabajar ahora mismo, Justin!'
  }
];

const COMMON_EXCUSES = [
  {
    excuse: 'Estoy muy cansado hoy, mejor lo hago mañana',
    counter: 'Justin, el cansancio mental al empezar es una trampa de tu cerebro pidiendo dopamina barata. Empieza 5 minutos; tu energía se despierta con el movimiento, no en el sofá.',
    impact: 'Derrotar la trampa del letargo'
  },
  {
    excuse: 'No tengo suficiente inspiración o ganas en este momento',
    counter: 'Justin, los amateurs esperan la inspiración; los profesionales se sientan a trabajar y la inspiración los encuentra ejecutando. El orgullo de terminar supera cualquier falta de ganas.',
    impact: 'Derrotar el mito de la inspiración'
  },
  {
    excuse: 'Esta tarea es demasiado compleja y abrumadora',
    counter: 'Justin, divide el monstruo en migajas. No tienes que terminar todo hoy, solo tienes que dar la siguiente orden concreta. Una sola acción bien ejecutada rompe la parálisis.',
    impact: 'Derrotar la sobrecarga cognitiva'
  },
  {
    excuse: 'Revisaré mis mensajes o redes 10 minutitos antes de empezar',
    counter: 'Justin, 10 minutos de redes destruyen tu dopamina y dispersan tu foco por las siguientes dos horas. Apaga las notificaciones. Tu futuro vale más que el algoritmo.',
    impact: 'Derrotar el secuestro de atención'
  }
];

const DEFAULT_VISION: MotivationalVision = {
  ultimateGoal: 'Alcanzar maestría absoluta en ingeniería de software, construir libertad financiera e impacto duradero.',
  whoIFightFor: 'Por mi familia, por las personas que confían en mí y por el respeto a mi propio potencial.',
  unbreakableRule: 'Jamás negociar con la mediocridad. Lo que Justin promete en su calendario, Justin lo cumple con honor.'
};

const MOODS = [
  { id: 'procrastinating', label: 'Postergando / Evadiendo', icon: '⏳' },
  { id: 'anxious', label: 'Ansioso / Estresado', icon: '😰' },
  { id: 'distracted', label: 'Distraído / Disperso', icon: '🌀' },
  { id: 'overwhelmed', label: 'Abrumado / Bloqueado', icon: '🤯' },
  { id: 'exhausted', label: 'Agotado / Sin Energía', icon: '🔋' },
];

const ADVICE_DATABASE: Record<string, { insight: string; quote: string; quoteAuthor: string; challenge: string[] }> = {
  procrastinating: {
    insight: 'Justin, la procrastinación no es un defecto de carácter, es una disfunción en la regulación emocional. Tu cerebro percibe la tarea como una amenaza y busca refugio en el alivio inmediato. El antídoto es reducir la barrera de entrada a niveles ridículos: haz los primeros 120 segundos sin juzgar el resultado.',
    quote: 'La mayoría de las cosas de las que nos quejamos no nos dañan tanto como la pereza de comenzar.',
    quoteAuthor: 'Séneca',
    challenge: [
      'Aplica la Regla de los 2 Minutos: Abre tu archivo de trabajo y modifícalo durante solo 120 segundos.',
      'Escribe en una hoja física la acción física más simple que necesitas hacer.',
      'Pon tu teléfono en modo avión en otra habitación durante los próximos 25 minutos.',
    ],
  },
  anxious: {
    insight: 'Justin, la ansiedad paraliza tu rendimiento porque tu mente está intentando controlar un futuro imaginario. Desconecta de la expectativa de perfección y conéctate únicamente con la artesanía de la acción presente.',
    quote: 'Sufrimos más a menudo en la imaginación que en la realidad.',
    quoteAuthor: 'Séneca',
    challenge: [
      'Realiza una respiración cuadrada (Inhala 4s, sostén 4s, exhala 4s, sostén 4s) tres veces consecutivas.',
      'Haz un vaciado mental (brain dump): anota todos los pensamientos parásitos en una lista rápida.',
      'Selecciona únicamente la primera tarea y bloquea visualmente las demás.',
    ],
  },
  distracted: {
    insight: 'Justin, tu atención es tu activo más valioso. Si no proteges tu enfoque, serás esclavo de las prioridades de los demás. Trata cada distracción rechazada como una repetición de fuerza en el gimnasio mental.',
    quote: 'Aquel que está en todas partes, no está en ninguna parte.',
    quoteAuthor: 'Séneca',
    challenge: [
      'Cierra todas las pestañas del navegador ajenas a la tarea en curso.',
      'Activa el generador de Ruido Marrón integrado de TEMPOS para blindar tus oídos.',
      'Comprométete a completar un ciclo de 25 minutos sin cambiar de aplicación.',
    ],
  },
  overwhelmed: {
    insight: 'Justin, el cerebro humano colapsa cuando intenta procesar más de tres variables prioritarias a la vez. No hagas todo hoy: haz lo esencial de manera impecable.',
    quote: 'No es que tengamos poco tiempo, sino que perdemos mucho.',
    quoteAuthor: 'Séneca',
    challenge: [
      'Declara bancarrota de tareas secundarias por hoy: deja solo las dos críticas.',
      'Haz el borrador más rápido y sin censura; perfeccionar es más fácil que crear de la nada.',
      'Trabaja en bloques cortos de 15 minutos con pausas de 3 minutos.',
    ],
  },
  exhausted: {
    insight: 'Justin, el descanso estratégico es disciplina, no pereza. Un guerrero cansado comete errores fatales. Si necesitas recargar, hazlo de verdad: sin pantallas ni estímulos dopamínicos.',
    quote: 'El descanso es el condimento del trabajo.',
    quoteAuthor: 'Plutarco',
    challenge: [
      'Aléjate de las pantallas por completo durante los próximos 10 minutos.',
      'Bebe un vaso con agua fresca y realiza estiramientos suaves.',
      'Fija una hora innegociable de descanso nocturno hoy para restaurar tu corteza prefrontal.',
    ],
  },
};

export default function MotivationEngine({ profile, onAddPDP }: MotivationEngineProps) {
  // Active motivational tool sub-tab
  const [activeTool, setActiveTool] = useState<'speech' | 'crusher' | 'vision' | 'soundscape' | 'advisor'>('speech');

  // Speech State & Audio Synthesis
  const [selectedSpeechId, setSelectedSpeechId] = useState<string>('goggins');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechRewarded, setSpeechRewarded] = useState<boolean>(false);

  // Excuse Crusher State
  const [crusherExcuse, setCrusherExcuse] = useState<string>('');
  const [customExcuseInput, setCustomExcuseInput] = useState<string>('');
  const [crushedResult, setCrushedResult] = useState<{ excuse: string; counter: string } | null>(null);
  const [isCrushing, setIsCrushing] = useState<boolean>(false);
  const [crushedCount, setCrushedCount] = useState<number>(() => {
    return safeStorage.getJSON<number>('tempos_crushed_count', 12);
  });

  // Vision Board State
  const [vision, setVision] = useState<MotivationalVision>(() => {
    return safeStorage.getJSON<MotivationalVision>('tempos_justin_vision', DEFAULT_VISION);
  });
  const [isEditingVision, setIsEditingVision] = useState<boolean>(false);
  const [tempVision, setTempVision] = useState<MotivationalVision>(vision);
  const [visionSaveMessage, setVisionSaveMessage] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  // Soundscape Generator (Web Audio API)
  const [soundType, setSoundType] = useState<'brown' | 'gamma40' | 'rain'>('brown');
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.4);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{ source?: AudioNode; gain?: GainNode; interval?: number } | null>(null);

  // 5-Second Booster Countdown
  const [boosterActive, setBoosterActive] = useState<boolean>(false);
  const [boosterCount, setBoosterCount] = useState<number>(5);
  const [boosterFinished, setBoosterFinished] = useState<boolean>(false);

  // AI Advisor State
  const [selectedMood, setSelectedMood] = useState<string>('procrastinating');
  const [advisorInput, setAdvisorInput] = useState<string>('');
  const [generatedAdvice, setGeneratedAdvice] = useState<AIAdvice | null>(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState<boolean>(false);
  const [challengeAccepted, setChallengeAccepted] = useState<boolean>(false);

  const activeSpeech = POWER_SPEECHES.find(s => s.id === selectedSpeechId) || POWER_SPEECHES[0];

  // Clean up Web Audio and Speech on unmount
  useEffect(() => {
    return () => {
      stopSound();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech API handler
  const handleToggleSpeechAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioNotice('Tu navegador no soporta síntesis de voz nativa en este contexto. ¡Lee el discurso con toda la fuerza!');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeSpeech.text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    // Pick a natural spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (!speechRewarded) {
        onAddPDP(20, `Escuchar Discurso de Fuego para ${profile.name}`);
        setSpeechRewarded(true);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Soundscape Generator via Web Audio API
  const startSound = (type: 'brown' | 'gamma40' | 'rain', vol: number) => {
    stopSound();

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(vol, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (type === 'brown') {
        // Brownian noise generation (integrated white noise)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain compensation
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Warm Lowpass filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();

        soundNodesRef.current = { source: whiteNoise, gain: masterGain };
      } else if (type === 'gamma40') {
        // 40Hz Isochronic / Binaural tone (Carrier 220Hz modulated at 40Hz)
        const carrierOsc = ctx.createOscillator();
        carrierOsc.type = 'sine';
        carrierOsc.frequency.setValueAtTime(216, ctx.currentTime);

        const modOsc = ctx.createOscillator();
        modOsc.type = 'sine';
        modOsc.frequency.setValueAtTime(40, ctx.currentTime); // 40Hz Gamma

        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(0.5, ctx.currentTime);

        modOsc.connect(modGain.gain);
        carrierOsc.connect(modGain);
        modGain.connect(masterGain);

        carrierOsc.start();
        modOsc.start();

        soundNodesRef.current = { source: carrierOsc, gain: masterGain };
      } else if (type === 'rain') {
        // Pink/Filtered noise for rain simulation
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);

        rainSource.connect(filter);
        filter.connect(masterGain);
        rainSource.start();

        soundNodesRef.current = { source: rainSource, gain: masterGain };
      }

      setIsPlayingSound(true);
    } catch {
      setAudioNotice('El motor de audio web no pudo inicializarse. Algunos navegadores restringen audio hasta un toque explícito.');
      setIsPlayingSound(false);
    }
  };

  const stopSound = () => {
    if (soundNodesRef.current?.source) {
      try {
        (soundNodesRef.current.source as AudioScheduledSourceNode).stop();
      } catch {
        // Ignore if already stopped
      }
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore
      }
    }
    audioContextRef.current = null;
    soundNodesRef.current = null;
    setIsPlayingSound(false);
  };

  const handleToggleSound = () => {
    if (isPlayingSound) {
      stopSound();
    } else {
      startSound(soundType, volume);
    }
  };

  const handleChangeVolume = (newVol: number) => {
    setVolume(newVol);
    if (soundNodesRef.current?.gain && audioContextRef.current) {
      soundNodesRef.current.gain.gain.setValueAtTime(newVol, audioContextRef.current.currentTime);
    }
  };

  // Play short synthesized beep for countdown & excuse explosion
  const playImpactTone = (freq = 200, duration = 0.25) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore
    }
  };

  // Excuse Crusher Action
  const handleCrushExcuse = (customText?: string) => {
    const textToCrush = customText || crusherExcuse || (COMMON_EXCUSES[0].excuse);
    if (!textToCrush.trim()) return;

    setIsCrushing(true);
    playImpactTone(120, 0.4);

    setTimeout(() => {
      // Find matching counter or generate strong one
      const match = COMMON_EXCUSES.find(e => e.excuse === textToCrush);
      const counter = match 
        ? match.counter 
        : `${profile.name}, esa excusa es solo un susurro de la mente débil buscando comodidad. Los grandes no negocian con sus sensaciones del momento. Haz 5 minutos de trabajo implacable ahora mismo y mira cómo la duda se disuelve.`;

      setCrushedResult({
        excuse: textToCrush,
        counter,
      });

      const newCount = crushedCount + 1;
      setCrushedCount(newCount);
      safeStorage.setJSON('tempos_crushed_count', newCount);

      onAddPDP(15, `Pulverizar excusa mental: "${textToCrush.slice(0, 30)}..."`);
      setIsCrushing(false);
      setCustomExcuseInput('');
    }, 600);
  };

  // 5-Second Booster Countdown
  const handleStartBooster = () => {
    setBoosterActive(true);
    setBoosterFinished(false);
    setBoosterCount(5);
    playImpactTone(440, 0.15);

    let current = 5;
    const interval = window.setInterval(() => {
      current -= 1;
      setBoosterCount(current);
      if (current > 0) {
        playImpactTone(440 + (5 - current) * 60, 0.15);
      } else {
        clearInterval(interval);
        playImpactTone(880, 0.5);
        setBoosterFinished(true);
        onAddPDP(10, `Completar Despegue de 5 Segundos para ${profile.name}`);
      }
    }, 1000);
  };

  // Vision Save
  const handleSaveVision = () => {
    setVision(tempVision);
    safeStorage.setJSON('tempos_justin_vision', tempVision);
    setIsEditingVision(false);
    setVisionSaveMessage('¡Visión Sagrada actualizada y blindada!');
    onAddPDP(15, 'Reafirmar Visión y Compromiso de Honor');
    setTimeout(() => setVisionSaveMessage(null), 4000);
  };

  // AI Advice Generator
  const handleGenerateAdvice = () => {
    setIsGeneratingAdvice(true);
    setChallengeAccepted(false);

    setTimeout(() => {
      const template = ADVICE_DATABASE[selectedMood] || ADVICE_DATABASE.procrastinating;
      let customInsight = template.insight;

      if (advisorInput.toLowerCase().includes('código') || advisorInput.toLowerCase().includes('programar') || advisorInput.toLowerCase().includes('bug')) {
        customInsight += ` Para un desarrollador de alto calibre como tú, ${profile.name}, la procrastinación frecuentemente se disfraza de "refactorización prematura" o búsqueda infinita en foros. Cierra la teoría y escribe el código sucio primero.`;
      } else if (advisorInput.toLowerCase().includes('móvil') || advisorInput.toLowerCase().includes('celular') || advisorInput.toLowerCase().includes('redes')) {
        customInsight += ` Tu teléfono está secuestrando tu foco. Ponlo boca abajo en otra habitación inmediatamente, ${profile.name}.`;
      }

      setGeneratedAdvice({
        mood: selectedMood,
        weakness: profile.mainWeakness,
        insight: customInsight,
        quote: template.quote,
        quoteAuthor: template.quoteAuthor,
        challenge: template.challenge,
      });
      setIsGeneratingAdvice(false);
    }, 1000);
  };

  return (
    <div id="motivation-engine-dashboard" className="space-y-8 animate-fade-in">

      {/* AUDIO NOTIFICATION BANNER */}
      {audioNotice && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-amber-400 shrink-0" />
            <span>{audioNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setAudioNotice(null)}
            className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* HERO BANNER FOR JUSTIN */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-[#0d0e10] p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Dynamic decorative backdrop shapes */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-black/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-2 right-8 text-black/15 font-black text-8xl font-mono select-none pointer-events-none">
          JUSTIN
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-black/20 text-[#0d0e10] px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider mb-3">
              <Flame size={14} className="text-amber-200 animate-bounce" />
              Protocolo de Poder & Modo Bestia
            </div>
            <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-[#0d0e10]">
              El Fuego Imparable de {profile.name}
            </h2>
            <p className="text-xs sm:text-sm text-black/85 mt-2 leading-relaxed font-medium">
              "No compito contra el mundo, compito contra mi versión de ayer. Mi disciplina hoy define el imperio de mi mañana."
            </p>
          </div>

          {/* Quick Stats & 5-Second Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-black/25 backdrop-blur-md rounded-2xl p-4 text-center border border-black/10">
              <span className="text-[10px] font-mono uppercase text-amber-200 block font-bold">Excusas Destruidas</span>
              <span className="text-2xl font-mono font-black text-white">{crushedCount}</span>
            </div>

            <button
              id="quick-booster-btn"
              type="button"
              onClick={handleStartBooster}
              className="bg-black hover:bg-zinc-900 text-amber-300 hover:text-amber-200 px-5 py-4 rounded-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all active:scale-95 border border-amber-400/30"
            >
              <Zap size={18} className="text-amber-400 animate-pulse" />
              <span>Despegue 5s</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-SECOND COUNTDOWN MODAL / PANEL */}
      {boosterActive && (
        <div className="bg-[#121417] border-2 border-amber-500 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative animate-scale-in">
          {!boosterFinished ? (
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                Regla de los 5 Segundos — Cero Dudas
              </span>
              <h3 className="text-xl font-bold text-white">¡Prepárate para la acción, {profile.name}!</h3>
              <div className="text-7xl font-mono font-black text-amber-400 animate-pulse my-4">
                {boosterCount}
              </div>
              <p className="text-xs text-white/50 max-w-md mx-auto">
                Respira, cierra las redes sociales y pon las manos en tu labor. Cuando llegue a cero, arrancas sin negociar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-amber-500 text-black rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-amber-500/20">
                🔥
              </div>
              <h3 className="text-2xl font-black text-white">¡DESPEGA YA, {profile.name.toUpperCase()}!</h3>
              <p className="text-xs text-amber-200/80 max-w-md mx-auto">
                La resistencia ha sido rota. Has ganado <strong>+10 PDP</strong>. ¡Abre tu tarea y no mires atrás!
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBoosterActive(false)}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  ¡A la Batalla!
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3" id="motivation-tool-tabs">
        <button
          type="button"
          onClick={() => setActiveTool('speech')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTool === 'speech'
              ? 'bg-amber-500 text-[#0d0e10] shadow-md shadow-amber-500/10'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Volume2 size={16} /> Discursos de Fuego ({profile.name})
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('crusher')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTool === 'crusher'
              ? 'bg-amber-500 text-[#0d0e10] shadow-md shadow-amber-500/10'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Skull size={16} /> Triturador de Excusas
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('vision')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTool === 'vision'
              ? 'bg-amber-500 text-[#0d0e10] shadow-md shadow-amber-500/10'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Target size={16} /> Muro de Visión Sagrada
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('soundscape')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTool === 'soundscape'
              ? 'bg-amber-500 text-[#0d0e10] shadow-md shadow-amber-500/10'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Headphones size={16} /> Modo Monje (Sonido de Concentración)
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('advisor')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTool === 'advisor'
              ? 'bg-amber-500 text-[#0d0e10] shadow-md shadow-amber-500/10'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sparkles size={16} /> Detector Cognitivo IA
        </button>
      </div>

      {/* TAB 1: POWER SPEECHES (DISCURSOS DE FUEGO) */}
      {activeTool === 'speech' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Left: Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <Radio className="text-amber-400" size={18} /> Selecciona tu Inyección de Poder
              </h3>
              <p className="text-xs text-white/40 mb-4 leading-relaxed">
                Elige el tono que necesitas ahora para encender tu disciplina interior.
              </p>

              <div className="space-y-2.5">
                {POWER_SPEECHES.map((speech) => {
                  const isSelected = selectedSpeechId === speech.id;
                  return (
                    <button
                      key={speech.id}
                      type="button"
                      onClick={() => {
                        setSelectedSpeechId(speech.id);
                        if (isSpeaking && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                          setIsSpeaking(false);
                        }
                      }}
                      className={`w-full p-4 rounded-xl text-left border cursor-pointer transition-all flex flex-col gap-1 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 shadow-sm'
                          : 'border-white/5 bg-[#121417] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white flex items-center gap-2">
                          {speech.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-amber-300 border border-white/10">
                          {speech.tag}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/40">{speech.mentor}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Active Speech Player */}
          <div className="lg:col-span-7">
            <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full space-y-6">
              
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                      {activeSpeech.tag}
                    </span>
                    <h3 className="text-xl font-black text-white">{activeSpeech.title}</h3>
                    <span className="text-xs text-white/40">{activeSpeech.mentor}</span>
                  </div>

                  {/* Audio Play/Stop Button */}
                  <button
                    id="listen-speech-audio-btn"
                    type="button"
                    onClick={handleToggleSpeechAudio}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg ${
                      isSpeaking
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-500 hover:bg-amber-400 text-black'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <Pause size={16} /> Detener Audio
                      </>
                    ) : (
                      <>
                        <Volume2 size={16} /> Escuchar Audio en Vivo
                      </>
                    )}
                  </button>
                </div>

                {/* Animated soundwave simulator when speaking */}
                {isSpeaking && (
                  <div className="flex items-center justify-center gap-1.5 py-3 bg-amber-500/10 rounded-xl border border-amber-500/20 mb-4 animate-pulse">
                    <span className="h-4 w-1 bg-amber-400 rounded-full animate-bounce" />
                    <span className="h-8 w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="h-6 w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-10 w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    <span className="h-5 w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="text-xs font-mono font-bold text-amber-300 ml-2">
                      Transmitiendo mensaje de poder a {profile.name}...
                    </span>
                  </div>
                )}

                {/* Speech Text in High-Impact Typography */}
                <div className="bg-[#121417] p-6 rounded-2xl border border-white/5 relative">
                  <Quote size={28} className="text-amber-500/20 absolute top-4 left-4 pointer-events-none" />
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed font-serif italic pl-4">
                    "{activeSpeech.text}"
                  </p>
                </div>
              </div>

              {/* Bottom Award Button */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-[11px] text-white/40">
                  Escuchar este mensaje te recompensa con <span className="text-amber-300 font-bold font-mono">+20 PDP</span>
                </span>
                <button
                  type="button"
                  disabled={speechRewarded}
                  onClick={() => {
                    onAddPDP(20, `Interiorizar Discurso de Poder para ${profile.name}`);
                    setSpeechRewarded(true);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    speechRewarded
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
                  }`}
                >
                  {speechRewarded ? (
                    <>
                      <Check size={14} /> ¡Poder Absorbido! (+20 PDP)
                    </>
                  ) : (
                    <>
                      <Flame size={14} className="text-amber-400" /> ¡Estoy Encendido! (+20 PDP)
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: EXCUSE CRUSHER (TRITURADOR DE EXCUSAS) */}
      {activeTool === 'crusher' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Skull className="text-rose-400" size={20} />
                <h3 className="text-lg font-bold text-white">¿Qué excusa te está tentando hoy, {profile.name}?</h3>
              </div>
              <p className="text-xs text-white/40 mb-4 leading-relaxed">
                Selecciona la mentira que tu mente mediocre te está diciendo o escríbela. La pulverizaremos con un contraargumento letal.
              </p>

              {/* Quick Preset Excuses */}
              <div className="space-y-2 mb-4">
                {COMMON_EXCUSES.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCrusherExcuse(item.excuse);
                      handleCrushExcuse(item.excuse);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-[#121417] hover:bg-white/5 border border-white/5 hover:border-amber-400/40 text-xs text-white/80 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <span>"{item.excuse}"</span>
                    <span className="text-[10px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Pulverizar →
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Excuse Form */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <label className="block text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
                  O escribe tu excusa personalizada:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customExcuseInput}
                    onChange={(e) => setCustomExcuseInput(e.target.value)}
                    placeholder="Ej. Me duele la cabeza un poco y no tengo ganas..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCrushExcuse(customExcuseInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={isCrushing || !customExcuseInput.trim()}
                    onClick={() => handleCrushExcuse(customExcuseInput)}
                    className="bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Flame size={14} /> Pulverizar
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Crushed Result Screen */}
          <div className="lg:col-span-6">
            <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full min-h-[350px]">
              
              {isCrushing ? (
                <div className="flex flex-col items-center justify-center my-auto text-center space-y-4">
                  <Flame size={48} className="text-rose-500 animate-spin" />
                  <h4 className="text-lg font-black text-rose-400">DESINTEGRANDO EXCUSA...</h4>
                  <p className="text-xs text-white/40">Desarmando el autoengaño neuronal de {profile.name}...</p>
                </div>
              ) : crushedResult ? (
                <div className="space-y-6 animate-scale-in">
                  
                  {/* Crushed Excused Banner */}
                  <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] font-mono uppercase text-rose-400 block font-bold">
                      Excusa Pulverizada:
                    </span>
                    <p className="text-xs text-white/70 line-through italic mt-1 font-mono">
                      "{crushedResult.excuse}"
                    </p>
                    <span className="absolute right-4 top-4 text-xs font-mono font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                      ELIMINADA 💥
                    </span>
                  </div>

                  {/* Iron Counter Attack */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 p-5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase">
                      <ShieldAlert size={16} /> Contraataque de Acero para {profile.name}:
                    </div>
                    <p className="text-sm text-white font-medium leading-relaxed">
                      "{crushedResult.counter}"
                    </p>
                  </div>

                  <div className="bg-[#121417] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-amber-400" />
                      <span className="text-xs text-white/80">Recompensa por Dominio Mental:</span>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                      +15 PDP Ganados
                    </span>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center my-auto text-center space-y-3">
                  <Skull size={42} className="text-white/10" />
                  <h4 className="text-white/70 font-bold text-sm">Esperando Excusa para Destruir</h4>
                  <p className="text-xs text-white/40 max-w-xs">
                    Haz clic en una de las excusas de la izquierda para ver cómo la convertimos en combustible de disciplina para {profile.name}.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SACRED VISION WALL (MURO DE VISIÓN SAGRADA) */}
      {activeTool === 'vision' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  El Manifiesto de {profile.name}
                </span>
                <h3 className="text-xl font-black text-white">Muro de la Visión Sagrada & Por Qué Luchas</h3>
                <p className="text-xs text-white/40 mt-0.5">
                  Cuando la pereza o la duda te asalten, lee esto. Esta es la brújula que nadie puede arrebatarte.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isEditingVision ? (
                  <button
                    type="button"
                    onClick={handleSaveVision}
                    className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-lg"
                  >
                    <Save size={14} /> Guardar Mi Visión
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTempVision(vision);
                      setIsEditingVision(true);
                    }}
                    className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-white/10"
                  >
                    <Edit3 size={14} /> Editar Mi Visión
                  </button>
                )}
              </div>
            </div>

            {visionSaveMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                <Check size={16} /> {visionSaveMessage}
              </div>
            )}

            {/* Vision Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pillar 1 */}
              <div className="bg-[#121417] border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black mb-4">
                    🎯
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-bold block mb-1">
                    Pilar 1: Mi Meta Suprema
                  </span>
                  <h4 className="text-base font-bold text-white mb-3">¿A Dónde Quiero Llegar?</h4>
                  
                  {isEditingVision ? (
                    <textarea
                      value={tempVision.ultimateGoal}
                      onChange={(e) => setTempVision({ ...tempVision, ultimateGoal: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/20 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  ) : (
                    <p className="text-xs text-white/70 leading-relaxed italic">
                      "{vision.ultimateGoal}"
                    </p>
                  )}
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-[#121417] border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black mb-4">
                    🛡️
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-bold block mb-1">
                    Pilar 2: Por Quién Lucho
                  </span>
                  <h4 className="text-base font-bold text-white mb-3">El Propósito Más Grande</h4>
                  
                  {isEditingVision ? (
                    <textarea
                      value={tempVision.whoIFightFor}
                      onChange={(e) => setTempVision({ ...tempVision, whoIFightFor: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/20 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  ) : (
                    <p className="text-xs text-white/70 leading-relaxed italic">
                      "{vision.whoIFightFor}"
                    </p>
                  )}
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-[#121417] border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black mb-4">
                    ⚔️
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-bold block mb-1">
                    Pilar 3: Mi Regla de Honor
                  </span>
                  <h4 className="text-base font-bold text-white mb-3">El Código Innegociable</h4>
                  
                  {isEditingVision ? (
                    <textarea
                      value={tempVision.unbreakableRule}
                      onChange={(e) => setTempVision({ ...tempVision, unbreakableRule: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/20 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  ) : (
                    <p className="text-xs text-white/70 leading-relaxed italic">
                      "{vision.unbreakableRule}"
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 4: MONK MODE SOUNDSCAPE GENERATOR */}
      {activeTool === 'soundscape' && (
        <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                Audio Cognitivo en Tiempo Real
              </span>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Headphones className="text-amber-400" size={20} /> Modo Monje: Generador de Ruido Marrón & Frecuencia Gamma
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                Generado directamente en tu navegador con Web Audio API. Sin anuncios, sin Spotify, sin distracciones.
              </p>
            </div>

            {/* Master Toggle Button */}
            <button
              id="toggle-soundscape-btn"
              type="button"
              onClick={handleToggleSound}
              className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xl ${
                isPlayingSound
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-black'
              }`}
            >
              {isPlayingSound ? (
                <>
                  <Pause size={18} /> Pausar Frecuencia
                </>
              ) : (
                <>
                  <Play size={18} /> Iniciar Sonido de Hiperfoco
                </>
              )}
            </button>
          </div>

          {/* Sound Type Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <button
              type="button"
              onClick={() => {
                setSoundType('brown');
                if (isPlayingSound) startSound('brown', volume);
              }}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                soundType === 'brown'
                  ? 'border-amber-400 bg-amber-400/10 shadow-sm'
                  : 'border-white/5 bg-[#121417] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">🌊 Ruido Marrón Profundo</span>
                {soundType === 'brown' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Filtro grave cálido que cancela el ruido mental y aplaca la hiperactividad cerebral.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSoundType('gamma40');
                if (isPlayingSound) startSound('gamma40', volume);
              }}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                soundType === 'gamma40'
                  ? 'border-amber-400 bg-amber-400/10 shadow-sm'
                  : 'border-white/5 bg-[#121417] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">⚡ Ondas Gamma 40Hz</span>
                {soundType === 'gamma40' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Frecuencia asociada en neurociencia al estado de flujo ("flow state") y memoria de trabajo.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSoundType('rain');
                if (isPlayingSound) startSound('rain', volume);
              }}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                soundType === 'rain'
                  ? 'border-amber-400 bg-amber-400/10 shadow-sm'
                  : 'border-white/5 bg-[#121417] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">🌧️ Lluvia Mental Suave</span>
                {soundType === 'rain' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Atmósfera relajante y constante para sesiones prolongadas de lectura o arquitectura técnica.
              </p>
            </button>

          </div>

          {/* Volume Slider & Soundwave Pulse */}
          <div className="bg-[#121417] p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {volume === 0 ? <VolumeX className="text-white/40" size={18} /> : <Volume2 className="text-amber-400" size={18} />}
              <span className="text-xs font-mono font-bold text-white/70 whitespace-nowrap">Volumen:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleChangeVolume(parseFloat(e.target.value))}
                className="w-full sm:w-48 accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-mono text-amber-400 font-bold w-12 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <div className="text-[11px] font-mono text-white/40 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlayingSound ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
              {isPlayingSound ? `Modo Monje Activo para ${profile.name}` : 'Audio en Pausa'}
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: AI COGNITIVE ADVISOR (DETECTOR DE ESTADO COGNITIVO) */}
      {activeTool === 'advisor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Left: Input */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-amber-400 animate-pulse" size={18} />
                <h3 className="text-lg font-bold text-white">Detector de Estado Cognitivo</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                ¿Qué emoción o bloqueo estás experimentando, {profile.name}? Analizaremos tu resistencia con psicología estoica.
              </p>

              {/* Mood Buttons */}
              <div className="space-y-2">
                {MOODS.map((mood) => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => setSelectedMood(mood.id)}
                      className={`w-full p-3 border rounded-xl flex items-center gap-3 text-left text-xs font-medium cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 font-bold text-amber-200'
                          : 'border-white/5 bg-[#121417] text-white/70 hover:border-white/20'
                      }`}
                    >
                      <span className="text-base">{mood.icon}</span>
                      <span className="flex-1">{mood.label}</span>
                      {isSelected && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                    </button>
                  );
                })}
              </div>

              {/* Optional Details */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
                  Detalla tu situación (Opcional):
                </label>
                <textarea
                  className="w-full text-xs bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/20 min-h-[85px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Ej. Debo terminar el módulo de pagos pero sigo aplazándolo..."
                  value={advisorInput}
                  onChange={(e) => setAdvisorInput(e.target.value)}
                />
              </div>

              <button
                type="button"
                disabled={isGeneratingAdvice}
                onClick={handleGenerateAdvice}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
              >
                {isGeneratingAdvice ? (
                  <>
                    <Zap className="animate-spin text-black" size={14} /> Analizando resistencia cognitiva...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Generar Diagnóstico de Foco
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Advice Result */}
          <div className="lg:col-span-7">
            {generatedAdvice ? (
              <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-scale-in">
                
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      Informe Stoic-AI para {profile.name}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">Diagnóstico Táctico</h3>
                  </div>
                  <span className="text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    Dopamina Regulada
                  </span>
                </div>

                <p className="text-white/80 text-xs leading-relaxed italic">
                  "{generatedAdvice.insight}"
                </p>

                {/* Quote */}
                <div className="bg-[#121417] border-l-4 border-amber-400 p-4 rounded-r-xl border border-y-white/5 border-r-white/5">
                  <p className="text-xs font-serif text-white/90 italic leading-relaxed">
                    "{generatedAdvice.quote}"
                  </p>
                  <span className="text-[10px] font-mono font-bold text-amber-400/80 block mt-2 text-right">
                    — {generatedAdvice.quoteAuthor}
                  </span>
                </div>

                {/* Challenge */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-400 animate-pulse" /> Micro-Desafío Inmediato para {profile.name}:
                  </h4>
                  <div className="space-y-2">
                    {generatedAdvice.challenge.map((step, idx) => (
                      <div key={idx} className="flex gap-3 bg-[#121417] p-3 rounded-xl border border-white/5 items-start">
                        <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-white/70 leading-normal">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accept Challenge */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-white/40">
                    Aceptar este desafío otorga <span className="font-mono font-bold text-amber-300">+25 PDP</span>
                  </span>
                  <button
                    type="button"
                    disabled={challengeAccepted}
                    onClick={() => {
                      setChallengeAccepted(true);
                      onAddPDP(25, `Aceptar micro-desafío de enfoque táctico para ${profile.name}`);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      challengeAccepted
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500 hover:bg-amber-400 text-black'
                    }`}
                  >
                    {challengeAccepted ? (
                      <>
                        <Check size={14} /> ¡Desafío Aceptado! (+25 PDP)
                      </>
                    ) : (
                      <>
                        <Flame size={14} /> Acepto el Desafío
                      </>
                    )}
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-[#16181d]/50 border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
                <HelpCircle size={36} className="text-white/20 mb-3" />
                <h4 className="text-white/80 font-bold text-sm">Esperando Datos de Entrada</h4>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  Selecciona tu estado emocional a la izquierda para generar una guía de mitigación de procrastinación a tu medida, {profile.name}.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
