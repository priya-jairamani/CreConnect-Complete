import PropTypes from 'prop-types';

export default function BrandGalleryMediaSection({ gallery }) {
  return (
    <div className="space-y-5">
      {gallery.map((group) => (
        <div key={group.category}>
          <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-2">{group.category}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl aspect-square flex items-end p-3"
                style={{ background: item.gradient }}
              >
                <p className="text-white text-xs font-semibold leading-snug drop-shadow">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

BrandGalleryMediaSection.propTypes = {
  gallery: PropTypes.arrayOf(PropTypes.shape({
    category: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
  })).isRequired,
};
