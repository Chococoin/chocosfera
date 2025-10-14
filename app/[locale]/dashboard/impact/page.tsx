'use client';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

interface Achievement {
  id: string;
  title: string;
  current: number;
  target: number;
  icon: string;
  color: string;
}

export default function ImpactPage() {
  // Usuario stats
  const userLevel = 7;
  const currentXP = 2340;
  const nextLevelXP = 3000;
  const progressPercent = (currentXP / nextLevelXP) * 100;

  // Impacto ambiental
  const environmentalImpact = [
    { label: 'CO₂ Capturado', value: '288 kg', icon: '🌍', color: 'green', comparison: '+45% vs promedio' },
    { label: 'Agua Ahorrada', value: '1,200 L', icon: '💧', color: 'blue', comparison: '+32% vs promedio' },
    { label: 'Biodiversidad', value: '12 especies', icon: '🦋', color: 'purple', comparison: 'Protegidas' },
    { label: 'Suelo Regenerado', value: '45 m²', icon: '🌱', color: 'emerald', comparison: '+28% vs promedio' },
  ];

  // Impacto social
  const socialImpact = [
    { label: 'Familias Apoyadas', value: '8', icon: '👨‍👩‍👧‍👦', color: 'orange' },
    { label: 'Ingreso Generado', value: '$1,440', icon: '💰', color: 'yellow' },
    { label: 'Educación', value: '3 niños', icon: '📚', color: 'pink' },
    { label: 'Salud', value: '5 chequeos', icon: '🏥', color: 'red' },
  ];

  // Badges
  const badges: Badge[] = [
    {
      id: 'first-tree',
      name: 'Primer Árbol',
      description: 'Adoptaste tu primer árbol',
      icon: '🌱',
      unlocked: true,
      date: '15 Ene 2024',
    },
    {
      id: 'eco-warrior',
      name: 'Guerrero Eco',
      description: '100kg de CO₂ capturado',
      icon: '⚔️',
      unlocked: true,
      date: '20 Mar 2024',
    },
    {
      id: 'community-hero',
      name: 'Héroe Comunitario',
      description: 'Apoyaste 5 familias',
      icon: '🦸',
      unlocked: true,
      date: '10 May 2024',
    },
    {
      id: 'forest-guardian',
      name: 'Guardián del Bosque',
      description: 'Adopta 10 árboles',
      icon: '🛡️',
      unlocked: false,
    },
    {
      id: 'carbon-master',
      name: 'Maestro del Carbono',
      description: 'Captura 500kg de CO₂',
      icon: '👑',
      unlocked: false,
    },
    {
      id: 'legend',
      name: 'Leyenda',
      description: 'Alcanza nivel 10',
      icon: '⭐',
      unlocked: false,
    },
  ];

  // Progreso de logros
  const achievements: Achievement[] = [
    { id: '1', title: 'Árboles Adoptados', current: 12, target: 20, icon: '🌳', color: 'green' },
    { id: '2', title: 'CO₂ Capturado (kg)', current: 288, target: 500, icon: '🌍', color: 'blue' },
    { id: '3', title: 'Días Activo', current: 89, target: 100, icon: '📅', color: 'purple' },
    { id: '4', title: 'Comunidad', current: 8, target: 10, icon: '👥', color: 'orange' },
  ];

  // Timeline de impacto
  const impactTimeline = [
    { month: 'Ene', trees: 2, co2: 48, families: 2 },
    { month: 'Feb', trees: 4, co2: 96, families: 3 },
    { month: 'Mar', trees: 6, co2: 144, families: 5 },
    { month: 'Abr', trees: 8, co2: 192, families: 6 },
    { month: 'May', trees: 10, co2: 240, families: 7 },
    { month: 'Jun', trees: 12, co2: 288, families: 8 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header with Level */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-[16px] p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(223,134,170,0.25)] via-[rgba(87,41,214,0.15)] to-transparent" />
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-heading mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Tu Impacto Global
              </h1>
              <p className="text-muted text-lg">
                Estás haciendo la diferencia 🌍✨
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-3 surface-panel px-6 py-3">
                <div className="text-5xl">🏆</div>
                <div>
                  <p className="text-sm text-muted">Nivel</p>
                  <p className="text-3xl font-bold text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
                    {userLevel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress to next level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Progreso al Nivel {userLevel + 1}</span>
              <span className="font-semibold text-heading">
                {currentXP} / {nextLevelXP} XP
              </span>
            </div>
            <div className="relative h-4 rounded-full bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)] overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div>
        <h2 className="text-2xl font-bold text-heading mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          🌿 Impacto Ambiental
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {environmentalImpact.map((item) => (
            <div
              key={item.label}
              className="surface-panel p-6 hover:scale-[1.02] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-5xl">{item.icon}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  {item.comparison}
                </span>
              </div>
              <p className="text-sm text-muted mb-1">{item.label}</p>
              <p className="text-3xl font-bold text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Impact */}
      <div>
        <h2 className="text-2xl font-bold text-heading mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          💝 Impacto Social
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {socialImpact.map((item) => (
            <div
              key={item.label}
              className="surface-panel p-6 hover:scale-[1.02] transition-all"
            >
              <span className="text-5xl mb-3 block">{item.icon}</span>
              <p className="text-sm text-muted mb-1">{item.label}</p>
              <p className="text-3xl font-bold text-heading" style={{ fontFamily: 'var(--font-heading)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Visual */}
          <div className="surface-panel p-6">
            <h3 className="text-xl font-bold text-heading mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              📈 Crecimiento de Impacto 2024
            </h3>
            <div className="space-y-4">
              {impactTimeline.map((month) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-heading">{month.month}</span>
                    <div className="flex items-center gap-6 text-muted">
                      <span>🌳 {month.trees}</span>
                      <span>🌍 {month.co2}kg</span>
                      <span>👥 {month.families}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="h-3 bg-green-500 rounded-full transition-all"
                      style={{ width: `${(month.trees / 12) * 100}%` }}
                    />
                    <div
                      className="h-3 bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(month.co2 / 288) * 100}%` }}
                    />
                    <div
                      className="h-3 bg-orange-500 rounded-full transition-all"
                      style={{ width: `${(month.families / 8) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Achievements */}
          <div className="surface-panel p-6">
            <h3 className="text-xl font-bold text-heading mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              🎯 Logros en Progreso
            </h3>
            <div className="space-y-6">
              {achievements.map((achievement) => (
                <div key={achievement.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div>
                        <p className="font-semibold text-heading">{achievement.title}</p>
                        <p className="text-sm text-muted">
                          {achievement.current} / {achievement.target}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-heading">
                      {Math.round((achievement.current / achievement.target) * 100)}%
                    </span>
                  </div>
                  <div className="relative h-3 rounded-full bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)] overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        achievement.color === 'green'
                          ? 'bg-green-500'
                          : achievement.color === 'blue'
                            ? 'bg-blue-500'
                            : achievement.color === 'purple'
                              ? 'bg-purple-500'
                              : 'bg-orange-500'
                      }`}
                      style={{ width: `${(achievement.current / achievement.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges Sidebar */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="surface-panel p-6">
            <h3 className="text-xl font-bold text-heading mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              🏅 Insignias
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    badge.unlocked
                      ? 'border-[var(--color-border)] bg-gradient-to-br from-[rgba(223,134,170,0.1)] to-[rgba(87,41,214,0.1)] hover:scale-105'
                      : 'border-[var(--color-border)] opacity-40 grayscale'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="text-xs font-semibold text-heading mb-1">{badge.name}</p>
                    <p className="text-[10px] text-muted">{badge.description}</p>
                    {badge.unlocked && badge.date && (
                      <p className="text-[9px] text-muted mt-2">🔓 {badge.date}</p>
                    )}
                    {!badge.unlocked && (
                      <p className="text-[9px] text-muted mt-2">🔒 Bloqueado</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-[16px] p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-orange-100/20 dark:from-yellow-900/10 dark:to-orange-900/10" />
            <div className="relative">
              <h3 className="text-lg font-bold text-heading mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                🏆 Tu Ranking
              </h3>
              <div className="text-center py-4">
                <div className="text-6xl mb-3">👑</div>
                <p className="text-4xl font-bold text-heading mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  #47
                </p>
                <p className="text-sm text-muted">de 2,340 usuarios</p>
                <p className="text-xs text-muted mt-2">Top 2% 🎉</p>
              </div>
            </div>
          </div>

          {/* Next Milestone */}
          <div className="surface-panel p-6">
            <h3 className="text-lg font-bold text-heading mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              🎯 Próximo Hito
            </h3>
            <div className="text-center py-4">
              <div className="text-5xl mb-3">🛡️</div>
              <p className="font-bold text-heading mb-2">Guardián del Bosque</p>
              <p className="text-sm text-muted mb-4">Necesitas 8 árboles más</p>
              <div className="relative h-2 rounded-full bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-alt)] rounded-full"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
