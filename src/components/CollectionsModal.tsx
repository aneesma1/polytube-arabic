import React, { useState } from 'react';
import { 
  FolderPlus, 
  Folder, 
  Clock, 
  Trash2, 
  Play, 
  Plus, 
  X, 
  Check, 
  Film, 
  Bookmark, 
  MoreVertical,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { VideoCollection, SavedVideoItem, SubtitleItem } from '../types';
import { formatTime } from '../utils/youtube';

interface CollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: VideoCollection[];
  onUpdateCollections: (newCollections: VideoCollection[]) => void;
  onSelectVideo: (video: SavedVideoItem) => void;
  currentVideoInfo?: {
    id: string;
    title: string;
    channel: string;
    thumbnail: string;
    currentTime: number;
    duration: number;
    targetLang: string;
    targetLangCode: string;
    nativeLang: string;
    nativeLangCode: string;
    subtitles: SubtitleItem[];
  };
}

export const CollectionsModal: React.FC<CollectionsModalProps> = ({
  isOpen,
  onClose,
  collections,
  onUpdateCollections,
  onSelectVideo,
  currentVideoInfo,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    collections[0]?.id || 'watch-later'
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  if (!isOpen) return null;

  const activeCollection = collections.find((c) => c.id === selectedCollectionId) || collections[0];

  // Helper to check if current video is in a collection
  const isVideoInCollection = (collId: string, videoYtId: string) => {
    const coll = collections.find((c) => c.id === collId);
    return coll ? coll.videos.some((v) => v.youtubeId === videoYtId) : false;
  };

  const handleToggleCurrentVideoInCollection = (collId: string) => {
    if (!currentVideoInfo) return;

    const updated = collections.map((coll) => {
      if (coll.id !== collId) return coll;

      const exists = coll.videos.some((v) => v.youtubeId === currentVideoInfo.id);
      if (exists) {
        // Remove
        return {
          ...coll,
          videos: coll.videos.filter((v) => v.youtubeId !== currentVideoInfo.id),
          updatedAt: Date.now(),
        };
      } else {
        // Add
        const newVideoItem: SavedVideoItem = {
          id: `saved_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          youtubeId: currentVideoInfo.id,
          title: currentVideoInfo.title,
          channel: currentVideoInfo.channel,
          thumbnail: currentVideoInfo.thumbnail || `https://i.ytimg.com/vi/${currentVideoInfo.id}/mqdefault.jpg`,
          lastTimestamp: currentVideoInfo.currentTime,
          duration: currentVideoInfo.duration,
          targetLang: currentVideoInfo.targetLang,
          targetLangCode: currentVideoInfo.targetLangCode,
          nativeLang: currentVideoInfo.nativeLang,
          nativeLangCode: currentVideoInfo.nativeLangCode,
          subtitlesCount: currentVideoInfo.subtitles.length,
          subtitles: currentVideoInfo.subtitles,
          addedAt: Date.now(),
          lastWatchedAt: Date.now(),
        };

        return {
          ...coll,
          videos: [newVideoItem, ...coll.videos],
          updatedAt: Date.now(),
        };
      }
    });

    onUpdateCollections(updated);
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    const newColl: VideoCollection = {
      id: `coll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newCollectionName.trim(),
      description: newCollectionDesc.trim(),
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      videos: [],
    };

    const updated = [...collections, newColl];
    onUpdateCollections(updated);
    setSelectedCollectionId(newColl.id);
    setNewCollectionName('');
    setNewCollectionDesc('');
    setIsCreatingNew(false);
  };

  const handleDeleteCollection = (collId: string) => {
    if (confirm('Are you sure you want to delete this collection and its saved list?')) {
      const updated = collections.filter((c) => c.id !== collId);
      onUpdateCollections(updated);
      if (selectedCollectionId === collId) {
        setSelectedCollectionId(updated[0]?.id || '');
      }
    }
  };

  const handleRemoveVideoFromCollection = (collId: string, videoId: string) => {
    const updated = collections.map((coll) => {
      if (coll.id !== collId) return coll;
      return {
        ...coll,
        videos: coll.videos.filter((v) => v.id !== videoId),
        updatedAt: Date.now(),
      };
    });
    onUpdateCollections(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Video Collections & Watch Later
              </h2>
              <p className="text-xs text-slate-400">
                Organize videos into named learning groups, bookmarks, and playlists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Bar for Current Active Video */}
        {currentVideoInfo && (
          <div className="p-3.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs text-slate-400 shrink-0 font-medium">Current Video:</span>
              <span className="text-xs font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
                {currentVideoInfo.title}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400">Save to:</span>
              {collections.map((coll) => {
                const inColl = isVideoInCollection(coll.id, currentVideoInfo.id);
                return (
                  <button
                    key={coll.id}
                    onClick={() => handleToggleCurrentVideoInCollection(coll.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      inColl
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750'
                    }`}
                  >
                    {inColl ? <Check className="w-3 h-3 text-rose-400" /> : <Plus className="w-3 h-3 text-slate-400" />}
                    <span>{coll.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Layout: Sidebar Collections List + Active Collection Videos */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Column: List of Collections */}
          <div className="w-full md:w-64 bg-slate-950/60 border-r border-slate-800/80 p-3 flex flex-col gap-2 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your Groups
              </span>
              <button
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            {/* Create New Group Input */}
            {isCreatingNew && (
              <form onSubmit={handleCreateCollection} className="p-2.5 bg-slate-850 rounded-xl border border-amber-500/30 space-y-2 mb-2">
                <input
                  type="text"
                  placeholder="Group Name (e.g. Stories)"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            {/* Collections List */}
            <div className="space-y-1">
              {collections.map((coll) => {
                const isSelected = coll.id === selectedCollectionId;
                return (
                  <div
                    key={coll.id}
                    onClick={() => setSelectedCollectionId(coll.id)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-semibold'
                        : 'bg-slate-900/60 hover:bg-slate-850 border-transparent text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {coll.isDefault ? (
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-xs truncate">{coll.name}</p>
                        {coll.description && (
                          <p className="text-[10px] text-slate-400 truncate font-normal">{coll.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 shrink-0">
                      {coll.videos.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Videos in Selected Collection */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col">
            {activeCollection ? (
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      {activeCollection.name}
                      <span className="text-xs font-normal text-slate-400">
                        ({activeCollection.videos.length} video{activeCollection.videos.length !== 1 ? 's' : ''})
                      </span>
                    </h3>
                    {activeCollection.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{activeCollection.description}</p>
                    )}
                  </div>

                  {!activeCollection.isDefault && (
                    <button
                      onClick={() => handleDeleteCollection(activeCollection.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                      title="Delete this entire collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Group</span>
                    </button>
                  )}
                </div>

                {/* Videos Grid */}
                {activeCollection.videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCollection.videos.map((vid) => {
                      const progressPct = vid.duration > 0 ? Math.min(100, (vid.lastTimestamp / vid.duration) * 100) : 0;
                      return (
                        <div
                          key={vid.id}
                          className="bg-slate-850 border border-slate-800 rounded-xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col"
                        >
                          {/* Thumbnail */}
                          <div 
                            className="relative aspect-video bg-slate-950 cursor-pointer overflow-hidden"
                            onClick={() => {
                              onSelectVideo(vid);
                              onClose();
                            }}
                          >
                            <img
                              src={vid.thumbnail}
                              alt={vid.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${vid.youtubeId}/hqdefault.jpg`;
                              }}
                            />
                            {/* Overlay Play Icon */}
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="p-3 bg-rose-600 rounded-full text-white shadow-lg">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </div>
                            </div>
                            {/* Timestamp progress badge */}
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white">
                              {formatTime(vid.lastTimestamp)} / {formatTime(vid.duration)}
                            </div>
                            {/* Progress bar line */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                              <div 
                                className="h-full bg-rose-500" 
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                            <div>
                              <h4 
                                className="text-xs font-bold text-slate-100 line-clamp-2 hover:text-rose-400 cursor-pointer transition-colors"
                                onClick={() => {
                                  onSelectVideo(vid);
                                  onClose();
                                }}
                              >
                                {vid.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-1">{vid.channel}</p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                              <span className="text-slate-400">
                                {vid.subtitlesCount ? `${vid.subtitlesCount} subtitles` : 'Subtitles saved'}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    onSelectVideo(vid);
                                    onClose();
                                  }}
                                  className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                                >
                                  Resume ▶
                                </button>
                                <button
                                  onClick={() => handleRemoveVideoFromCollection(activeCollection.id, vid.id)}
                                  className="text-slate-400 hover:text-rose-400 cursor-pointer p-0.5"
                                  title="Remove from this collection"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Film className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No videos saved here yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Use the &ldquo;Save to&rdquo; buttons above or the Bookmark button in the player to add videos to this group.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
