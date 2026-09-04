import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send, Twitter, Facebook, Mail, Sparkles, Building2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    type: string;
    images?: string[];
  } | null;
}

export default function ShareModal({ isOpen, onClose, property }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setCanNativeShare(true);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      setCopied(false);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/listings/${property.id}`;

  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') return `₹${price.toLocaleString('en-IN')}/mo`;
    if (type === 'lease') {
      if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr (Lease)`;
      return `₹${(price / 100000).toFixed(1)} L (Lease)`;
    }
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out ${property.title} in ${property.location} on The Property Agent`,
          url: shareUrl,
        });
      } catch (err) {
        // Share was cancelled or failed
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  const shareText = `Check out this property on The Property Agent: ${property.title} (${formatPrice(property.price, property.type)}) in ${property.location}`;

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#20bd5a] text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#0088cc] hover:bg-[#0077b5] text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-black hover:bg-neutral-800 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-neutral-800 hover:bg-neutral-900 text-white',
      url: `mailto:?subject=${encodeURIComponent(`Property: ${property.title}`)}&body=${encodeURIComponent(`Hi,\n\nI thought you might be interested in this property on The Property Agent:\n\n${property.title}\nLocation: ${property.location}\nPrice: ${formatPrice(property.price, property.type)}\n\nView details: ${shareUrl}\n`)}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 id="share-modal-title" className="text-lg font-bold font-display text-navy-900 leading-tight">
                Share Property
              </h3>
              <p className="text-xs text-neutral-500">Share this verified listing with friends or family</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-navy-900 hover:bg-neutral-100 transition-colors"
            aria-label="Close share dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Property Preview Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-200 flex-shrink-0 relative">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 inline-block mb-1">
                For {property.type === 'rent' ? 'Rent' : property.type === 'sale' ? 'Sale' : property.type === 'lease' ? 'Lease' : 'Commercial'}
              </span>
              <h4 className="text-sm font-semibold text-navy-900 truncate">{property.title}</h4>
              <p className="text-xs text-neutral-500 truncate">{property.location}</p>
              <p className="text-xs font-bold text-brand-600 mt-0.5">{formatPrice(property.price, property.type)}</p>
            </div>
          </div>

          {/* Direct Shareable Link Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Shareable Link
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-neutral-50 rounded-2xl border border-neutral-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <input
                type="text"
                readOnly
                value={shareUrl}
                aria-label="Property share link"
                className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-navy-900 outline-none select-all truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 flex-shrink-0 ${
                  copied
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/25'
                    : 'bg-brand-500 hover:bg-brand-600 text-navy-900 shadow-md shadow-brand-500/25'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1 font-medium animate-fade-in">
                <Sparkles className="h-3.5 w-3.5" />
                Link copied to clipboard! Ready to paste and share.
              </p>
            )}
          </div>

          {/* Social Share Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2.5">
              Share directly via
            </label>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {shareLinks.map((platform) => {
                const Icon = platform.icon;
                return (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 group p-2 rounded-2xl hover:bg-neutral-50 transition-all text-center"
                  >
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-md ${platform.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-medium text-neutral-600 group-hover:text-navy-900 truncate max-w-full">
                      {platform.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Native Web Share fallback / quick device share */}
          {canNativeShare && (
            <div className="pt-2 border-t border-neutral-100">
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-navy-900 font-semibold text-xs sm:text-sm transition-all active:scale-[0.99]"
              >
                <Share2 className="h-4 w-4 text-brand-500" />
                <span>More sharing options on this device</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
