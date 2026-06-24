import PropTypes from 'prop-types';
import {
  FaInstagram, FaTiktok, FaYoutube, FaLinkedin, FaFacebook,
  FaXTwitter, FaThreads, FaSnapchat, FaGlobe,
} from 'react-icons/fa6';

export const PLATFORM_META = {
  INSTAGRAM: { Icon: FaInstagram, label: 'Instagram', color: '#E1306C' },
  TIKTOK:    { Icon: FaTiktok,    label: 'TikTok',    color: '#69C9D0' },
  YOUTUBE:   { Icon: FaYoutube,   label: 'YouTube',   color: '#FF0000' },
  LINKEDIN:  { Icon: FaLinkedin,  label: 'LinkedIn',  color: '#0A66C2' },
  FACEBOOK:  { Icon: FaFacebook,  label: 'Facebook',  color: '#1877F2' },
  X:         { Icon: FaXTwitter,  label: 'X',         color: '#ffffff' },
  TWITTER:   { Icon: FaXTwitter,  label: 'X',         color: '#ffffff' },
  THREADS:   { Icon: FaThreads,   label: 'Threads',   color: '#ffffff' },
  SNAPCHAT:  { Icon: FaSnapchat,  label: 'Snapchat',  color: '#FFFC00' },
};

export function getPlatformMeta(platform) {
  return PLATFORM_META[platform?.toUpperCase()] ?? { Icon: FaGlobe, label: platform ?? 'Other', color: '#9aa1b6' };
}

/**
 * Real brand icon for a connected platform (Instagram, TikTok, YouTube, etc.).
 * Falls back to a generic globe icon for unrecognized platforms.
 */
export default function PlatformIcon({ platform, size = 16, className = '' }) {
  const { Icon, color } = getPlatformMeta(platform);
  return <Icon size={size} color={color} className={className} aria-hidden="true" />;
}

PlatformIcon.propTypes = {
  platform: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
};
