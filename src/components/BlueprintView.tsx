import { useState } from 'react';
import { Compass, ShieldAlert, Award, Server, Database, Milestone, Sparkles, Code, FileCode } from 'lucide-react';

const SECTIONS = [
  { id: 'arch', label: '1. Arquitectura y Módulos', icon: Compass },
  { id: 'gamification', label: '2. Gamificación y Disciplina', icon: Award },
  { id: 'onboarding', label: '3. Flujo Onboarding', icon: ShieldAlert },
  { id: 'stack', label: '4. Stack Tecnológico', icon: Server },
  { id: 'database', label: '5. Estructura de Datos (NoSQL)', icon: Database },
  { id: 'roadmap', label: '6. Roadmap del MVP', icon: Milestone },
];

export default function BlueprintView() {
  const [activeTab, setActiveTab] = useState('arch');

  return (
    <div id="blueprint-hub" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* LEFT: Sidebar Navigation (3 cols) */}
      <div className="lg:col-span-3 space-y-2">
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-4 shadow-xl space-y-1">
          <span className="text-[10px] font-mono font-bold text-white/40 uppercase px-3 block mb-3 tracking-widest">
            Especificaciones Técnicas
          </span>
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                id={`blueprint-tab-${sec.id}`}
                type="button"
                onClick={() => setActiveTab(sec.id)}
                className={`w-full p-2.5 rounded-lg text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-[#0d0e10] shadow-lg shadow-amber-500/10 font-extrabold'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Content Area (9 cols) */}
      <div className="lg:col-span-9">
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl min-h-[480px]">
                 {/* TAB 1: Architecture & Modules */}
          {activeTab === 'arch' && (
            <div className="space-y-6" id="spec-arch">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-2xl font-sans font-extrabold text-white">
                  1. Arquitectura de Módulos Core
                </h3>
                <p className="text-xs text-white/40 mt-1">Sistemas de software para la autogestión de la productividad.</p>
              </div>

              <div className="space-y-4 text-xs text-white/70 leading-relaxed">
                <div>
                  <h4 className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> Módulo 01: Gestor de Tiempo Profesional (Time Blocking)
                  </h4>
                  <p className="mt-1.5 pl-3">
                    A diferencia de los calendarios reactivos clásicos que invitan a reaccionar a correos y notificaciones, nuestro <strong>Time Blocker</strong> promueve la asertividad cognitiva. Estructura el día en bloques duros ininterrumpidos y descansos restauradores.
                  </p>
                  <ul className="list-disc pl-7 mt-1.5 space-y-1 text-[11px] text-white/45">
                    <li><strong>Algoritmo de Pomodoro Táctico:</strong> Intervalos rígidos con micro-notificaciones biológicas (Web Audio API) que alertan fatiga inminente.</li>
                    <li><strong>Categorización de Enfoque:</strong> Clasificación inmediata de tareas (Deep Work, Admin, Learning, Routine, Meeting) para analizar en qué gasta el usuario sus recursos cognitivos reales.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> Módulo 02: Módulo de Diagnóstico y Áreas de Mejora
                  </h4>
                  <p className="mt-1.5 pl-3">
                    Un sistema clínico y reflexivo donde el usuario registra con honestidad en qué área flaquea (ej. <em>Procrastinación, falta de enfoque, impuntualidad, fatiga mental</em>).
                  </p>
                  <ul className="list-disc pl-7 mt-1.5 space-y-1 text-[11px] text-white/45">
                    <li><strong>Logging de Doble Entrada:</strong> El usuario documenta activamente tanto "Relapsos" (caídas en distracciones) como "Victorias" (resistir el impulso improductivo).</li>
                    <li><strong>Índice de Disciplina (SVG):</strong> Gráfico matemático propietario que calcula un puntaje ponderado de resiliencia dopaminérgica de los últimos 7 días.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> Módulo 03: Motor de Motivación Inteligente
                  </h4>
                  <p className="mt-1.5 pl-3">
                    Un asistente cognitivo estoico. En lugar de citas inspiracionales genéricas e infantiles, este sistema evalúa el estado emocional reportado por el usuario (sobrecarga, dispersión, evasión) y ofrece pautas racionales concretas.
                  </p>
                  <ul className="list-disc pl-7 mt-1.5 space-y-1 text-[11px] text-white/45">
                    <li><strong>Análisis Stoic-AI:</strong> Mapeo directo entre la flaqueza del usuario y las máximas de Marco Aurelio, Séneca o Epicteto para templar la mente frente al estrés laboral.</li>
                    <li><strong>Micro-desafíos Inmediatos:</strong> Retos accionables e incrementales de bajo roce físico para romper la parálisis del análisis.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Gamification */}
          {activeTab === 'gamification' && (
            <div className="space-y-6" id="spec-gamification">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-2xl font-sans font-extrabold text-white">
                  2. Estrategia de Gamificación Madura
                </h3>
                <p className="text-xs text-white/40 mt-1">Cómo retener y enganchar a profesionales sin caer en mecánicas infantiles.</p>
              </div>

              <div className="space-y-4 text-xs text-white/70 leading-relaxed">
                <p>
                  El mayor error de las aplicaciones de productividad modernas es tratarlas como "RPG infantiles", agregando mascotas, espadas de oro o ruidos estridentes que restan seriedad al ambiente laboral. Nuestra estrategia promueve un <strong>concepto sobrio, estoico y de desarrollo de carácter</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                    <h4 className="font-bold text-amber-200 text-xs uppercase tracking-wider">Métrica: PDP (Puntos de Disciplina Profesional)</h4>
                    <p className="text-[11px] leading-relaxed text-white/50">
                      El PDP es una moneda de reputación intransferible que mide la integridad del usuario consigo mismo. No se gana matando monstruos virtuales; se gana completando bloques planificados, registrando victorias o respetando descansos biológicos.
                    </p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                    <h4 className="font-bold text-amber-200 text-xs uppercase tracking-wider">Niveles de Madurez Cognitiva</h4>
                    <p className="text-[11px] leading-relaxed text-white/50">
                      Rango evolutivo de enfoque personal en lugar de títulos mágicos:
                    </p>
                    <ol className="list-decimal pl-5 text-[10px] space-y-1 mt-1 font-mono text-white/40">
                      <li>Iniciado Autocrítico (0 - 300 PDP)</li>
                      <li>Pragmático Enfocado (301 - 600 PDP)</li>
                      <li>Arquitecto de Rutinas (601 - 900 PDP)</li>
                      <li>Muralla Anti-Distracciones (901 - 1200 PDP)</li>
                      <li>Cronógrafo Humano (1201+ PDP)</li>
                    </ol>
                  </div>
                </div>

                <div className="p-4 border border-dashed border-white/10 rounded-xl space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">Rachas (Streaks) Integrales de Carácter</h4>
                  <p className="text-[11px] text-white/50">
                    La racha mide la consistencia diaria en registrar el enfoque. Perder la racha es un recordatorio severo de que la constancia exige atención diaria. Sin embargo, no hay castigos artificiales: el sistema promueve que restablecer el hábito es el verdadero triunfo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Onboarding */}
          {activeTab === 'onboarding' && (
            <div className="space-y-6" id="spec-onboarding">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-2xl font-sans font-extrabold text-white">
                  3. Flujo Onboarding y Perfilado
                </h3>
                <p className="text-xs text-white/40 mt-1">Secuencia crítica para configurar el entorno dopaminérgico del usuario.</p>
              </div>

              <div className="space-y-4 text-xs text-white/70 leading-relaxed">
                <p>
                  El onboarding clínico tiene como meta que el usuario confiese sinceramente su flaqueza dominante para que el motor inteligente no tenga que adivinar sus hábitos.
                </p>

                <div className="space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">Algoritmo de Preguntas e Impacto en Datos:</h4>
                  <div className="space-y-3 pl-3">
                    <div className="flex gap-2">
                      <span className="font-mono font-bold text-amber-200">Q1. Identidad y Rol:</span>
                      <p className="text-[11px] text-white/80">¿Cuál es tu nombre y tu rol profesional? <span className="text-white/30 font-mono">(Establece contexto cognitivo para el Motor de Motivación).</span></p>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-mono font-bold text-amber-200">Q2. Meta de Tiempo:</span>
                      <p className="text-[11px] text-white/80">¿Cuántas horas de Deep Work apuntas diariamente? <span className="text-white/30 font-mono">(Establece el divisor del indicador de rendimiento de la agenda).</span></p>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-mono font-bold text-amber-200">Q3. Autodiagnóstico de Flaqueza:</span>
                      <p className="text-[11px] text-white/80">Selecciona tu talón de Aquiles: <em>Procrastinación, falta de enfoque, falta de planificación o fatiga mental</em>. <span className="text-white/30 font-mono">(Sintoniza las alertas, estrategias y desafíos).</span></p>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-mono font-bold text-amber-200">Q4. El Pacto de Honor:</span>
                      <p className="text-[11px] text-white/80">Aceptación de las tres promesas de disciplina. <span className="text-white/30 font-mono">(Habilita el primer Badge "Pacto de Honor" y otorga los primeros 100 PDP).</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Tech Stack */}
          {activeTab === 'stack' && (
            <div className="space-y-6" id="spec-stack">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-2xl font-sans font-extrabold text-white">
                  4. Stack Tecnológico del Proyecto
                </h3>
                <p className="text-xs text-white/40 mt-1">Recomendaciones del Arquitecto para desarrollo ágil y escalable.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-white/70">
                <div className="p-4 border border-white/5 bg-[#121417]/90 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-200 text-sm flex items-center gap-1">
                    <Code size={16} /> Frontend
                  </h4>
                  <ul className="space-y-1 text-[11px] list-disc pl-4 text-white/50">
                    <li><strong>React 19 + TypeScript:</strong> UI tipada y reactiva ultra-rápida.</li>
                    <li><strong>Tailwind CSS v4:</strong> Diseño fluido de alta densidad sin generar hojas CSS redundantes.</li>
                    <li><strong>Lucide Icons:</strong> Set de iconos vectoriales ligero y estético.</li>
                  </ul>
                </div>

                <div className="p-4 border border-white/5 bg-[#121417]/90 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-200 text-sm flex items-center gap-1">
                    <Database size={16} /> Backend & DB
                  </h4>
                  <ul className="space-y-1 text-[11px] list-disc pl-4 text-white/50">
                    <li><strong>Firebase Firestore:</strong> Base de datos NoSQL de baja latencia con sincronización offline nativa y consultas en tiempo real.</li>
                    <li><strong>Firebase Authentication:</strong> Gestión segura e inmediata de sesiones con Google Sign-In.</li>
                  </ul>
                </div>

                <div className="p-4 border border-white/5 bg-[#121417]/90 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-200 text-sm flex items-center gap-1">
                    <Sparkles size={16} /> AI Engine
                  </h4>
                  <ul className="space-y-1 text-[11px] list-disc pl-4 text-white/50">
                    <li><strong>@google/genai (Gemini 3.5 Flash):</strong> Orquestación de insights motivacionales contextuales y análisis estricto de resistencia cognitiva.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Database Schema */}
          {activeTab === 'database' && (
            <div className="space-y-6" id="spec-database">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-2xl font-sans font-extrabold text-white">
                  5. Estructura de Datos NoSQL (Firestore)
                </h3>
                <p className="text-xs text-white/40 mt-1">Modelos de entidades definidos para la sincronización en la nube.</p>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold text-white/40 uppercase flex items-center gap-1">
                  <FileCode size={12} /> JSON Entity Definitions (NoSQL Blueprint)
                </span>

                <pre className="p-4 bg-black/40 text-amber-200 font-mono text-[10px] rounded-xl overflow-x-auto leading-relaxed border border-white/5">
{`// Colección: /users/{userId} (Perfil del Usuario)
{
  "name": "Sofía Mendoza",
  "role": "Diseñadora UX / Product Designer",
  "dailyHoursTarget": 6,
  "mainWeakness": "focus", // ['procrastination', 'focus', 'punctuality', 'fatigue']
  "goals": ["routine", "efficiency"],
  "level": 2,
  "pdp": 450,
  "streak": 5,
  "lastActive": "2026-06-29T01:00:00Z"
}

// Colección: /users/{userId}/timeblocks/{blockId} (Time Blocking)
{
  "title": "Diseño de Wireframes MVP",
  "duration": 45, // en minutos
  "category": "Deep Work", // ['Deep Work', 'Admin', 'Learning', 'Routine', 'Meeting']
  "completed": true,
  "scheduledAt": "10:30"
}

// Colección: /users/{userId}/incidents/{incidentId} (Logs de Autodisciplina)
{
  "timestamp": "2026-06-29T10:45:00Z",
  "type": "victory", // ['victory', 'relapse']
  "weakness": "focus",
  "description": "Evité mirar el teléfono durante los 45 minutos de diseño de wireframes.",
  "pdpDelta": 40
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: MVP Roadmap */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6" id="spec-roadmap">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-2xl font-sans font-extrabold text-white">
                  6. Roadmap de Lanzamiento MVP
                </h3>
                <p className="text-xs text-white/40 mt-1">Plan de ejecución de sprints ágiles para llegar a mercado.</p>
              </div>

              <div className="space-y-4">
                <div className="relative border-l border-white/10 pl-6 ml-3 space-y-6">
                  
                  {/* Phase 1 */}
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1 bg-[#16181d] border border-white/10 text-amber-200 rounded-full w-4.5 h-4.5 flex items-center justify-center font-mono text-[9px] font-bold">
                      1
                    </span>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">Sprint 01: Onboarding e Identidad Profesional</h4>
                    <p className="text-[11px] text-white/50 mt-1">
                      Desarrollo del flujo interactivo de diagnóstico. Creación de la base de datos en Firestore de perfiles de usuario y configuración de seguridad estricta para evitar la manipulación de PII de terceros.
                    </p>
                  </div>

                  {/* Phase 2 */}
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1 bg-[#16181d] border border-white/10 text-amber-200 rounded-full w-4.5 h-4.5 flex items-center justify-center font-mono text-[9px] font-bold">
                      2
                    </span>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">Sprint 02: Agenda, Time Blocking & Pomodoro</h4>
                    <p className="text-[11px] text-white/50 mt-1">
                      Implementación del scheduler diario y el cronómetro de foco. Integración de la Web Audio API local para las notificaciones sin dependencias de red, y los callbacks automáticos que registran las sesiones finalizadas.
                    </p>
                  </div>

                  {/* Phase 3 */}
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1 bg-[#16181d] border border-white/10 text-amber-200 rounded-full w-4.5 h-4.5 flex items-center justify-center font-mono text-[9px] font-bold">
                      3
                    </span>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">Sprint 03: Módulo Clínico de Debilidades y Gamificación</h4>
                    <p className="text-[11px] text-white/50 mt-1">
                      Tablero de incidencias y victorias. Conexión de los logs con el puntaje de PDP y actualización dinámica de niveles e insignias en Firestore. Dibujo de gráficos interactivos para trazar el rendimiento del usuario.
                    </p>
                  </div>

                  {/* Phase 4 */}
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1 bg-[#16181d] border border-white/10 text-amber-200 rounded-full w-4.5 h-4.5 flex items-center justify-center font-mono text-[9px] font-bold">
                      4
                    </span>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">Sprint 04: Motor de Motivación Stoic-AI e Integración</h4>
                    <p className="text-[11px] text-white/50 mt-1">
                      Integración del SDK de Gemini `@google/genai` en un proxy de backend para procesar el estado emocional del usuario y generar reportes cognitivos de alta calidad. QA final y despliegue a Cloud Run / Firebase Hosting.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
