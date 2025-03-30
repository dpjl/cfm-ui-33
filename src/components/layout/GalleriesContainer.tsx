
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { fetchMediaIds } from '@/api/imageApi';
import { MobileViewMode, ViewModeType } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import GalleryContent from '@/components/gallery/GalleryContent';
import DeleteConfirmationDialog from '@/components/gallery/DeleteConfirmationDialog';
import DesktopGalleriesView from './DesktopGalleriesView';
import MobileGalleriesView from './MobileGalleriesView';
import MobileViewSwitcher from './MobileViewSwitcher';

// Définir l'interface pour les props du composant
interface GalleriesContainerProps {
  // Propriétés des colonnes
  columnsCountLeft: number;
  columnsCountRight: number;
  
  // Propriétés de sélection
  selectedIdsLeft: string[];
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIdsRight: string[];
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Propriétés des répertoires
  selectedDirectoryIdLeft: string;
  selectedDirectoryIdRight: string;
  
  // Propriétés de dialogue et de suppression
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeSide: 'left' | 'right';
  deleteMutation: any;
  handleDeleteSelected: (side: 'left' | 'right') => void;
  
  // Propriétés de vue mobile
  mobileViewMode: MobileViewMode;
  setMobileViewMode: React.Dispatch<React.SetStateAction<MobileViewMode>>;
  
  // Propriétés de filtre
  leftFilter?: MediaFilter;
  rightFilter?: MediaFilter;
  
  // Propriétés de panneau latéral
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  
  // Gestionnaire de changement de colonnes
  onColumnsChange?: (side: 'left' | 'right', count: number) => void;
}

