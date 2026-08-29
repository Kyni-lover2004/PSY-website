import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import PrivacyPolicy from './PrivacyPolicy';
import PublicOffer from './PublicOffer';
import EthicsCode from './EthicsCode';
import ContractView from '../components/ContractView';
import { RESPONSIBILITY_CONTRACT, MINORS_CONTRACT } from '../data/contracts';

// Все документы живут на одной странице: в меню один пункт, а нужный
// открывается вкладкой. Вкладка хранится в адресе (?doc=), поэтому на
// конкретный документ по-прежнему можно дать прямую ссылку.
const DOCUMENTS = [
  {
    key: 'privacy',
    tab: 'Политика конфиденциальности',
    render: () => <PrivacyPolicy />,
  },
  {
    key: 'offer',
    tab: 'Публичная оферта',
    render: () => <PublicOffer />,
  },
  {
    key: 'ethics',
    tab: 'Этический кодекс',
    render: () => <EthicsCode />,
  },
  {
    key: 'contract',
    tab: 'Контракт: взрослые',
    file: { href: '/documents/kontrakt-otvetstvennosti.docx', name: 'Контракт ответственности.docx' },
    render: () => (
      <ContractView
        title="Контракт ответственности"
        intro="Взаимные обязательства психолога и клиента на время совместной работы"
        sections={RESPONSIBILITY_CONTRACT}
      />
    ),
  },
  {
    key: 'contract-minors',
    tab: 'Контракт: дети',
    file: {
      href: '/documents/kontrakt-nesovershennoletnie.docx',
      name: 'Терапевтический контракт (дети до 18 лет).docx',
    },
    render: () => (
      <ContractView
        title="Терапевтический контракт"
        intro="Работа с клиентами, не достигшими 18 лет"
        sections={MINORS_CONTRACT}
      />
    ),
  },
];

const Legal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('doc');
  const active = DOCUMENTS.find((d) => d.key === requested) || DOCUMENTS[0];

  return (
    <div>
      <div className="pt-12 pb-10 px-4" style={{ background: 'var(--bg-gradient-hero)' }}>
        <div className="max-w-5xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl text-white mb-6 text-center">Документы</h1>

          {/* Сетка, а не перенос строк: иначе последняя вкладка висит
              одна по центру. Цвета заданы явно — фон шапки в тёмной теме
              почти совпадает с цветом карточки. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {DOCUMENTS.map((doc) => {
              const isActive = active.key === doc.key;
              return (
                <button
                  key={doc.key}
                  onClick={() => setSearchParams(doc.key === DOCUMENTS[0].key ? {} : { doc: doc.key })}
                  className={`px-3 py-3 rounded-xl text-sm font-semibold leading-tight transition ${
                    isActive ? 'shadow-lg' : 'hover:bg-white/25'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: '#ffffff', color: '#2D312E' }
                      : { backgroundColor: 'rgba(255,255,255,0.14)', color: 'white' }
                  }
                >
                  {doc.tab}
                </button>
              );
            })}
          </div>

          {active.file && (
            <div className="flex justify-center mt-6">
              <a
                href={active.file.href}
                download={active.file.name}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold transition hover:shadow-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <Download className="w-5 h-5" />
                Скачать документ
              </a>
            </div>
          )}
        </div>
      </div>

      {active.render()}
    </div>
  );
};

export default Legal;
