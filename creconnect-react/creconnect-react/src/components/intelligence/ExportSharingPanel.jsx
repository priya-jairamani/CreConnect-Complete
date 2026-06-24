import PropTypes from 'prop-types';
import Button from '@/components/common/Button';

export default function ExportSharingPanel({ profileUrl, onCopyLink, onPrint }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <Button variant="secondary" size="md" onClick={onPrint} className="w-full">
        ⬇ Download Media Kit
      </Button>
      <Button variant="secondary" size="md" onClick={onPrint} className="w-full">
        ⬇ Download Profile PDF
      </Button>
      <Button
        variant="secondary"
        size="md"
        onClick={() => window.open(profileUrl, '_blank', 'noopener,noreferrer')}
        className="w-full"
      >
        ↗ Share Public Profile
      </Button>
      <Button variant="secondary" size="md" onClick={onCopyLink} className="w-full">
        ⎘ Copy Public Profile Link
      </Button>
      <Button variant="primary" size="md" onClick={onPrint} className="w-full sm:col-span-2 lg:col-span-1">
        ⚡ Generate Brand Pitch Deck
      </Button>
    </div>
  );
}

ExportSharingPanel.propTypes = {
  profileUrl: PropTypes.string.isRequired,
  onCopyLink: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired,
};
