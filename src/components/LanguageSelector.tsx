import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
      <Globe className="w-4 h-4 text-gray-400" />
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-[var(--color-ai-purple)] text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === 'fr'
            ? 'bg-[var(--color-ai-purple)] text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        FR
      </button>
    </div>
  );
}
