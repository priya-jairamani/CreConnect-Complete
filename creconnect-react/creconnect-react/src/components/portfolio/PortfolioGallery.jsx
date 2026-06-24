import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import { formatFollowers } from '@/utils/formatters';
import { seededRandom } from '@/utils/mockAnalytics';

const GRADIENTS = [
  'linear-gradient(135deg, #6d5cff, #4c2dd1)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #16b364, #0e9f6e)',
  'linear-gradient(135deg, #857fff, #6d5cff)',
  'linear-gradient(135deg, #ec4899, #6d5cff)',
  'linear-gradient(135deg, #f5a623, #f59e0b)',
];

const TAGS = ['Top Performing', 'Most Engaged', 'Highest Reach', 'Best Campaign', 'Trending', 'Editor\'s Pick'];

export default function PortfolioGallery({ seed, count = 6 }) {
  const rand = seededRandom(`${seed}-gallery`);
  const items = Array.from({ length: count }, (_, i) => ({
    id: i,
    gradient: GRADIENTS[i % GRADIENTS.length],
    tag: TAGS[i % TAGS.length],
    views: Math.round(2000 + rand() * 200000),
    engagement: Math.round((1.5 + rand() * 8) * 10) / 10,
    type: ['Reel', 'Post', 'Carousel', 'Video'][Math.floor(rand() * 4)],
  }));

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
          Portfolio Gallery
        </h2>
        <Badge variant="neutral" label="Sample content" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative rounded-xl overflow-hidden aspect-[4/5] flex flex-col justify-between p-3 group cursor-pointer transition-transform hover:-translate-y-1"
            style={{ background: item.gradient }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/30 text-white backdrop-blur-sm">
                {item.type}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/30 text-white backdrop-blur-sm">
                {item.tag}
              </span>
            </div>
            <div className="text-white">
              <p className="text-sm font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{formatFollowers(item.views)} views</p>
              <p className="text-xs opacity-80">{item.engagement}% engagement</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

PortfolioGallery.propTypes = {
  seed: PropTypes.string.isRequired,
  count: PropTypes.number,
};
