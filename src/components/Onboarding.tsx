import { useState } from 'react';
import { User, Target, ShieldAlert, Award, Clock, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const WEAKNESSES = [
  {
    id: 'procrastination',
    title: 'Procrastinación',
    description: 'Dificultad para iniciar tareas importantes, posponiendo compromisos con excusas.',
    icon: Clock,
    color: 'border-amber-200 text-amber-600 bg-amber-50/50 hover:bg-amber-50 focus:ring-amber-500',
  },
  {
    id: 'focus',
    title: 'Falta de Enfoque y Distracciones',
    description: 'Interrupciones constantes por redes sociales, correos o multitarea ineficaz.',
    icon: Target,
    color: 'border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-50 focus:ring-blue-500',
  },
  {
    id: 'punctuality',
    title: 'Falta de Planificación',
    description: 'Ausencia de horarios estructurados o impuntualidad al cumplir objetivos diarios.',
    icon: ShieldAlert,
    color: 'border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 focus:ring-indigo-500',
  },
  {
    id: 'fatigue',
    title: 'Fatiga Mental y Burnout',
    description: 'Agotamiento que reduce el rendimiento por no respetar descansos estratégicos.',
    icon: Award,
    color: 'border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 focus:ring-rose-500',
  },
];

const GOALS = [
  { id: 'skill', label: 'Desarrollar una nueva habilidad técnica/profesional' },
  { id: 'efficiency', label: 'Entregar proyectos y tareas antes de las fechas límite' },
  { id: 'routine', label: 'Establecer una rutina diaria sólida y consistente' },
  { id: 'focus_under_pressure', label: 'Mantener la calma y enfoque bajo altos niveles de estrés' },
  { id: 'screen_time', label: 'Reducir el tiempo de pantalla improductivo' },
  { id: 'wellbeing', label: 'Equilibrar el alto rendimiento con bienestar mental' },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Justin');
  const [role, setRole] = useState('Desarrollador de Alto Rendimiento');
  const [dailyHoursTarget, setDailyHoursTarget] = useState(6);
  const [mainWeakness, setMainWeakness] = useState('procrastination');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['routine', 'skill', 'focus_under_pressure']);
  const [agreedToCommit, setAgreedToCommit] = useState(false);

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter(g => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete Onboarding
      const profile: UserProfile = {
        name: name.trim() || 'Justin',
        role: role.trim() || 'Desarrollador de Alto Rendimiento',
        dailyHoursTarget,
        mainWeakness,
        goals: selectedGoals,
        level: 1,
        pdp: 100, // Starting point
        streak: 1,
        lastActive: new Date().toISOString(),
        onboarded: true,
      };
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    if (step === 1) return name.trim().length > 0 && role.trim().length > 0;
    if (step === 2) return mainWeakness !== '';
    if (step === 3) return selectedGoals.length > 0;
    if (step === 4) return agreedToCommit;
    return false;
  };

  return (
    <div id="onboarding-container" className="max-w-2xl mx-auto my-8 bg-[#16181d] border border-white/5 shadow-2xl rounded-2xl overflow-hidden transition-all">
      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-1.5 flex">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 transition-all duration-500 h-full ${
              s <= step ? 'bg-gradient-to-r from-amber-300 to-amber-500' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      <div className="p-8 md:p-12">
        {/* Step 1: Welcome & Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in" id="step-1">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-amber-200 uppercase flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400 animate-pulse" /> Paso 01: Identidad Profesional
              </span>
              <h2 className="text-3xl font-serif italic text-white/90 tracking-tight">
                Diseñemos tu Entorno de Alto Rendimiento
              </h2>
              <p className="text-white/40 text-sm leading-relaxed font-sans">
                Para guiar tu crecimiento, necesitamos conocer tu perfil básico y tus ambiciones de disciplina.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-white/50 uppercase tracking-widest" htmlFor="user-name">
                  ¿Cómo deberíamos llamarte?
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="user-name"
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Ej. Justin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-white/50 uppercase tracking-widest" htmlFor="user-role">
                  ¿Cuál es tu rol o profesión?
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="user-role"
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Ej. Software Engineer, Diseñadora UX, Consultor"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-mono font-medium text-white/50 uppercase tracking-widest" htmlFor="hours-slider">
                    Objetivo de Enfoque Diario (Horas)
                  </label>
                  <span className="text-sm font-mono font-bold text-amber-400">{dailyHoursTarget} horas/día</span>
                </div>
                <input
                  id="hours-slider"
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                  value={dailyHoursTarget}
                  onChange={(e) => setDailyHoursTarget(Number(e.target.value))}
                />
                <p className="text-[11px] text-white/30 italic">
                  Recomendación: Para mantener la salud cognitiva y la creatividad, apunta a 4-6 horas de Deep Work real.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Main Weakness */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in" id="step-2">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-amber-200 uppercase">
                Paso 02: Autodiagnóstico Sincero
              </span>
              <h2 className="text-3xl font-serif italic text-white/90 tracking-tight">
                ¿Cuál es tu principal obstáculo?
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                La autodisciplina madura empieza por reconocer con precisión en qué estamos fallando. Selecciona el área de mayor fuga de productividad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {WEAKNESSES.map((weakness) => {
                const IconComponent = weakness.icon;
                const isSelected = mainWeakness === weakness.id;
                return (
                  <button
                    key={weakness.id}
                    id={`weakness-btn-${weakness.id}`}
                    type="button"
                    onClick={() => setMainWeakness(weakness.id)}
                    className={`p-4 text-left border rounded-xl transition-all cursor-pointer flex flex-col justify-between h-40 ${
                      isSelected
                        ? 'border-amber-400 bg-white/5 ring-1 ring-amber-500/20 shadow-md shadow-amber-500/5'
                        : 'border-white/10 bg-[#121417]/80 hover:border-white/20 hover:bg-[#121417]'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className={`p-2 rounded-lg border ${isSelected ? 'bg-white/5 border-amber-400' : 'bg-[#121417] border-white/5'}`}>
                        <IconComponent size={18} className={isSelected ? 'text-amber-400' : 'text-white/30'} />
                      </div>
                      {isSelected && (
                        <div className="bg-amber-500 text-black rounded-full p-0.5">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${isSelected ? 'text-amber-200' : 'text-white/80'}`}>{weakness.title}</h4>
                      <p className="text-white/40 text-xs mt-1 leading-snug">{weakness.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in" id="step-3">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-amber-200 uppercase">
                Paso 03: Objetivos de Crecimiento
              </span>
              <h2 className="text-3xl font-serif italic text-white/90 tracking-tight">
                ¿Qué buscas conquistar con esta app?
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                Define tus metas prioritarias de desarrollo para orientar el sistema de recompensas y el motor motivacional. (Selecciona al menos una).
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    id={`goal-btn-${goal.id}`}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full p-4 border rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-white/5 shadow-sm'
                        : 'border-white/10 hover:border-white/20 bg-[#121417]/80'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-amber-200' : 'text-white/70'}`}>
                      {goal.label}
                    </span>
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-[#0d0e10]' : 'border-white/20'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Engagement & Commitment */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in text-center py-4" id="step-4">
            <div className="inline-flex p-3 bg-white/5 rounded-full border border-white/10 text-amber-400 mb-2">
              <Award size={36} className="animate-pulse" />
            </div>
            
            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-xs font-mono font-semibold tracking-wider text-amber-200 uppercase tracking-widest">
                Paso Final: El Compromiso de Honor
              </span>
              <h2 className="text-2xl font-serif italic text-white/90">
                Pacto de Disciplina Profesional
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                No buscamos un juego infantil de puntos de colores. Buscamos cambiar tus hábitos laborales y liberar tu verdadero potencial creativo.
              </p>
            </div>

            <div className="bg-[#121417]/90 border border-white/10 rounded-xl p-5 max-w-md mx-auto text-left space-y-3">
              <div className="flex gap-3">
                <div className="text-amber-400 mt-0.5">•</div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Me comprometo a registrar mis relajes de enfoque con honestidad, entendiéndolos como oportunidades de mejora y no como fracasos.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="text-amber-400 mt-0.5">•</div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Utilizaré los bloques de tiempo (Time Blocking) para estructurar proactivamente mi enfoque y entrenar mi mente diariamente.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="text-amber-400 mt-0.5">•</div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Respetaré los tiempos de descanso estratégico para maximizar la resistencia cognitiva de largo plazo.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  id="commit-checkbox"
                  type="checkbox"
                  checked={agreedToCommit}
                  onChange={(e) => setAgreedToCommit(e.target.checked)}
                  className="w-5 h-5 rounded text-amber-500 bg-white/5 focus:ring-amber-500 border-white/20 accent-amber-500"
                />
                <span className="text-xs font-semibold text-white/70 hover:text-white transition-colors">
                  Acepto el pacto y asumo la responsabilidad de mi crecimiento.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Buttons navigation */}
        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                id="onboarding-back-btn"
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-white/10 text-white/70 hover:bg-white/5 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft size={16} /> Atrás
              </button>
            )}
          </div>
          <div>
            <button
              id="onboarding-next-btn"
              type="button"
              disabled={!isStepValid()}
              onClick={handleNext}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isStepValid()
                  ? 'bg-amber-500 text-[#0d0e10] hover:bg-amber-400 shadow-md shadow-amber-500/5'
                  : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
              }`}
            >
              {step === 4 ? 'Iniciar Mi Camino' : 'Continuar'}
              {step < 4 ? <ArrowRight size={16} /> : <Check size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
