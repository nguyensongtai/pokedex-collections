'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/shared/lib';
import styles from './Artwork.module.css';

interface ArtworkProps {
  src: string;
  alt: string;
  /** Rendered width hint for the image optimizer. */
  sizes: string;
  /** Skip lazy loading for the first row, which is above the fold. */
  priority?: boolean;
  className?: string;
}

/**
 * Remote artwork with a placeholder that cross-fades out once the image lands,
 * and stays put if it never does. Load state is local to this component: it is
 * per-image view state, so nothing above it needs to know.
 *
 * Domain-agnostic — it takes a URL, not a Pokémon.
 */
export function Artwork({ src, alt, sizes, priority = false, className }: ArtworkProps) {
  const [status, setStatus] = useState<'pending' | 'loaded' | 'broken'>('pending');
  const isLoaded = status === 'loaded';

  return (
    <span className={cn(styles.frame, className)}>
      <span aria-hidden="true" className={cn(styles.placeholder, isLoaded && styles.hidden)} />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(styles.image, isLoaded && styles.visible)}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('broken')}
      />
    </span>
  );
}
