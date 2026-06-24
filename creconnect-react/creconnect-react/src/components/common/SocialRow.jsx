import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import PlatformIcon from '@/components/common/PlatformIcon';

export const SOCIAL_PLATFORM_FIELDS = [
  { field: 'linkedin',  name: 'LINKEDIN',  label: 'LinkedIn',    placeholder: 'linkedin.com/in/you' },
  { field: 'instagram', name: 'INSTAGRAM', label: 'Instagram',   placeholder: '@handle' },
  { field: 'tiktok',    name: 'TIKTOK',    label: 'TikTok',      placeholder: '@handle' },
  { field: 'youtube',   name: 'YOUTUBE',   label: 'YouTube',     placeholder: '@channel' },
  { field: 'facebook',  name: 'FACEBOOK',  label: 'Facebook',    placeholder: 'facebook.com/page' },
  { field: 'x',         name: 'TWITTER',   label: 'X (Twitter)', placeholder: '@handle' },
];

const POPUP_W = 480;
const POPUP_H = 640;

function openPopup(platform, handle) {
  const left = Math.round(window.screenX + (window.outerWidth  - POPUP_W) / 2);
  const top  = Math.round(window.screenY + (window.outerHeight - POPUP_H) / 2);
  const qs   = handle ? `?handle=${encodeURIComponent(handle)}` : '';
  return window.open(
    `/social-connect/${platform.toLowerCase()}${qs}`,
    `cc_social_${platform}`,
    `width=${POPUP_W},height=${POPUP_H},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
}

export default function SocialRow({
  field, name, label, placeholder,
  value, onChange,
  readOnly,
  isConnected, isDisconnecting,
  onConnect, onDisconnect,
}) {
  const popupRef   = useRef(null);
  // Keep a stable ref to the latest onConnect so the message listener
  // never needs to be re-registered when the callback identity changes.
  const onConnectRef = useRef(onConnect);
  useEffect(() => { onConnectRef.current = onConnect; }, [onConnect]);

  // Register once per mount — uses ref so it sees the latest callback always.
  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type !== 'CC_SOCIAL_CONNECTED') return;
      if (e.data?.platform !== name) return;
      popupRef.current?.close();
      popupRef.current = null;
      onConnectRef.current?.(e.data);
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [name]); // name never changes for a given row

  const handleOpen = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }
    popupRef.current = openPopup(name, value);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-1">
        <label className="text-sm font-medium text-fg flex items-center gap-1.5">
          <PlatformIcon platform={name} size={14} />
          {label}
        </label>

        {isConnected ? (
          <div className="flex items-center gap-2">
            <Badge variant="success" label="Connected" dot />
            <Button
              variant="ghost"
              size="xs"
              isLoading={isDisconnecting}
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="xs"
            onClick={handleOpen}
          >
            Connect
          </Button>
        )}
      </div>

      <Input
        name={field}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        prefix={<PlatformIcon platform={name} size={15} />}
        disabled={readOnly}
      />
    </div>
  );
}

SocialRow.propTypes = {
  field:           PropTypes.string.isRequired,
  name:            PropTypes.string.isRequired,
  label:           PropTypes.string.isRequired,
  placeholder:     PropTypes.string.isRequired,
  value:           PropTypes.string.isRequired,
  onChange:        PropTypes.func.isRequired,
  readOnly:        PropTypes.bool,
  isConnected:     PropTypes.bool,
  isDisconnecting: PropTypes.bool,
  onConnect:       PropTypes.func.isRequired,
  onDisconnect:    PropTypes.func.isRequired,
};
