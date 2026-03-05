import React, { useState } from 'react';
import { X, Mail, Instagram, Youtube, Globe, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ConnectPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'email' | 'instagram' | 'youtube' | 'landing' | null;
}

export const ConnectPlatformModal: React.FC<ConnectPlatformModalProps> = ({
  isOpen,
  onClose,
  platform
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  if (!isOpen || !platform) return null;

  const platformConfig = {
    email: {
      name: 'Email Marketing',
      icon: Mail,
      color: 'from-blue-500 to-blue-600',
      fields: [
        { label: 'Mailchimp API Key', placeholder: 'Enter your Mailchimp API key', type: 'password' },
        { label: 'List ID', placeholder: 'Enter your default list ID', type: 'text' }
      ]
    },
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      fields: [
        { label: 'Access Token', placeholder: 'Enter your Instagram access token', type: 'password' },
        { label: 'Account ID', placeholder: 'Enter your Instagram Business account ID', type: 'text' }
      ]
    },
    youtube: {
      name: 'YouTube',
      icon: Youtube,
      color: 'from-red-500 to-red-600',
      fields: [
        { label: 'API Key', placeholder: 'Enter your YouTube Data API key', type: 'password' },
        { label: 'Channel ID', placeholder: 'Enter your YouTube channel ID', type: 'text' }
      ]
    },
    landing: {
      name: 'Landing Pages',
      icon: Globe,
      color: 'from-green-500 to-green-600',
      fields: [
        { label: 'Platform', placeholder: 'e.g., Webflow, WordPress', type: 'text' },
        { label: 'API Key', placeholder: 'Enter your platform API key', type: 'password' }
      ]
    }
  };

  const config = platformConfig[platform];
  const Icon = config.icon;

  const handleConnect = () => {
    setIsConnected(true);
    setTimeout(() => {
      onClose();
      setIsConnected(false);
      setApiKey('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div className="bg-[var(--color-gray-dark)] rounded-lg shadow-xl max-w-md w-full border border-[var(--color-gray-medium)]">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-gray-medium)]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Connect {config.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isConnected ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Connected Successfully!</h3>
              <p className="text-gray-400 text-sm">
                Your {config.name} account is now connected.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-sm">
                Connect your {config.name} account to enable automated publishing and synchronization.
              </p>

              {config.fields.map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {field.label}
                  </label>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={index === 0 ? apiKey : ''}
                    onChange={(e) => index === 0 && setApiKey(e.target.value)}
                  />
                </div>
              ))}

              <div className="pt-4">
                <Button
                  onClick={handleConnect}
                  className="w-full"
                  disabled={!apiKey}
                >
                  Connect Account
                </Button>
              </div>

              <div className="pt-2 border-t border-[var(--color-gray-medium)]">
                <p className="text-xs text-gray-500">
                  Need help? Check out our{' '}
                  <a href="#" className="text-[var(--color-ai-purple)] hover:underline">
                    integration guide
                  </a>{' '}
                  for {config.name}.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
