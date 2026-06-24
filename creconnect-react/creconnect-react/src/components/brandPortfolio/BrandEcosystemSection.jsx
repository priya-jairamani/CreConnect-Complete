import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';

function EcosystemGroup({ icon, label, items, render }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-2">{icon} {label}</p>
      <div className="flex flex-wrap gap-1.5">{items.map(render)}</div>
    </div>
  );
}
EcosystemGroup.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  render: PropTypes.func.isRequired,
};

export default function BrandEcosystemSection({ ecosystem }) {
  return (
    <div className="space-y-4">
      <EcosystemGroup
        icon="🧩" label="Products" items={ecosystem.products}
        render={(p) => <Badge key={p.id} variant="brand" label={p.name} />}
      />
      <EcosystemGroup
        icon="🌱" label="Sub-Brands" items={ecosystem.subBrands}
        render={(b) => <Badge key={b.id} variant="accent" label={b.name} />}
      />
      <EcosystemGroup
        icon="🤝" label="Partner Brands" items={ecosystem.partnerBrands}
        render={(b) => <Badge key={b.id} variant="neutral" label={b.name} />}
      />
      <EcosystemGroup
        icon="🗂" label="Campaign Categories" items={ecosystem.campaignCategories}
        render={(c) => <Badge key={c} variant="success" label={c} />}
      />
    </div>
  );
}

BrandEcosystemSection.propTypes = {
  ecosystem: PropTypes.shape({
    products: PropTypes.array.isRequired,
    subBrands: PropTypes.array.isRequired,
    partnerBrands: PropTypes.array.isRequired,
    campaignCategories: PropTypes.array.isRequired,
  }).isRequired,
};
