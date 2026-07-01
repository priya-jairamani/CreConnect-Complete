import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Input from '@/components/common/Input';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import SocialRow, { SOCIAL_PLATFORM_FIELDS } from '@/components/common/SocialRow';
import { uploadApi } from '@/api/upload.api';
import { resolveMediaUrl } from '@/utils/media';

const COMPANY_SIZES = ['Startup (1-10)', 'Growing (11-50)', 'Mid-size (51-200)', 'Enterprise (200+)'];
const BRAND_COLORS  = ['#6d5cff', '#16b364', '#f5a623', '#f0445f', '#3aa0ff', '#a855f7', '#ec4899', '#14b8a6'];

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-fg">{label}</label>
      {children}
    </div>
  );
}
Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

const BRAND_FIELD_MAP = { x: 'twitter' };
const brandField = (f) => BRAND_FIELD_MAP[f] ?? f;

export default function CompanyProfileSection({ values, onChange }) {
  const logoInputRef   = useRef(null);
  const bannerInputRef = useRef(null);
  const [uploadingLogo,   setUploadingLogo]   = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError,     setUploadError]     = useState(null);

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setUploadError('Logo must be under 2 MB'); return; }
    setUploadError(null);
    setUploadingLogo(true);
    try {
      const { data } = await uploadApi.avatar(file);
      onChange('logoUrl', data?.url ?? data);
    } catch (err) {
      setUploadError(err?.message || 'Logo upload failed. Please try again.');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError('Banner must be under 5 MB'); return; }
    setUploadError(null);
    setUploadingBanner(true);
    try {
      const { data } = await uploadApi.banner(file);
      onChange('bannerUrl', data?.url ?? data);
    } catch (err) {
      setUploadError(err?.message || 'Banner upload failed. Please try again.');
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Basic Information ─────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Basic Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Company Name"  name="companyName" value={values.companyName} onChange={(e) => onChange('companyName', e.target.value)} placeholder="Acme Co." />
          <Input label="Brand Name"    name="brandName"   value={values.brandName}   onChange={(e) => onChange('brandName',   e.target.value)} placeholder="Acme" />
          <Input label="Company Tagline" name="tagline" value={values.tagline} onChange={(e) => onChange('tagline', e.target.value)} placeholder="Your brand's one-liner" className="sm:col-span-2" />
          <Field label="Industry">
            <Input name="industry" value={values.industry} onChange={(e) => onChange('industry', e.target.value)} placeholder="e.g. Fashion, Tech" />
          </Field>
          <Field label="Founded Year">
            <Input name="foundedYear" type="number" value={values.foundedYear} onChange={(e) => onChange('foundedYear', e.target.value)} placeholder="2018" />
          </Field>
          <Field label="Company Size">
            <select className="input-base w-full" value={values.companySize} onChange={(e) => onChange('companySize', e.target.value)}>
              <option value="">Select size</option>
              {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Input label="Headquarters" name="headquarters" value={values.headquarters} onChange={(e) => onChange('headquarters', e.target.value)} placeholder="Lahore, Pakistan" />
          <Input label="Website" name="website" type="url" value={values.website} onChange={(e) => onChange('website', e.target.value)} placeholder="https://yoursite.com" className="sm:col-span-2" />
          <Field label="Company Description">
            <textarea
              className="input-base w-full min-h-[100px] resize-y sm:col-span-2"
              value={values.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Tell creators about your brand, mission, and what makes you unique."
            />
          </Field>
        </div>
      </div>

      {/* ── Brand Identity ────────────────────────────────────── */}
      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Brand Identity</h3>

        {uploadError && (
          <p className="text-xs text-danger mb-3">{uploadError}</p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Logo upload */}
          <div className="card rounded-2xl p-4 flex items-center gap-4" style={{ background: 'var(--surface-2)' }}>
            <Avatar src={values.logoUrl} initials={values.companyName?.slice(0, 2)?.toUpperCase()} size="xl" />
            <div className="min-w-0">
              <p className="text-fg font-medium text-sm mb-1">Logo</p>
              <p className="text-fg-muted text-xs mb-2">PNG or JPG, square, max 2 MB</p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
              <Button
                variant="secondary"
                size="xs"
                isLoading={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
              >
                {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
              </Button>
            </div>
          </div>

          {/* Banner upload */}
          <div className="card rounded-2xl overflow-hidden sm:col-span-2" style={{ background: 'var(--surface-2)' }}>
            {/* Preview strip */}
            <div className="relative h-24 w-full overflow-hidden">
              {values.bannerUrl ? (
                <img src={resolveMediaUrl(values.bannerUrl)} alt="Banner preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #857fff 0%, #4c2dd1 100%)' }} />
              )}
              {values.bannerUrl && (
                <div className="absolute inset-0 bg-black/20" />
              )}
            </div>
            <div className="p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-fg font-medium text-sm">Cover Banner</p>
                <p className="text-fg-muted text-xs">1600×400 px recommended · max 5 MB</p>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleBannerChange}
              />
              <Button
                variant="secondary"
                size="xs"
                isLoading={uploadingBanner}
                onClick={() => bannerInputRef.current?.click()}
              >
                {uploadingBanner ? 'Uploading…' : values.bannerUrl ? 'Change' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>

        {/* Brand colour picker */}
        <div className="mt-4">
          <Field label="Brand Color">
            <div className="flex flex-wrap gap-2">
              {BRAND_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange('brandColor', c)}
                  className="w-8 h-8 rounded-full flex-shrink-0 transition-transform"
                  style={{
                    background: c,
                    outline:       values.brandColor === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                    transform:     values.brandColor === c ? 'scale(1.1)' : 'scale(1)',
                    border:        '2px solid var(--surface)',
                  }}
                  aria-label={`Use color ${c}`}
                />
              ))}
            </div>
          </Field>
        </div>
      </div>

      {/* ── Social Links ─────────────────────────────────────── */}
      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Social Links</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOCIAL_PLATFORM_FIELDS.map(({ field, name, label, placeholder }) => {
            const key = brandField(field);
            return (
              <SocialRow
                key={field}
                field={field}
                name={name}
                label={label}
                placeholder={placeholder}
                value={values[key] ?? ''}
                onChange={(e) => onChange(key, e.target.value)}
                isConnected={!!values[key]}
                onConnect={(data) => onChange(key, data.handle ?? data.name ?? '')}
                onDisconnect={() => onChange(key, '')}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

CompanyProfileSection.propTypes = {
  values:   PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
