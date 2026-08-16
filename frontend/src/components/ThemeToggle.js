'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('agri_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('agri_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  }

  if (!mounted) {
    return (
      <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-full)', background: 'var(--bg-surface)' }} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
      className="btn btn-secondary btn-sm"
      style={{
        width: 38,
        height: 38,
        padding: 0,
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        background: theme === 'dark' ? 'rgba(82,183,136,0.12)' : 'rgba(45,138,93,0.12)',
        border: theme === 'dark' ? '1px solid var(--border)' : '1px solid var(--border-accent)',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
