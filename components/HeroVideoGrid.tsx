import { getPortfolioVideos } from '@/lib/portfolio';
import { VideoTile } from './VideoCard';

// Server component: fetches its own six so callers don't have to.
export async function HeroVideoGrid() {
  const videos = (await getPortfolioVideos()).slice(0, 6);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
      {videos.map((v) => (
        <VideoTile key={v.id} video={v} />
      ))}
    </div>
  );
}
