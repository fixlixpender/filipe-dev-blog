import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, X, ArrowRight, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storage';

interface AuthorGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthorGateModal: React.FC<AuthorGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPasskey('');
      setError(false);
      setErrorMessage('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setError(true);
      setErrorMessage('Please enter the author passkey.');
      return;
    }

    const isValid = storageService.verifyPasskey(passkey);
    if (isValid) {
      storageService.setAuthorAuthenticated(true, remember);
      setError(false);
      onSuccess();
      onClose();
    } else {
      setError(true);
      setErrorMessage('Incorrect author passkey.');
      inputRef.current?.select();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Author Studio Gate
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Restricted Publishing Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This dashboard is private. Readers only have anonymous view permissions. Enter your author passkey to open the publishing workspace.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">
              Author Passkey
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setError(false);
                }}
                placeholder="Enter author passkey..."
                className={`w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border bg-zinc-50/80 dark:bg-zinc-950 font-mono transition-all focus:outline-none ${
                  error
                    ? 'border-rose-500 focus:border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50/20'
                    : 'border-zinc-300 dark:border-zinc-700 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-mono animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Remember on this browser</span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Unlock Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-emerald-500" />
            Shortcut: Ctrl + Shift + A
          </span>
          <span>Zero Public Sign-In</span>
        </div>
      </div>
    </div>
  );
};