const GalleriesContainer: React.FC<GalleriesContainerProps> = ({
  columnsCountLeft,
  columnsCountRight,
  selectedIdsLeft,
  setSelectedIdsLeft,
  selectedIdsRight,
  setSelectedIdsRight,
  selectedDirectoryIdLeft,
  selectedDirectoryIdRight,
  deleteDialogOpen,
  setDeleteDialogOpen,
  activeSide,
  deleteMutation,
  handleDeleteSelected,
  mobileViewMode,
  setMobileViewMode,
  leftFilter,
  rightFilter,
  onToggleLeftPanel,
  onToggleRightPanel,
  onColumnsChange
}) => {
  const isMobile = useIsMobile();

  // Fetch media IDs for left and right columns
  const { data: leftMediaIds = [], isLoading: isLoadingLeftMediaIds, error: errorLeftMediaIds } = useQuery({
    queryKey: ['leftMediaIds', selectedDirectoryIdLeft, columnsCountLeft],
    queryFn: () => fetchMediaIds(selectedDirectoryIdLeft, columnsCountLeft)
  });
  
  const { data: rightMediaIds = [], isLoading: isLoadingRightMediaIds, error: errorRightMediaIds } = useQuery({
    queryKey: ['rightMediaIds', selectedDirectoryIdRight, columnsCountRight],
    queryFn: () => fetchMediaIds(selectedDirectoryIdRight, columnsCountRight)
  });

  // Handlers for selecting and previewing items
  const handleSelectIdLeft = (id: string) => setSelectedIdsLeft((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const handleSelectIdRight = (id: string) => setSelectedIdsRight((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const handlePreviewItemLeft = (id: string) => console.log(`Previewing item ${id} in source`);
  const handlePreviewItemRight = (id: string) => console.log(`Previewing item ${id} in destination`);
  const handleConfirmDelete = (side: 'left' | 'right') => () => handleDeleteSelected(side);

  // Add handlers for changing columns
  const handleLeftColumnsChange = (count: number) => {
    if (onColumnsChange) {
      console.log('Left columns changed to:', count);
      onColumnsChange('left', count);
    }
  };

  const handleRightColumnsChange = (count: number) => {
    if (onColumnsChange) {
      console.log('Right columns changed to:', count);
      onColumnsChange('right', count);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {isMobile ? (
        <div className="flex flex-col h-full overflow-hidden">
          <MobileViewSwitcher
            viewMode={mobileViewMode}
            setViewMode={setMobileViewMode}
          />
          <MobileGalleriesView
            mobileViewMode={mobileViewMode}
            leftContent={
              <GalleryContent
                title="Source"
                mediaIds={leftMediaIds || []}
                selectedIds={selectedIdsLeft}
                onSelectId={handleSelectIdLeft}
                isLoading={isLoadingLeftMediaIds}
                isError={!!errorLeftMediaIds}
                error={errorLeftMediaIds}
                columnsCount={columnsCountLeft}
                viewMode={mobileViewMode === 'both' ? 'split' : 'single'}
                onPreviewItem={handlePreviewItemLeft}
                onDeleteSelected={handleConfirmDelete('left')}
                position="source"
                filter={leftFilter}
                onToggleSidebar={onToggleLeftPanel}
                onColumnsChange={handleLeftColumnsChange}
              />
            }
            rightContent={
              <GalleryContent
                title="Destination"
                mediaIds={rightMediaIds || []}
                selectedIds={selectedIdsRight}
                onSelectId={handleSelectIdRight}
                isLoading={isLoadingRightMediaIds}
                isError={!!errorRightMediaIds}
                error={errorRightMediaIds}
                columnsCount={columnsCountRight}
                viewMode={mobileViewMode === 'both' ? 'split' : 'single'}
                onPreviewItem={handlePreviewItemRight}
                onDeleteSelected={handleConfirmDelete('right')}
                position="destination"
                filter={rightFilter}
                onToggleSidebar={onToggleRightPanel}
                onColumnsChange={handleRightColumnsChange}
              />
            }
          />
        </div>
      ) : (
        <DesktopGalleriesView
          columnsCountLeft={columnsCountLeft}
          columnsCountRight={columnsCountRight}
          selectedDirectoryIdLeft={selectedDirectoryIdLeft}
          selectedDirectoryIdRight={selectedDirectoryIdRight}
          selectedIdsLeft={selectedIdsLeft}
          setSelectedIdsLeft={setSelectedIdsLeft}
          selectedIdsRight={selectedIdsRight}
          setSelectedIdsRight={setSelectedIdsRight}
          handleDeleteSelected={handleDeleteSelected}
          deleteDialogOpen={deleteDialogOpen}
          activeSide={activeSide}
          setDeleteDialogOpen={setDeleteDialogOpen}
          deleteMutation={deleteMutation}
          leftFilter={leftFilter}
          rightFilter={rightFilter}
          viewMode={mobileViewMode}
          mobileViewMode={mobileViewMode}
          onToggleLeftPanel={onToggleLeftPanel}
          onToggleRightPanel={onToggleRightPanel}
          leftContent={
            <GalleryContent
              title="Source"
              mediaIds={leftMediaIds || []}
              selectedIds={selectedIdsLeft}
              onSelectId={handleSelectIdLeft}
              isLoading={isLoadingLeftMediaIds}
              isError={!!errorLeftMediaIds}
              error={errorLeftMediaIds}
              columnsCount={columnsCountLeft}
              onPreviewItem={handlePreviewItemLeft}
              onDeleteSelected={handleConfirmDelete('left')}
              position="source"
              filter={leftFilter}
              onToggleSidebar={onToggleLeftPanel}
              onColumnsChange={handleLeftColumnsChange}
            />
          }
          rightContent={
            <GalleryContent
              title="Destination"
              mediaIds={rightMediaIds || []}
              selectedIds={selectedIdsRight}
              onSelectId={handleSelectIdRight}
              isLoading={isLoadingRightMediaIds}
              isError={!!errorRightMediaIds}
              error={errorRightMediaIds}
              columnsCount={columnsCountRight}
              onPreviewItem={handlePreviewItemRight}
              onDeleteSelected={handleConfirmDelete('right')}
              position="destination"
              filter={rightFilter}
              onToggleSidebar={onToggleRightPanel}
              onColumnsChange={handleRightColumnsChange}
            />
          }
        />
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => handleDeleteSelected(activeSide)}
        selectedIds={activeSide === 'left' ? selectedIdsLeft : selectedIdsRight}
        onCancel={() => setDeleteDialogOpen(false)}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

export default GalleriesContainer;
