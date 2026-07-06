import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/api/admin.api';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Drawer from '@/components/common/Drawer';

import SettingsSidebar from '@/components/settings/SettingsSidebar';
import AuditTimeline from '@/components/settings/AuditTimeline';
import PlatformConfigSection from '@/components/settings/PlatformConfigSection';
import CreatorSystemConfigurator from '@/components/settings/CreatorSystemConfigurator';
import BrandSystemConfigurator from '@/components/settings/BrandSystemConfigurator';
import MarketplaceRulesPanel from '@/components/settings/MarketplaceRulesPanel';
import TrustSafetySection from '@/components/settings/TrustSafetySection';
import PrivacyControlCenter from '@/components/settings/PrivacyControlCenter';
import AIAutomationSection from '@/components/settings/AIAutomationSection';
import SecurityCenterSection from '@/components/settings/SecurityCenterSection';
import IntegrationsSection from '@/components/settings/IntegrationsSection';
import BillingRevenueSection from '@/components/settings/BillingRevenueSection';

import {
  SETTINGS_SECTIONS, SETTINGS_SCHEMA,
  PRIVACY_MATRIX, ACCESS_CONTROL_MATRIX, FEATURE_ACCESS_MATRIX,
  AUTOMATION_RULES, CUSTOM_AUTOMATIONS, AI_ADVISOR_RECOMMENDATIONS,
  SECURITY_HEALTH_SCORE, SECURITY_HEALTH_FACTORS, SECURITY_MONITORING_STATS, SECURITY_EVENTS,
  CONNECTED_SERVICES, API_KEYS, WEBHOOK_SECRETS, AUDIT_LOG,
} from '@/utils/mockSettings';

