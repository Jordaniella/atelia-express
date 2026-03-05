import { useState } from 'react';
import { X, Mail, FileText, Download, Copy, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useToast } from '../contexts/ToastContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  contentType: 'email' | 'post' | 'script' | 'landing_copy';
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

export function ExportModal({ isOpen, onClose, content, contentType }: ExportModalProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const emailPlatforms: Platform[] = [
    { id: 'mailchimp', name: 'Mailchimp', icon: '📧', description: 'Popular email marketing platform', available: false },
    { id: 'brevo', name: 'Brevo', icon: '✉️', description: 'Formerly Sendinblue, powerful automation', available: false },
    { id: 'hubspot', name: 'HubSpot', icon: '🎯', description: 'All-in-one marketing platform', available: false },
    { id: 'convertkit', name: 'ConvertKit', icon: '📬', description: 'Built for creators and personal brands', available: false },
  ];

  const videoExportOptions = [
    { id: 'copy', name: 'Copy to Clipboard', icon: Copy, description: 'Quick copy for any use' },
    { id: 'txt', name: 'Download .txt', icon: Download, description: 'Plain text format' },
    { id: 'doc', name: 'Download .doc', icon: FileText, description: 'Word document format' },
    { id: 'teleprompter', name: 'Teleprompter Format', icon: FileText, description: 'Large text for reading', available: false },
    { id: 'notion', name: 'Export to Notion', icon: FileText, description: 'Coming soon', available: false },
    { id: 'gdocs', name: 'Export to Google Docs', icon: FileText, description: 'Coming soon', available: false },
  ];

  const landingExportOptions = [
    { id: 'copy', name: 'Copy to Clipboard', icon: Copy, description: 'Quick copy' },
    { id: 'md', name: 'Download Markdown', icon: Download, description: 'Structured markdown' },
    { id: 'html', name: 'Export HTML', icon: FileText, description: 'Coming soon', available: false },
    { id: 'webflow', name: 'Export for Webflow', icon: FileText, description: 'Coming soon', available: false },
    { id: 'shopify', name: 'Export for Shopify', icon: FileText, description: 'Coming soon', available: false },
    { id: 'framer', name: 'Export for Framer', icon: FileText, description: 'Coming soon', available: false },
  ];

  const socialExportOptions = [
    { id: 'copy', name: 'Copy Formatted', icon: Copy, description: 'Ready to paste' },
    { id: 'csv', name: 'Download CSV', icon: Download, description: 'Spreadsheet format' },
    { id: 'buffer', name: 'Export to Buffer', icon: FileText, description: 'Coming soon', available: false },
    { id: 'hootsuite', name: 'Export to Hootsuite', icon: FileText, description: 'Coming soon', available: false },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast('Content copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded as ${format}!`, 'success');
  };

  const handleDownloadCSV = () => {
    const csv = `"Content"\n"${content.replace(/"/g, '""')}"`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social-post.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded as CSV!', 'success');
  };

  const handleExport = (optionId: string) => {
    if (optionId === 'copy') {
      handleCopy();
    } else if (optionId === 'txt') {
      handleDownload('txt');
    } else if (optionId === 'doc') {
      handleDownload('doc');
    } else if (optionId === 'md') {
      handleDownload('md');
    } else if (optionId === 'csv') {
      handleDownloadCSV();
    }
  };

  const renderEmailPlatforms = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Export to Email Platform</h3>
      <div className="grid gap-3">
        {emailPlatforms.map((platform) => (
          <button
            key={platform.id}
            className="p-4 rounded-xl bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] hover:border-[var(--color-ai-purple)] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!platform.available}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{platform.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{platform.name}</p>
                  {!platform.available && (
                    <span className="flex items-center gap-1 text-xs text-yellow-500">
                      <Clock className="w-3 h-3" />
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{platform.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="pt-4 border-t border-[var(--color-gray-medium)]">
        <p className="text-sm text-gray-400 mb-3">Manual Export Options</p>
        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" className="flex-1">
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button onClick={() => handleDownload('txt')} variant="outline" className="flex-1">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );

  const renderExportOptions = (options: any[]) => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Export Options</h3>
      <div className="grid gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => option.available !== false && handleExport(option.id)}
              className="p-4 rounded-xl bg-[var(--color-gray-dark)] border border-[var(--color-gray-medium)] hover:border-[var(--color-ai-purple)] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={option.available === false}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-ai-purple)]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--color-ai-purple)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{option.name}</p>
                    {option.available === false && (
                      <span className="flex items-center gap-1 text-xs text-yellow-500">
                        <Clock className="w-3 h-3" />
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-ai-purple)] to-purple-600 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Export Content</h2>
              <p className="text-gray-400 text-sm">Choose your export destination</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[var(--color-gray-dark)] hover:bg-[var(--color-gray-medium)] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {contentType === 'email' && renderEmailPlatforms()}
        {contentType === 'script' && renderExportOptions(videoExportOptions)}
        {contentType === 'landing_copy' && renderExportOptions(landingExportOptions)}
        {contentType === 'post' && renderExportOptions(socialExportOptions)}
      </Card>
    </div>
  );
}
