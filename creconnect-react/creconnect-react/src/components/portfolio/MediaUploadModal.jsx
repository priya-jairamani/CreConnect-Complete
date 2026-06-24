import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import { uploadApi } from '@/api/upload.api';
import { creatorsApi } from '@/api/creators.api';

const CONTENT_TYPES = [
  'Photo', 'Video', 'Reel', 'Short', 'UGC Content',
  'Product Shoot', 'Lifestyle Content', 'Review Content', 'Brand Collaboration',
];

const PLATFORMS = [
  { id: 'INSTAGRAM', label: 'Instagram',   color: '#E1306C' },
  { id: 'TIKTOK',    label: 'TikTok',      color: '#010101' },
  { id: 'YOUTUBE',   label: 'YouTube',     color: '#FF0000' },
  { id: 'FACEBOOK',  label: 'Facebook',    color: '#1877F2' },
  { id: 'LINKEDIN',  label: 'LinkedIn',    color: '#0A66C2' },
  { id: 'X',         label: 'X / Twitter', color: '#000000' },
  { id: 'OTHER',     label: 'Other',       color: '#9aa1b6' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public',  label: 'Public',  desc: 'Visible to all brands and visitors' },
  { value: 'private', label: 'Private', desc: 'Only visible to you'                },
];

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/mov,video/webm';
const MAX_SIZE_MB = 100;

function DropZone({ onFile, isDragging, setIsDragging }) {
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }, [onFile, setIsDragging]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all select-none"
      style={{
        border: `2px dashed ${isDragging ? 'var(--brand-500)' : 'var(--border)'}`,
        background: isDragging ? 'rgba(109,92,255,0.06)' : 'var(--surface-2)',
        minHeight: 180,
        padding: '2rem',
      }}
    >
      <span className="text-4xl">{isDragging ? '📥' : '🖼️'}</span>
      <div className="text-center">
        <p className="font-semibold text-fg text-sm">{isDragging ? 'Drop to upload' : 'Drag & drop or click to browse'}</p>
        <p className="text-fg-muted text-xs mt-1">Photos & videos · Max {MAX_SIZE_MB}MB · JPG, PNG, WebP, MP4, MOV</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
    </div>
  );
}
DropZone.propTypes = {
  onFile: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  setIsDragging: PropTypes.func.isRequired,
};

function FilePreview({ file, previewUrl, isVideo }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center" style={{ minHeight: 180, maxHeight: 220 }}>
      {isVideo ? (
        <video src={previewUrl} controls className="w-full h-full object-contain max-h-[220px]" />
      ) : (
        <img src={previewUrl} alt="preview" className="w-full h-full object-contain max-h-[220px]" />
      )}
      <span className="sr-only">{file.name}</span>
    </div>
  );
}
FilePreview.propTypes = {
  file: PropTypes.object.isRequired,
  previewUrl: PropTypes.string.isRequired,
  isVideo: PropTypes.bool.isRequired,
};

function ProgressBar({ progress }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-fg-muted">Uploading…</span>
        <span className="text-fg font-semibold">{progress}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6d5cff, #4c2dd1)' }}
        />
      </div>
    </div>
  );
}
ProgressBar.propTypes = { progress: PropTypes.number.isRequired };

/* ── Main modal ──────────────────────────────────────────────────── */

const INITIAL_FORM = {
  title: '', description: '', platform: 'INSTAGRAM', contentType: 'Photo',
  tags: [], tagInput: '', visibility: 'public', isFeatured: false, campaignId: '',
};

