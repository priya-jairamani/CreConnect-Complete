import PropTypes from 'prop-types';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import { TIMEZONES, NATIONALITIES, GENDERS, AVAILABILITY_STATUSES } from '@/constants/creatorOptions';

const LANGUAGE_OPTIONS = ['English', 'Urdu', 'Punjabi', 'Pashto', 'Sindhi', 'Arabic', 'French'];

export default function IdentityPanel({
  values, onChange, badges, profileUrl, dateJoined,
  avatarUrl, isUploading, uploadError, onPhotoChange, fileInputRef,
  readOnly,
}) {
  const set = (field) => (e) => onChange(field, e.target.value);

  /* Derive years on platform */
  const yearsOnPlatform = (() => {
    if (!dateJoined || dateJoined === '—') return null;
    const joined = new Date(dateJoined);
    if (isNaN(joined)) return null;
    const diff = (Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return diff < 1 ? 'Less than 1 year' : `${Math.floor(diff)} year${Math.floor(diff) !== 1 ? 's' : ''}`;
  })();

  return (
    <div className="space-y-5">
      {/* Avatar + badges */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex items-center gap-4 flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
            >
              {(values.displayName || values.username || 'CC').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            {uploadError && <p className="text-danger text-xs mb-1">{uploadError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onPhotoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
              style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
            >
              {isUploading ? 'Uploading…' : 'Change Photo'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {badges.length > 0 ? badges.map((b) => (
            <Badge key={b.key} variant={b.variant} label={`${b.icon} ${b.label}`} />
          )) : (
            <span className="text-fg-muted text-xs">Badges unlock as your scorecard improves.</span>
          )}
        </div>
      </div>

      {/* Identity fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Full Name"       name="fullName"    value={values.fullName}    onChange={set('fullName')}    placeholder="Your legal name"   disabled={readOnly} />
        <Input label="Display Name"    name="displayName" value={values.displayName} onChange={set('displayName')} placeholder="Your public name"  disabled={readOnly} />
        <Input label="Username"        name="username"    value={values.username}    onChange={set('username')}    placeholder="@yourhandle"       disabled={readOnly} />

        {/* Profile URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Profile URL</label>
          <div className="flex items-center gap-2">
            <input className="input-base w-full" value={profileUrl} readOnly />
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(profileUrl)}
              className="px-3 py-2 rounded-xl text-xs font-medium flex-shrink-0"
              style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
            >
              Copy
            </button>
          </div>
        </div>

        <Input label="Professional Headline" name="headline" value={values.headline} onChange={set('headline')} placeholder="e.g. Lifestyle & Travel Content Creator" className="sm:col-span-2" disabled={readOnly} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-fg">Bio</label>
        <textarea
          name="bio"
          value={values.bio}
          onChange={set('bio')}
          rows={3}
          placeholder="Tell brands about yourself…"
          className="input-base resize-none"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input label="Location" name="location" value={values.location} onChange={set('location')} placeholder="e.g. Lahore, Pakistan" disabled={readOnly} />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Timezone</label>
          <select className="input-base" value={values.timezone} onChange={set('timezone')} disabled={readOnly}>
            <option value="">Select timezone</option>
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Nationality</label>
          <select className="input-base" value={values.nationality} onChange={set('nationality')} disabled={readOnly}>
            <option value="">Select nationality</option>
            {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Gender <span className="text-fg-muted font-normal">(optional)</span></label>
          <select className="input-base" value={values.gender} onChange={set('gender')} disabled={readOnly}>
            <option value="">Prefer not to say</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Availability Status</label>
          <select className="input-base" value={values.availabilityStatus} onChange={set('availabilityStatus')} disabled={readOnly}>
            {AVAILABILITY_STATUSES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
      </div>

      {/* Platform membership info */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] text-fg-muted uppercase tracking-wider mb-1">Date Joined</p>
          <p className="text-fg font-semibold text-sm">{dateJoined}</p>
        </div>
        {yearsOnPlatform && (
          <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] text-fg-muted uppercase tracking-wider mb-1">Member Since</p>
            <p className="text-fg font-semibold text-sm">{yearsOnPlatform}</p>
          </div>
        )}
        <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] text-fg-muted uppercase tracking-wider mb-1">Account Type</p>
          <p className="text-fg font-semibold text-sm">Creator</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] text-fg-muted uppercase tracking-wider mb-1">Profile Status</p>
          <p className="text-success font-semibold text-sm">✓ Active</p>
        </div>
      </div>

      <ChipMultiSelect
        label="Languages"
        options={LANGUAGE_OPTIONS}
        value={values.languages}
        onChange={(v) => !readOnly && onChange('languages', v)}
        readOnly={readOnly}
      />
    </div>
  );
}

IdentityPanel.propTypes = {
  values:       PropTypes.object.isRequired,
  onChange:     PropTypes.func.isRequired,
  badges:       PropTypes.array.isRequired,
  profileUrl:   PropTypes.string.isRequired,
  dateJoined:   PropTypes.string.isRequired,
  avatarUrl:    PropTypes.string,
  isUploading:  PropTypes.bool,
  uploadError:  PropTypes.string,
  onPhotoChange: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  readOnly:     PropTypes.bool,
};
