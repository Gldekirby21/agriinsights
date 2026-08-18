'use client';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      title={lang === 'tl' ? 'Switch to English' : 'Lumipat sa Tagalog / Filipino'}
      aria-label="Toggle Language"
      className="btn btn-secondary btn-sm"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        fontSize: 12.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: 14 }}>{lang === 'tl' ? '🇵🇭' : '🇺🇸'}</span>
      <span>{lang === 'tl' ? 'Filipino' : 'English'}</span>
    </button>
  );
}