export default function MediaUploadModal({ isOpen, onClose, onSuccess }) {
  const [isDragging,  setIsDragging]  = useState(false);
  const [file,        setFile]        = useState(null);
  const [previewUrl,  setPreviewUrl]  = useState(null);
  const [form,        setForm]        = useState(INITIAL_FORM);
  const [progress,    setProgress]    = useState(0);
  const [phase,       setPhase]       = useState('idle'); // idle | uploading | saving | success | error
  const [errorMsg,    setErrorMsg]    = useState('');

  const isVideo = file?.type?.startsWith('video/');

  function handleFile(f) {
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    setErrorMsg('');
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    // Auto-detect content type
    if (f.type.startsWith('video/')) {
      setForm((p) => ({ ...p, contentType: 'Video' }));
    } else {
      setForm((p) => ({ ...p, contentType: 'Photo' }));
    }
  }

  function handleTagKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && form.tagInput.trim()) {
      e.preventDefault();
      const tag = form.tagInput.trim().replace(/,/g, '');
      if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
        setForm((p) => ({ ...p, tags: [...p.tags, tag], tagInput: '' }));
      } else {
        setForm((p) => ({ ...p, tagInput: '' }));
      }
    }
  }

  function removeTag(tag) {
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  }

  const handleClose = () => {
    if (phase === 'uploading' || phase === 'saving') return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setForm(INITIAL_FORM);
    setProgress(0);
    setPhase('idle');
    setErrorMsg('');
    onClose();
  };

  async function handleSubmit() {
    if (!file || !form.title.trim()) {
      setErrorMsg('Please select a file and enter a title.');
      return;
    }
    setErrorMsg('');
    setPhase('uploading');
    try {
      // Step 1: Upload the file
      const uploadRes = await uploadApi.mediaFile(file, setProgress);
      const { fileUrl, thumbnailUrl } = uploadRes.data ?? {};

      setPhase('saving');

      // Step 2: Create the media record
      const payload = {
        fileUrl,
        thumbnailUrl: thumbnailUrl ?? fileUrl,
        fileType: isVideo ? 'video' : 'image',
        title:       form.title.trim(),
        description: form.description.trim(),
        platform:    form.platform,
        contentType: form.contentType,
        tags:        form.tags,
        visibility:  form.visibility,
        isFeatured:  form.isFeatured,
        campaignId:  form.campaignId || undefined,
      };

      const { data: newMedia } = await creatorsApi.addMedia(payload);

      setPhase('success');
      setTimeout(() => {
        onSuccess?.(newMedia);
        handleClose();
      }, 1200);
    } catch (err) {
      setPhase('error');
      setErrorMsg(err?.response?.data?.message || err?.message || 'Upload failed. Please try again.');
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl rounded-2xl flex flex-col max-h-[92vh] animate-fade-up"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Add Media</h2>
            <p className="text-fg-muted text-sm mt-0.5">Upload a photo or video to your portfolio</p>
          </div>
          <button
            onClick={handleClose}
            disabled={phase === 'uploading' || phase === 'saving'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg hover:bg-white/8 transition-colors text-xl leading-none disabled:opacity-40"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5 min-h-0">

          {phase === 'success' ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <span className="text-5xl">✅</span>
              <p className="font-semibold text-fg text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>Media uploaded!</p>
              <p className="text-fg-muted text-sm">Your content has been added to your portfolio.</p>
            </div>
          ) : (
            <>
              {/* File picker / preview */}
              {file ? (
                <div className="space-y-2">
                  <FilePreview file={file} previewUrl={previewUrl} isVideo={isVideo} />
                  {phase !== 'uploading' && phase !== 'saving' && (
                    <button
                      type="button"
                      onClick={() => { if (previewUrl) URL.revokeObjectURL(previewUrl); setFile(null); setPreviewUrl(null); setProgress(0); setPhase('idle'); }}
                      className="text-xs text-fg-muted hover:text-danger transition-colors"
                    >
                      ✕ Remove file
                    </button>
                  )}
                </div>
              ) : (
                <DropZone onFile={handleFile} isDragging={isDragging} setIsDragging={setIsDragging} />
              )}

              {/* Upload progress */}
              {(phase === 'uploading') && <ProgressBar progress={progress} />}
              {(phase === 'saving') && (
                <div className="flex items-center gap-2 text-sm text-fg-muted">
                  <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  Saving to your portfolio…
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <p className="text-danger text-sm px-3 py-2 rounded-xl" style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}>
                  {errorMsg}
                </p>
              )}

              {/* Form fields — only show when a file is selected */}
              {file && phase !== 'uploading' && phase !== 'saving' && (
                <div className="space-y-4">

                  <Input
                    label="Title"
                    name="title"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Summer Collection Reel"
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-fg">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Describe this content piece…"
                      rows={2}
                      className="input-base w-full resize-none"
                    />
                  </div>

                  {/* Platform */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-fg">Platform</label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, platform: p.id }))}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                          style={form.platform === p.id
                            ? { background: p.color, color: '#fff' }
                            : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                          }
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Type */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-fg">Content Type</label>
                    <select
                      value={form.contentType}
                      onChange={(e) => setForm((p) => ({ ...p, contentType: e.target.value }))}
                      className="input-base w-full"
                    >
                      {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-fg">Tags <span className="text-fg-muted font-normal text-xs">(press Enter to add)</span></label>
                    <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl min-h-[44px]" style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                      {form.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(109,92,255,0.15)', color: '#857fff' }}>
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100 leading-none ml-0.5">×</button>
                        </span>
                      ))}
                      <input
                        value={form.tagInput}
                        onChange={(e) => setForm((p) => ({ ...p, tagInput: e.target.value }))}
                        onKeyDown={handleTagKeyDown}
                        placeholder={form.tags.length === 0 ? 'fashion, lifestyle, brand collab…' : ''}
                        className="flex-1 min-w-[120px] text-xs bg-transparent outline-none text-fg placeholder:text-fg-muted"
                      />
                    </div>
                  </div>

                  {/* Visibility + Featured */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-fg">Visibility</label>
                      <div className="space-y-1.5">
                        {VISIBILITY_OPTIONS.map((v) => (
                          <label key={v.value} className="flex items-start gap-2.5 cursor-pointer">
                            <input
                              type="radio"
                              name="visibility"
                              value={v.value}
                              checked={form.visibility === v.value}
                              onChange={() => setForm((p) => ({ ...p, visibility: v.value }))}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <div>
                              <p className="text-sm text-fg font-medium">{v.label}</p>
                              <p className="text-xs text-fg-muted">{v.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-fg">Featured</label>
                      <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl transition-colors" style={{ border: '1px solid var(--border)', background: form.isFeatured ? 'rgba(245,166,35,0.08)' : 'var(--surface-2)' }}>
                        <input
                          type="checkbox"
                          checked={form.isFeatured}
                          onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                        />
                        <div>
                          <p className="text-sm text-fg font-medium">Mark as Featured</p>
                          <p className="text-xs text-fg-muted">Appears first in portfolio</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {phase !== 'success' && (
          <div className="flex items-center justify-end gap-3 p-5 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            <Button variant="ghost" size="md" onClick={handleClose} disabled={phase === 'uploading' || phase === 'saving'}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!file || !form.title.trim() || phase === 'uploading' || phase === 'saving'}
              isLoading={phase === 'uploading' || phase === 'saving'}
            >
              Upload & Save
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

MediaUploadModal.propTypes = {
  isOpen:    PropTypes.bool.isRequired,
  onClose:   PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
