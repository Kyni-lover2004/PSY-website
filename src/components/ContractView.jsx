import { FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Показ контракта на странице. Поля для подписи в веб-версию не выводятся —
// они есть в файле, который можно скачать.
const ContractView = ({ title, intro, sections }) => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'var(--bg-gradient-hero)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <FileText className="w-12 h-12 mx-auto mb-4 text-white/80" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{title}</h1>
          {intro && <p className="text-white/80 max-w-2xl mx-auto">{intro}</p>}
        </div>

        <div className="space-y-4">
          {sections.map((section, i) => (
            <div
              key={section.title || i}
              className="rounded-3xl shadow-2xl p-6 md:p-8"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              {section.title && <h2 className="text-xl font-bold mb-4">{section.title}</h2>}
              <div className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
                {section.blocks.map((block) => (
                  <p key={block.slice(0, 40)} className="leading-relaxed">{block}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/70 text-sm mt-6">
          Поля для подписи и дат — в файле для скачивания.
        </p>
      </div>
    </div>
  );
};

export default ContractView;
