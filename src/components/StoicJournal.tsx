import { useState, FormEvent } from 'react';
import { BookOpen, Sparkles, Trash, Calendar, Brain, Heart, Star, Award, PenTool, CheckCircle, ShieldAlert } from 'lucide-react';
import { UserProfile, StoicJournalEntry } from '../types';

interface StoicJournalProps {
  profile: UserProfile;
  onAddPDP: (points: number, reason: string) => void;
  journalEntries: StoicJournalEntry[];
  onSaveEntry: (entry: StoicJournalEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const STOIC_QUOTES = [
  {
    quote: "Cada día debemos presentarnos ante nuestro propio tribunal para examinar nuestra conducta.",
    author: "Séneca",
    source: "De la Ira"
  },
  {
    quote: "Mira hacia adentro. Dentro de ti está la fuente del bien, la cual siempre tiene el poder de brotar si sigues excavando.",
    author: "Marco Aurelio",
    source: "Meditaciones"
  },
  {
    quote: "Ninguna persona es libre si no es dueña de sí misma.",
    author: "Epicteto",
    source: "Discursos"
  },
  {
    quote: "No es que tengamos poco tiempo, sino que perdemos mucho.",
    author: "Séneca",
    source: "Sobre la brevedad de la vida"
  },
  {
    quote: "Al amanecer, dite a ti mismo: me encontraré con personas indiscretas, ingratas, insolentes... todo eso les sucede por ignorancia del bien y del mal.",
    author: "Marco Aurelio",
    source: "Meditaciones"
  }
];

export default function StoicJournal({
  profile,
  onAddPDP,
  journalEntries,
  onSaveEntry,
  onDeleteEntry
}: StoicJournalProps) {
  // Form States
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [howToImprove, setHowToImprove] = useState('');
  const [calmLevel, setCalmLevel] = useState<number>(4);
  const [disciplinedRating, setDisciplinedRating] = useState<number>(4);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  // Active Quote Index
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * STOIC_QUOTES.length));

