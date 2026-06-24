import PropTypes from 'prop-types';
import CollapsibleSection from '@/components/common/CollapsibleSection';

export default function SettingsSectionCard({ id, icon, title, subtitle, badge, defaultOpen = true, children }) {
  return (
    <div id={id} style={{ scrollMarginTop: '1.5rem' }}>
      <CollapsibleSection icon={icon} title={title} subtitle={subtitle} badge={badge} defaultOpen={defaultOpen}>
        {children}
      </CollapsibleSection>
    </div>
  );
}

SettingsSectionCard.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  badge: PropTypes.node,
  defaultOpen: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
