import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-400" />
      <div className=" bg-[var(--bg-primary)] p-1 rounded-lg">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            language === 'en'
              ? 'bg-[var(--brand-primary)] text-black'
              : 'text-gray-400 hover:text-white bg-[var(--bg-primary)]'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('fr')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            language === 'fr'
              ? 'bg-[var(--brand-primary)] text-black'
              : 'text-gray-400 hover:text-white bg-[var(--bg-primary)]'
          }`}
        >
          FR
        </button>
      </div>
    </div>
  );
}
