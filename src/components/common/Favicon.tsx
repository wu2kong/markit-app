import { useState, useEffect } from 'react';
import { FiGlobe } from 'react-icons/fi';
import { getFaviconSrc } from '../../utils/api';

interface FaviconProps {
  url: string | null;
  domain: string;
  size?: number;
  className?: string;
}

export function Favicon({ url, domain, size = 16, className = '' }: FaviconProps) {
  const [error, setError] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    getFaviconSrc(url)
      .then((result) => setSrc(result))
      .catch(() => setError(true));
  }, [url]);

  if (error || !src) {
    return (
      <FiGlobe 
        size={size} 
        className={className}
        style={{ color: 'var(--color-text-tertiary)' }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={`${domain} icon`}
      width={size}
      height={size}
      className={className}
      onError={() => setError(true)}
      style={{ objectFit: 'contain' }}
    />
  );
}