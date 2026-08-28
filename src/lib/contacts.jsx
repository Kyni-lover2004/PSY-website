import { Send } from 'lucide-react';
import vkIcon from '../assets/vk-icon.png';
import maxIcon from '../assets/max-icon.jpg';

export const PHONE = '+7 953 747 66 85';
export const PHONE_HREF = 'tel:+79537476685';
export const ADDRESS = 'г. Рязань, Быстрецкая улица, 18к2, подъезд 2';

// В lucide нет иконки Instagram, рисуем её сами в том же линейном стиле.
export const InstagramIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const VkIcon = ({ className }) => <img src={vkIcon} alt="" className={className} />;
const MaxIcon = ({ className }) => <img src={maxIcon} alt="" className={`${className} rounded-md`} />;

// Один источник правды для ссылок: используется и на записи, и в контактах.
export const SOCIALS = [
  { key: 'vk', label: 'ВКонтакте', color: '#0077FF', Icon: VkIcon, href: 'https://vk.ru/pankratova_kseniya' },
  { key: 'instagram', label: 'Instagram', color: '#E4405F', Icon: InstagramIcon, href: 'https://www.instagram.com/kse.ny.psy?igsh=MXdmbTRtMjg4eG9xaA==' },
  { key: 'max', label: 'MAX', color: '#000000', Icon: MaxIcon, href: 'https://max.ru/u/f9LHodD0cOJsOsd9T9s9AxV2pxLF4yrWCq_LLEaC_7wL1ApJ_ppOqC9wEoM' },
  { key: 'telegram', label: 'Telegram', color: '#24A1DE', Icon: Send, href: 'https://t.me/Ksenya_psyho' },
];

export const SOCIAL_LINKS = Object.fromEntries(SOCIALS.map((s) => [s.key, s.href]));
