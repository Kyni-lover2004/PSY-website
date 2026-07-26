import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Глобальный scroll-reveal: элементы с классом .reveal плавно появляются
// при попадании в зону видимости — работает на всех страницах.
export default function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    // Небольшая задержка, чтобы страница успела отрендериться после перехода
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.active)').forEach((el) => observer.observe(el));
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);
}
