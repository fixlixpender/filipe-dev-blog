import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface AuthorAvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  allowUpload?: boolean;
}

export const AuthorAvatar: React.FC<AuthorAvatarProps> = ({
  src = '/filipe-avatar.jpg?v=4',
  name = 'Filipe Oliveira',
  size = 'md',
  className = '',
  allowUpload = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  }[size];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        await fetch('/api/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl }),
        });
        window.location.reload();
      } catch (err) {
        console.error('Failed to upload avatar:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const initial = (name?.trim()?.charAt(0) || 'F').toUpperCase();

  const content = (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 border border-zinc-300 dark:border-zinc-700/80 shadow-xs flex items-center justify-center font-bold select-none ${sizeClasses} ${className} ${
        imgError
          ? 'bg-gradient-to-br from-zinc-800 to-zinc-950 text-white font-mono shadow-inner'
          : 'bg-zinc-900'
      }`}
    >
      {!imgError && src ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="text-zinc-100 font-extrabold tracking-tighter drop-shadow-xs">
          {initial}
        </span>
      )}

      {allowUpload && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload className="w-3.5 h-3.5 text-white" />
        </div>
      )}
    </div>
  );

  if (allowUpload) {
    return (
      <label
        className={`relative group cursor-pointer inline-block ${isUploading ? 'opacity-50' : ''}`}
        title="Click to update profile picture"
      >
        {content}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>
    );
  }

  return content;
};
