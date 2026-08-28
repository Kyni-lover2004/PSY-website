import { useState } from 'react';
import { ScrollText, ChevronDown, ShieldCheck, GraduationCap, Scale, Handshake } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ADOPTED, PREAMBLE, INTRO, PRINCIPLES, VIOLATIONS } from '../lib/ethicsCode';

const ICONS = [ShieldCheck, GraduationCap, Scale, Handshake];

const EthicsCode = () => {
  const { isDark } = useTheme();
  // Первый принцип раскрыт, остальные свёрнуты: документ большой,
  // и сплошной стеной текста его никто не читает.
  const [open, setOpen] = useState(1);

  const cardStyle = { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' };
  const softStyle = {
    backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6',
    color: 'var(--text-secondary)',
  };

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'var(--bg-gradient-hero)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <ScrollText className="w-12 h-12 mx-auto mb-4 text-white/80" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Этический кодекс психолога
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">{ADOPTED}</p>
        </div>

        <div className="rounded-3xl shadow-2xl p-6 md:p-8 mb-6" style={cardStyle}>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{INTRO}</p>
          <h2 className="text-xl font-bold mb-4">Преамбула</h2>
          <ol className="space-y-3 list-decimal pl-5" style={{ color: 'var(--text-secondary)' }}>
            {PREAMBLE.map((item) => (
              <li key={item.slice(0, 30)} className="pl-1">{item}</li>
            ))}
          </ol>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-6">
          Этические принципы психолога
        </h2>

        <div className="space-y-4 mb-6">
          {PRINCIPLES.map((principle, i) => {
            const Icon = ICONS[i] || ShieldCheck;
            const isOpen = open === principle.number;
            return (
              <section key={principle.number} className="rounded-3xl shadow-2xl overflow-hidden" style={cardStyle}>
                <button
                  onClick={() => setOpen(isOpen ? null : principle.number)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-4 p-5 md:p-6 text-left transition hover:opacity-90"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--bg-gradient-from)' }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="flex-1 text-lg md:text-xl font-bold min-w-0">
                    {principle.number}. {principle.title}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 md:px-6 pb-6">
                    <p className="mb-6 rounded-2xl p-4" style={softStyle}>{principle.lead}</p>

                    <div className="space-y-6">
                      {principle.sections.map((section, si) => (
                        <div key={section.title}>
                          <h4 className="font-semibold mb-3">
                            {principle.number}.{si + 1}. {section.title}
                          </h4>
                          <ul className="space-y-3">
                            {section.items.map((item) => (
                              <li key={item.slice(0, 30)} className="flex gap-3" style={{ color: 'var(--text-secondary)' }}>
                                <span
                                  className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: 'var(--bg-gradient-from)' }}
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="rounded-3xl shadow-2xl p-6 md:p-8" style={cardStyle}>
          <h2 className="text-xl font-bold mb-4">Нарушение Этического кодекса психолога</h2>
          <ol className="space-y-3 list-decimal pl-5" style={{ color: 'var(--text-secondary)' }}>
            {VIOLATIONS.map((item) => (
              <li key={item.slice(0, 30)} className="pl-1">{item}</li>
            ))}
          </ol>
          <p className="text-sm mt-6 pt-6 border-t" style={{ color: 'var(--text-muted)', borderColor: isDark ? 'var(--border-color)' : '#e5e7eb' }}>
            Текст приводится по документу Российского психологического общества. {ADOPTED}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EthicsCode;
