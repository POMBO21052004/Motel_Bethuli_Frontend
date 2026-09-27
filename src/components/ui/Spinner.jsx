import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 20, className = '' }) {
  return (
    <Loader2
      size={size}
      className={`spin text-primary-600 ${className}`}
      style={{ color: '#2E7D32' }}
    />
  );
}
