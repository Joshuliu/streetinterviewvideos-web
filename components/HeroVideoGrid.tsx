import { ALL_WORK_VIDEOS } from '@/lib/work';
import { VideoTile } from './VideoCard';

export function HeroVideoGrid() {
  const videos = ALL_WORK_VIDEOS.slice(0, 6);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
      {videos.map((v) => (
        <VideoTile key={v.id} video={v} />
      ))}
    </div>
  );
}