  // Today's Date String
  const todayStr = new Date().toISOString().split('T')[0];
  const hasEntryToday = journalEntries.some(entry => entry.date === todayStr);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!whatWentWell.trim() || !whatWentWrong.trim() || !howToImprove.trim()) {
      setValidationError("Por favor, responde a las tres preguntas reflexivas antes de guardar.");
      return;
    }
    setValidationError(null);

    const pdpReward = 25;

    const newEntry: StoicJournalEntry = {
      id: `journal-${Date.now()}`,
      date: todayStr,
      createdAt: new Date().toISOString(),
      whatWentWell: whatWentWell.trim(),
      whatWentWrong: whatWentWrong.trim(),
      howToImprove: howToImprove.trim(),
      calmLevel,
      disciplinedRating,
      pdpAwarded: pdpReward
    };

    onSaveEntry(newEntry);
    onAddPDP(pdpReward, "Examen de Conciencia Nocturno (Diario Stoico)");

    // Clear form
    setWhatWentWell('');
    setWhatWentWrong('');
    setHowToImprove('');
    setCalmLevel(4);
    setDisciplinedRating(4);

    setSuccessMessage(`¡Reflexión guardada con éxito, ${profile.name}! Has ganado +${pdpReward} Puntos de Disciplina (PDP) por tu honestidad y autoevaluación.`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const changeQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % STOIC_QUOTES.length);
  };

  return (
    <div id="stoic-journal-section" className="space-y-6 animate-fade-in">
      
      {/* PHILOSOPHICAL BANNER */}
      <div className="bg-gradient-to-r from-[#18191e] to-[#121316] border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Examen Diario
              </span>
              <span className="text-white/40 text-xs font-mono">• Práctica de Séneca</span>
            </div>
            <h3 className="text-xl font-sans font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-amber-400" /> El Diario Estoico de {profile.name}
            </h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Los estoicos terminaban el día examinando su propia conducta con total honestidad. 
              No para juzgarse con crueldad, sino para aprender de sus errores y consagrar el día de mañana a la virtud.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 md:max-w-xs w-full flex flex-col justify-between min-h-[120px]">
            <div>
              <p className="text-[11px] italic text-white/70 leading-relaxed">
                "{STOIC_QUOTES[quoteIndex].quote}"
              </p>
              <p className="text-[10px] font-mono font-bold text-amber-400 mt-2 text-right">
                — {STOIC_QUOTES[quoteIndex].author}, <span className="text-white/40 font-normal">{STOIC_QUOTES[quoteIndex].source}</span>
              </p>
            </div>
            <button
              id="next-quote-btn"
              type="button"
              onClick={changeQuote}
              className="text-left text-[9px] font-mono text-white/30 hover:text-amber-400 transition-colors mt-2 uppercase tracking-wider"
            >
              🔄 Siguiente cita de sabiduría
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: ADD ENTRY FORM */}
        <div className="lg:col-span-7">
          <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
              <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PenTool size={16} className="text-amber-400" /> Reflexión de Hoy ({new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})
              </h4>
              {hasEntryToday && (
                <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle size={10} /> Ya completado hoy
                </span>
              )}
            </div>

            {successMessage && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in">
                <Sparkles size={16} className="shrink-0 text-emerald-400 mt-0.5 animate-pulse" />
                <p>{successMessage}</p>
              </div>
            )}

            {hasEntryToday ? (
              <div className="bg-[#121417] border border-white/5 rounded-xl p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                  <Award size={24} className="text-amber-400" />
                </div>
                <h5 className="text-sm font-bold text-white">¡Has concluido tu reflexión del día de hoy!</h5>
                <p className="text-xs text-white/40 max-w-sm mx-auto">
                  Has ganado tus +25 PDP y completado tu examen estoico. Puedes ver tus respuestas o eliminar el registro abajo para volver a reflexionar si lo deseas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Textarea 1 */}
                <div className="space-y-1.5">
                  <label htmlFor="well-input" className="block text-[11px] font-mono font-bold text-white/60 uppercase">
                    1. ¿Qué hice bien hoy? <span className="text-amber-400/80 font-sans font-normal text-[10px] italic">(Éxitos, enfoque mantenido, conducta virtuosa)</span>
                  </label>
                  <textarea
                    id="well-input"
                    rows={2}
                    className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                    placeholder="Ej. Me mantuve enfocado durante el Pomodoro de la tarde sin abrir redes sociales, y logré completar 2 de las tareas planificadas a tiempo..."
                    value={whatWentWell}
                    onChange={(e) => setWhatWentWell(e.target.value)}
                  />
                </div>

                {/* Textarea 2 */}
                <div className="space-y-1.5">
                  <label htmlFor="wrong-input" className="block text-[11px] font-mono font-bold text-white/60 uppercase">
                    2. ¿En qué fallé o me distraje? <span className="text-rose-400/80 font-sans font-normal text-[10px] italic">(Procrastinación, impulsos, debilidades)</span>
                  </label>
                  <textarea
                    id="wrong-input"
                    rows={2}
                    className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                    placeholder="Ej. Cedí a la tentación de revisar el teléfono durante el bloque de las 11:00 am, perdiendo unos 15 minutos en mensajes innecesarios..."
                    value={whatWentWrong}
                    onChange={(e) => setWhatWentWrong(e.target.value)}
                  />
                </div>

                {/* Textarea 3 */}
                <div className="space-y-1.5">
                  <label htmlFor="improve-input" className="block text-[11px] font-mono font-bold text-white/60 uppercase">
                    3. ¿Cómo puedo mejorar mañana? <span className="text-blue-400/80 font-sans font-normal text-[10px] italic">(Estrategia clara, lección aprendida)</span>
                  </label>
                  <textarea
                    id="improve-input"
                    rows={2}
                    className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                    placeholder="Ej. Mañana apagaré las notificaciones del móvil por completo y lo dejaré en otra habitación antes de comenzar mis bloques de Trabajo Profundo..."
                    value={howToImprove}
                    onChange={(e) => setHowToImprove(e.target.value)}
                  />
                </div>

                {/* SCALES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  
                  {/* Calm Level */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">
                      Ataraxia / Calma Stoica: {calmLevel} / 5
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          id={`calm-btn-${val}`}
                          type="button"
                          onClick={() => setCalmLevel(val)}
                          className={`flex-1 py-1 px-2 rounded font-mono text-xs font-bold transition-all border cursor-pointer ${
                            calmLevel === val
                              ? 'bg-amber-500 border-amber-500 text-black'
                              : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-white/30 italic">
                      {calmLevel <= 2 ? 'Mucha agitación y reactividad' : calmLevel === 3 ? 'Calma aceptable con distracciones' : 'Mucha paz mental y serenidad'}
                    </p>
                  </div>

                  {/* Discipline Rating */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">
                      Templanza / Disciplina: {disciplinedRating} / 5
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          id={`disc-btn-${val}`}
                          type="button"
                          onClick={() => setDisciplinedRating(val)}
                          className={`flex-1 py-1 px-2 rounded font-mono text-xs font-bold transition-all border cursor-pointer ${
                            disciplinedRating === val
                              ? 'bg-amber-500 border-amber-500 text-black'
                              : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-white/30 italic">
                      {disciplinedRating <= 2 ? 'Sucumbí a impulsos y excusas' : disciplinedRating === 3 ? 'Disciplina moderada' : 'Firme ante las debilidades y fiel a mi plan'}
                    </p>
                  </div>

                </div>

                {validationError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <ShieldAlert size={16} className="shrink-0 text-rose-400" />
                    <span>{validationError}</span>
                  </div>
                )}

                <button
                  id="save-reflection-btn"
                  type="submit"
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Award size={14} /> Guardar Reflexión Nocturna (+25 PDP)
                </button>

              </form>
            )}

          </div>
        </div>

        {/* RIGHT: PAST ENTRIES */}
        <div className="lg:col-span-5">
          <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar size={16} className="text-amber-400" /> Historial de Reflexiones
              </h4>
              <span className="text-[10px] font-mono font-bold bg-white/5 text-amber-200 px-2 py-0.5 rounded border border-white/10">
                {journalEntries.length} {journalEntries.length === 1 ? 'Entrada' : 'Entradas'}
              </span>
            </div>

            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {journalEntries.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                  <p className="text-xs text-white/40">No hay reflexiones registradas todavía.</p>
                  <p className="text-[10px] text-white/30 mt-1 max-w-xs mx-auto">
                    Termina tu primer día de disciplina escribiendo tu examen diario en el formulario de la izquierda.
                  </p>
                </div>
              ) : (
                journalEntries
                  .slice()
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((entry) => (
                    <div
                      key={entry.id}
                      id={`entry-card-${entry.id}`}
                      className="bg-[#121417]/60 border border-white/5 rounded-xl p-4 space-y-3 relative group hover:border-white/10 transition-all"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                            {getDayName(entry.date)}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-mono text-white/40 flex items-center gap-0.5" title="Calma Stoica">
                              <Brain size={10} className="text-amber-400/50" /> Ataraxia: <strong className="text-white/70">{entry.calmLevel}/5</strong>
                            </span>
                            <span className="text-white/20 text-[9px]">•</span>
                            <span className="text-[9px] font-mono text-white/40 flex items-center gap-0.5" title="Templanza">
                              <Heart size={10} className="text-rose-400/50" /> Templanza: <strong className="text-white/70">{entry.disciplinedRating}/5</strong>
                            </span>
                          </div>
                        </div>
                        <button
                          id={`delete-entry-${entry.id}`}
                          type="button"
                          onClick={() => setDeletingEntryId(entry.id)}
                          className="text-white/20 hover:text-rose-400 p-1 hover:bg-white/5 rounded transition-colors cursor-pointer"
                          title="Eliminar registro"
                        >
                          <Trash size={12} />
                        </button>
                      </div>

                      <div className="space-y-2 text-xs border-t border-white/5 pt-2.5">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-white/30 block uppercase tracking-wider">Lo que se hizo bien:</span>
                          <p className="text-white/70 text-[11px] leading-relaxed mt-0.5 italic">"{entry.whatWentWell}"</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono font-bold text-white/30 block uppercase tracking-wider">Desvíos o Distracciones:</span>
                          <p className="text-white/70 text-[11px] leading-relaxed mt-0.5 italic">"{entry.whatWentWrong}"</p>
                        </div>
                        <div className="bg-amber-500/[0.02] border border-amber-500/10 rounded-lg p-2 mt-1">
                          <span className="text-[9px] font-mono font-bold text-amber-400/80 block uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={9} /> Plan de mejora para mañana:
                          </span>
                          <p className="text-amber-200/90 text-[11px] leading-relaxed mt-0.5 italic">"{entry.howToImprove}"</p>
                        </div>
                      </div>

                      <div className="text-[9px] font-mono text-white/30 text-right">
                        Reflexión completada • +{entry.pdpAwarded} PDP
                      </div>
                    </div>
                  ))
              )}
            </div>

          </div>
        </div>

      </div>

      {/* IN-APP DELETE CONFIRMATION MODAL (REPLACES WINDOW.CONFIRM) */}
      {deletingEntryId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181d] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <Trash size={18} />
              </div>
              <h3 className="text-sm font-bold text-white">¿Eliminar esta reflexión?</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Esta reflexión se borrará de tu historial estoico permanentemente. ¿Deseas continuar?
            </p>
            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeletingEntryId(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold rounded-xl border border-white/10 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteEntry(deletingEntryId);
                  setDeletingEntryId(null);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
