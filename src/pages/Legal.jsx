import { useSearchParams } from 'react-router-dom';
import PrivacyPolicy from './PrivacyPolicy';
import PublicOffer from './PublicOffer';

const TABS = [
  { key: 'privacy', label: 'Политика конфиденциальности' },
  { key: 'offer', label: 'Публичная оферта' },
];

// Оба юридических документа живут на одной странице: в меню один пункт,
// а нужный текст выбирается вкладкой. Вкладка хранится в адресе (?doc=),
// поэтому на конкретный документ по-прежнему можно дать прямую ссылку.
const Legal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get('doc') === 'offer' ? 'offer' : 'privacy';

  return (
    <div className="bg-base">
      <div className="pt-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl text-dark mb-6 text-center">Документы</h1>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-center">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSearchParams(tab.key === 'privacy' ? {} : { doc: tab.key })}
                className={`px-5 py-3 rounded-xl font-semibold transition ${
                  active === tab.key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-card text-dark/70 border border-primary/10 hover:text-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {active === 'privacy' ? <PrivacyPolicy /> : <PublicOffer />}
    </div>
  );
};

export default Legal;