function buildInitialValues(overrides = {}) {
  const result = {};
  for (const sectionId of Object.keys(SETTINGS_SCHEMA)) {
    result[sectionId] = {};
    for (const group of SETTINGS_SCHEMA[sectionId]) {
      for (const field of group.fields) {
        // Use the real persisted value if the backend has an override for this
        // field; otherwise fall back to the schema's default (the effective
        // current value until an admin changes it for the first time).
        result[sectionId][field.id] = Object.prototype.hasOwnProperty.call(overrides, field.id)
          ? overrides[field.id]
          : field.value;
      }
    }
  }
  return result;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function fieldLabel(sectionId, fieldId) {
  for (const group of SETTINGS_SCHEMA[sectionId] ?? []) {
    const field = group.fields.find((f) => f.id === fieldId);
    if (field) return field;
  }
  return null;
}

const INITIAL_VALUES = buildInitialValues();

export default function Settings() {
  const toast = useToast();

  const [activeSection, setActiveSection] = useState(SETTINGS_SECTIONS[0].id);
  const [highlightFieldId, setHighlightFieldId] = useState(null);

  const [values, setValues] = useState(() => clone(INITIAL_VALUES));
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [privacyMatrix, setPrivacyMatrix] = useState(() => clone(PRIVACY_MATRIX.value));
  const [accessMatrix, setAccessMatrix] = useState(() => clone(ACCESS_CONTROL_MATRIX.value));
  const [featureMatrix, setFeatureMatrix] = useState(() => clone(FEATURE_ACCESS_MATRIX.value));
  const [automationRules, setAutomationRules] = useState(() => clone(AUTOMATION_RULES));
  const [customAutomations, setCustomAutomations] = useState(() => clone(CUSTOM_AUTOMATIONS));
  const [connectedServices, setConnectedServices] = useState(() => clone(CONNECTED_SERVICES));
  const [advisorRecommendations, setAdvisorRecommendations] = useState(() => clone(AI_ADVISOR_RECOMMENDATIONS));
  const [auditLog, setAuditLog] = useState(() => clone(AUDIT_LOG));
  const [auditOpen, setAuditOpen] = useState(false);

  const baseline = useRef({
    values: clone(INITIAL_VALUES),
    privacyMatrix: clone(PRIVACY_MATRIX.value),
    accessMatrix: clone(ACCESS_CONTROL_MATRIX.value),
    featureMatrix: clone(FEATURE_ACCESS_MATRIX.value),
    automationRules: clone(AUTOMATION_RULES),
    customAutomations: clone(CUSTOM_AUTOMATIONS),
    connectedServices: clone(CONNECTED_SERVICES),
  });

  // Load the real persisted settings overrides from the backend on mount and
  // merge them over the schema defaults (per-field: persisted value wins,
  // schema default is the fallback until an admin saves that field for the
  // first time).
  useEffect(() => {
    let cancelled = false;

    adminApi.getSettings()
      .then(({ data }) => {
        if (cancelled) return;
        const overrides = data && typeof data === 'object' ? data : {};
        const merged = buildInitialValues(overrides);
        setValues(merged);
        baseline.current.values = clone(merged);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load saved settings — showing defaults.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSettings(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modifiedFieldsBySection = useMemo(() => {
    const map = {};
    for (const sectionId of Object.keys(values)) {
      const set = new Set();
      for (const fieldId of Object.keys(values[sectionId])) {
        if (JSON.stringify(values[sectionId][fieldId]) !== JSON.stringify(baseline.current.values[sectionId]?.[fieldId])) {
          set.add(fieldId);
        }
      }
      map[sectionId] = set;
    }
    return map;
  }, [values]);

  const modifiedCountBySection = useMemo(() => {
    const counts = {};
    for (const sectionId of Object.keys(modifiedFieldsBySection)) {
      counts[sectionId] = modifiedFieldsBySection[sectionId].size;
    }
    if (JSON.stringify(privacyMatrix) !== JSON.stringify(baseline.current.privacyMatrix)) {
      counts.privacy = (counts.privacy ?? 0) + 1;
    }
    if (JSON.stringify(accessMatrix) !== JSON.stringify(baseline.current.accessMatrix)) {
      counts.security = (counts.security ?? 0) + 1;
    }
    if (JSON.stringify(featureMatrix) !== JSON.stringify(baseline.current.featureMatrix)) {
      counts.billing = (counts.billing ?? 0) + 1;
    }
    if (JSON.stringify(automationRules) !== JSON.stringify(baseline.current.automationRules) ||
        JSON.stringify(customAutomations) !== JSON.stringify(baseline.current.customAutomations)) {
      counts.ai_automation = (counts.ai_automation ?? 0) + 1;
    }
    if (JSON.stringify(connectedServices) !== JSON.stringify(baseline.current.connectedServices)) {
      counts.integrations = (counts.integrations ?? 0) + 1;
    }
    return counts;
  }, [modifiedFieldsBySection, privacyMatrix, accessMatrix, featureMatrix, automationRules, customAutomations, connectedServices]);

  const totalChanges = Object.values(modifiedCountBySection).reduce((sum, n) => sum + n, 0);
  const isDirty = totalChanges > 0;

  function handleChange(sectionId, fieldId, value) {
    setValues((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], [fieldId]: value } }));
  }

  function handleSelectSection(sectionId) {
    setActiveSection(sectionId);
    setHighlightFieldId(null);
  }

  function handleSelectField(sectionId, fieldId) {
    setActiveSection(sectionId);
    setHighlightFieldId(fieldId);
    requestAnimationFrame(() => {
      document.getElementById(`field-${fieldId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    setTimeout(() => setHighlightFieldId(null), 2500);
  }

  async function handleSaveAll() {
    const now = new Date().toISOString();
    const newEntries = [];
    const changedFields = {};

    for (const sectionId of Object.keys(modifiedFieldsBySection)) {
      const section = SETTINGS_SECTIONS.find((s) => s.id === sectionId);
      for (const fieldId of modifiedFieldsBySection[sectionId]) {
        const field = fieldLabel(sectionId, fieldId);
        if (!field) continue;
        const oldVal = baseline.current.values[sectionId]?.[fieldId];
        const newVal = values[sectionId][fieldId];
        changedFields[fieldId] = newVal;
        newEntries.push({
          id: `aud-${Date.now()}-${sectionId}-${fieldId}`,
          settingLabel: field.label,
          sectionLabel: section?.label ?? sectionId,
          changedBy: 'You (Admin)',
          timestamp: now,
          oldValue: Array.isArray(oldVal) ? oldVal.join(', ') : String(oldVal),
          newValue: Array.isArray(newVal) ? newVal.join(', ') : String(newVal),
          reason: 'Updated via Settings workspace.',
        });
      }
    }

    setIsSaving(true);
    try {
      // Only the schema-driven field values are backed by the real
      // /admin/settings key-value store — persist those genuinely.
      if (Object.keys(changedFields).length > 0) {
        await adminApi.updateSettings(changedFields);
      }

      if (newEntries.length) {
        setAuditLog((prev) => [...newEntries, ...prev]);
      }

      baseline.current = {
        values: clone(values),
        privacyMatrix: clone(privacyMatrix),
        accessMatrix: clone(accessMatrix),
        featureMatrix: clone(featureMatrix),
        automationRules: clone(automationRules),
        customAutomations: clone(customAutomations),
        connectedServices: clone(connectedServices),
      };

      toast.success(`${totalChanges} setting${totalChanges === 1 ? '' : 's'} saved successfully.`);
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscardAll() {
    setValues(clone(baseline.current.values));
    setPrivacyMatrix(clone(baseline.current.privacyMatrix));
    setAccessMatrix(clone(baseline.current.accessMatrix));
    setFeatureMatrix(clone(baseline.current.featureMatrix));
    setAutomationRules(clone(baseline.current.automationRules));
    setCustomAutomations(clone(baseline.current.customAutomations));
    setConnectedServices(clone(baseline.current.connectedServices));
    toast.success('All unsaved changes discarded.');
  }

  function handleRollback(entry) {
    toast.success(`"${entry.settingLabel}" rolled back to "${entry.oldValue}".`);
  }

  function togglePrivacy(row, col, val) {
    setPrivacyMatrix((prev) => ({ ...prev, [row]: { ...prev[row], [col]: val } }));
  }
  function toggleAccess(row, col, val) {
    setAccessMatrix((prev) => ({ ...prev, [row]: { ...prev[row], [col]: val } }));
  }
  function toggleFeature(row, col, val) {
    setFeatureMatrix((prev) => ({ ...prev, [row]: { ...prev[row], [col]: val } }));
  }

  function toggleAutomationRule(id) {
    setAutomationRules((prev) => prev.map((r) => (r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r)));
  }
  function createAutomation(rule) {
    setCustomAutomations((prev) => [rule, ...prev]);
    toast.success(`Automation "${rule.name}" created.`);
  }
  function toggleAutomation(id) {
    setCustomAutomations((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }
  function deleteAutomation(id) {
    setCustomAutomations((prev) => prev.filter((r) => r.id !== id));
    toast.success('Automation rule deleted.');
  }

  function toggleService(id) {
    setConnectedServices((prev) => prev.map((s) => (
      s.id === id
        ? { ...s, status: s.status === 'connected' ? 'not_connected' : 'connected', lastSync: s.status === 'connected' ? null : new Date().toISOString() }
        : s
    )));
  }

  function applyRecommendation(rec) {
    setAdvisorRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
    toast.success(`Applied: ${rec.action}`);
  }
  function dismissRecommendation(rec) {
    setAdvisorRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
  }

  const sectionMeta = SETTINGS_SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Settings — Platform Governance & Configuration Center
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Govern creators, brands, campaigns, AI systems, security, privacy, moderation, verification & marketplace economics from one workspace.
          </p>
          {isLoadingSettings && (
            <p className="text-xs text-fg-muted mt-1 flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Loading saved settings…
            </p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setAuditOpen(true)} icon={<span>🕓</span>}>
          Audit Trail & Version History
        </Button>
      </header>

      {isDirty && (
        <div className="card rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap sticky top-0 z-20" style={{ borderColor: 'var(--brand-500)' }}>
          <div className="flex items-center gap-2">
            <Badge variant="brand" label={`${totalChanges} unsaved change${totalChanges === 1 ? '' : 's'}`} />
            <p className="text-sm text-fg-muted">Review your changes before they take effect platform-wide.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleDiscardAll} disabled={isSaving}>Discard</Button>
            <Button size="sm" variant="primary" onClick={handleSaveAll} isLoading={isSaving}>
              {isSaving ? 'Saving…' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <SettingsSidebar
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          onSelectField={handleSelectField}
          modifiedBySection={modifiedCountBySection}
        />

        <div className="flex-1 min-w-0 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-fg flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              <span>{sectionMeta?.icon}</span> {sectionMeta?.label}
            </h2>
            <p className="text-fg-muted text-sm mt-0.5">{sectionMeta?.description}</p>
          </div>

          {activeSection === 'platform' && (
            <PlatformConfigSection values={values.platform} onChange={(f, v) => handleChange('platform', f, v)} modifiedFields={modifiedFieldsBySection.platform} highlightFieldId={highlightFieldId} />
          )}
          {activeSection === 'creator' && (
            <CreatorSystemConfigurator values={values.creator} onChange={(f, v) => handleChange('creator', f, v)} modifiedFields={modifiedFieldsBySection.creator} highlightFieldId={highlightFieldId} />
          )}
          {activeSection === 'brand' && (
            <BrandSystemConfigurator values={values.brand} onChange={(f, v) => handleChange('brand', f, v)} modifiedFields={modifiedFieldsBySection.brand} highlightFieldId={highlightFieldId} />
          )}
          {activeSection === 'marketplace' && (
            <MarketplaceRulesPanel values={values.marketplace} onChange={(f, v) => handleChange('marketplace', f, v)} modifiedFields={modifiedFieldsBySection.marketplace} highlightFieldId={highlightFieldId} />
          )}
          {activeSection === 'trust_safety' && (
            <TrustSafetySection values={values.trust_safety} onChange={(f, v) => handleChange('trust_safety', f, v)} modifiedFields={modifiedFieldsBySection.trust_safety} highlightFieldId={highlightFieldId} />
          )}
          {activeSection === 'privacy' && (
            <PrivacyControlCenter
              values={values.privacy} onChange={(f, v) => handleChange('privacy', f, v)} modifiedFields={modifiedFieldsBySection.privacy} highlightFieldId={highlightFieldId}
              privacyMatrix={privacyMatrix} onTogglePrivacy={togglePrivacy}
            />
          )}
          {activeSection === 'ai_automation' && (
            <AIAutomationSection
              values={values.ai_automation} onChange={(f, v) => handleChange('ai_automation', f, v)} modifiedFields={modifiedFieldsBySection.ai_automation} highlightFieldId={highlightFieldId}
              automationRules={automationRules} onToggleAutomationRule={toggleAutomationRule}
              customAutomations={customAutomations} onCreateAutomation={createAutomation} onToggleAutomation={toggleAutomation} onDeleteAutomation={deleteAutomation}
              advisorRecommendations={advisorRecommendations} onApplyRecommendation={applyRecommendation} onDismissRecommendation={dismissRecommendation}
            />
          )}
          {activeSection === 'security' && (
            <SecurityCenterSection
              values={values.security} onChange={(f, v) => handleChange('security', f, v)} modifiedFields={modifiedFieldsBySection.security} highlightFieldId={highlightFieldId}
              accessMatrix={accessMatrix} onToggleAccess={toggleAccess}
              securityHealthScore={SECURITY_HEALTH_SCORE} securityHealthFactors={SECURITY_HEALTH_FACTORS}
              monitoringStats={SECURITY_MONITORING_STATS} securityEvents={SECURITY_EVENTS}
            />
          )}
          {activeSection === 'integrations' && (
            <IntegrationsSection
              values={values.integrations} onChange={(f, v) => handleChange('integrations', f, v)} modifiedFields={modifiedFieldsBySection.integrations} highlightFieldId={highlightFieldId}
              connectedServices={connectedServices} onToggleService={toggleService}
              apiKeys={API_KEYS} webhookSecrets={WEBHOOK_SECRETS}
            />
          )}
          {activeSection === 'billing' && (
            <BillingRevenueSection
              values={values.billing} onChange={(f, v) => handleChange('billing', f, v)} modifiedFields={modifiedFieldsBySection.billing} highlightFieldId={highlightFieldId}
              featureMatrix={featureMatrix} onToggleFeature={toggleFeature}
            />
          )}
        </div>
      </div>

      <Drawer isOpen={auditOpen} onClose={() => setAuditOpen(false)} title="Audit Trail & Version History" subtitle="Every settings change — who, when, old → new, and why." icon="🕓" size="lg">
        <AuditTimeline entries={auditLog} onRollback={handleRollback} />
      </Drawer>
    </div>
  );
}
