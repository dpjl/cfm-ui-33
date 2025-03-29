
import React, { useEffect, useState } from 'react';
import type { MediaItem } from '../../types/gallery';
import VirtualizedGalleryGridWrapper from './VirtualizedGalleryGridWrapper';
import { Skeleton } from '../ui/skeleton';
import { getThumbnailUrl } from '../../api/imageApi';

interface GalleryGridContainerProps {
  items: MediaItem[];
  isLoading: boolean;
  columnCount: number;
  position: 'source' | 'destination';
  onMediaClick?: (id: string) => void;
}

const GalleryGridContainer: React.FC<GalleryGridContainerProps> = ({
  items,
  isLoading,
  columnCount,
  position,
  onMediaClick
}) => {
  // État pour forcer le rendu lors des changements de dimension
  const [resetKey, setResetKey] = useState(0);
  
  // Observer les redimensionnements et forcer une réinitialisation
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setResetKey(prev => prev + 1);
    });
    
    const galleryContainer = document.querySelector('.gallery-content') || document.body;
    resizeObserver.observe(galleryContainer);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Afficher des squelettes pendant le chargement
  if (isLoading) {
    return (
      <div className="grid gap-4 p-4" style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`
      }}>
        {Array.from({ length: columnCount * 3 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="w-full aspect-square rounded-md" />
        ))}
      </div>
    );
  }

  // Afficher un état vide si aucun élément
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <p className="text-gray-500">Aucun média trouvé</p>
      </div>
    );
  }

  // Fonction de rendu pour chaque élément média
  const renderMediaItem = (item: MediaItem, style: React.CSSProperties) => {
    const thumbnailUrl = getThumbnailUrl(item.id, position);
    
    return (
      <div 
        key={item.id}
        className="w-full h-full overflow-hidden rounded-md bg-muted cursor-pointer relative group"
        onClick={() => onMediaClick?.(item.id)}
        style={style}
      >
        <img 
          src={thumbnailUrl} 
          alt={item.alt || ''}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        {item.isVideo && (
          <div className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-md text-xs">
            Vidéo
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full gallery-content" key={`gallery-container-${resetKey}`}>
      <VirtualizedGalleryGridWrapper
        items={items}
        columnCount={columnCount}
        renderItem={renderMediaItem}
        itemSize={200}
        rowGap={8}
        columnGap={8}
      />
    </div>
  );
};

export default GalleryGridContainer;
