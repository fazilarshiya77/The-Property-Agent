import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  LogOut,
  Building2,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAdminGuard, useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { supabase } from '../lib/supabase';
import { normalizePhoneNumber } from '../lib/phone';
import AdminLayout from '../components/admin/AdminLayout';

// ─── Shared section shell ────────────────────────────────
function SettingsSection({ icon: Icon, title, description, children }: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-display font-bold text-navy-900">{title}</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// Small inline status line shown under a field after Save is pressed.
function FieldStatus({ status, errorMessage }: { status: 'idle' | 'saving' | 'success' | 'error'; errorMessage?: string }) {
  if (status === 'saving') {
    return (
      <p className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </p>
    );
  }
  if (status === 'success') {
    return (
      <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2">
        <CheckCircle2 className="h-3.5 w-3.5" /> Saved
      </p>
    );
  }
  if (status === 'error') {
    return (
      <p className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
        <AlertCircle className="h-3.5 w-3.5" /> {errorMessage || 'Something went wrong. Please try again.'}
      </p>
    );
  }
  return null;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export default function AdminSettings() {
  const ready = useAdminGuard();
  const navigate = useNavigate();
  const session = useAuthStore(s => s.session);
  const { settings, loaded, fetchSettings, updateSettings } = useSettingsStore();

  useEffect(() => {
    if (ready) fetchSettings();
  }, [ready, fetchSettings]);

  // ── Business Information ──
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [businessEmail, setBusinessEmail] = useState(settings.businessEmail);
  const [businessStatus, setBusinessStatus] = useState<SaveStatus>('idle');

  // ── Call Number ──
  const [callNumberInput, setCallNumberInput] = useState(settings.callNumber);
  const [callStatus, setCallStatus] = useState<SaveStatus>('idle');
  const [callError, setCallError] = useState('');

  // ── WhatsApp Number ──
  const [whatsappNumberInput, setWhatsappNumberInput] = useState(settings.whatsappNumber);
  const [whatsappStatus, setWhatsappStatus] = useState<SaveStatus>('idle');
  const [whatsappError, setWhatsappError] = useState('');

  // Once the row loads from Supabase, sync the (still-untouched) form fields.
  useEffect(() => {
    if (!loaded) return;
    setBusinessName(settings.businessName);
    setBusinessEmail(settings.businessEmail);
    setCallNumberInput(settings.callNumber);
    setWhatsappNumberInput(settings.whatsappNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // ── Security: change password ──
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<SaveStatus>('idle');
  const [passwordError, setPasswordError] = useState('');

  if (!ready) return null;

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusinessStatus('saving');
    const { error } = await updateSettings({ businessName: businessName.trim(), businessEmail: businessEmail.trim() });
    setBusinessStatus(error ? 'error' : 'success');
    if (!error) setTimeout(() => setBusinessStatus('idle'), 3000);
  };

  const handleSaveCallNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhoneNumber(callNumberInput);
    if (!normalized) {
      setCallStatus('error');
      setCallError('Enter a valid phone number (e.g. +91 98765 43210).');
      return;
    }
    setCallStatus('saving');
    const { error } = await updateSettings({ callNumber: normalized });
    setCallNumberInput(normalized);
    setCallStatus(error ? 'error' : 'success');
    setCallError(error || '');
    if (!error) setTimeout(() => setCallStatus('idle'), 3000);
  };

  const handleSaveWhatsappNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhoneNumber(whatsappNumberInput);
    if (!normalized) {
      setWhatsappStatus('error');
      setWhatsappError('Enter a valid phone number (e.g. +91 98765 12345).');
      return;
    }
    setWhatsappStatus('saving');
    const { error } = await updateSettings({ whatsappNumber: normalized });
    setWhatsappNumberInput(normalized);
    setWhatsappStatus(error ? 'error' : 'success');
    setWhatsappError(error || '');
    if (!error) setTimeout(() => setWhatsappStatus('idle'), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordStatus('error');
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordStatus('saving');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus('error');
      setPasswordError(error.message);
      return;
    }
    setPasswordStatus('success');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus('idle'), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const inputClass = "w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm text-navy-900";
  const saveBtnClass = "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-navy-900 text-sm font-semibold transition-colors";

  return (
    <AdminLayout title="Settings" subtitle="Manage your admin account and public website contact details">
      <div className="mt-2 max-w-3xl space-y-6">
        {/* Admin Profile */}
        <SettingsSection icon={User} title="Admin Profile" description="Your signed-in admin account">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {(session?.user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-900 truncate">{session?.user?.email || 'Admin'}</p>
              <p className="text-xs text-neutral-500">Signed in</p>
            </div>
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection icon={Lock} title="Security" description="Change your password or log out of the admin CRM">
          <form onSubmit={handleChangePassword} className="space-y-4 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordStatus('idle'); }}
                    placeholder="At least 6 characters"
                    className={`${inputClass} pr-10`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordStatus('idle'); }}
                  placeholder="Re-enter new password"
                  className={inputClass}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={passwordStatus === 'saving' || !newPassword} className={saveBtnClass}>
                {passwordStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update Password
              </button>
              <FieldStatus status={passwordStatus} errorMessage={passwordError} />
            </div>
          </form>
          <div className="pt-4 border-t border-neutral-100">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4" /> Log Out
            </button>
          </div>
        </SettingsSection>

        {/* Business Information */}
        <SettingsSection icon={Building2} title="Business Information" description="Shown across the public website">
          <form onSubmit={handleSaveBusiness} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => { setBusinessName(e.target.value); setBusinessStatus('idle'); }}
                  className={inputClass}
                  placeholder="The Property Agent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => { setBusinessEmail(e.target.value); setBusinessStatus('idle'); }}
                    className={`${inputClass} pl-10`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={businessStatus === 'saving'} className={saveBtnClass}>
                {businessStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Changes
              </button>
              <FieldStatus status={businessStatus} />
            </div>
          </form>
        </SettingsSection>

        {/* Contact & Communication */}
        <SettingsSection
          icon={Phone}
          title="Contact & Communication"
          description="The numbers used by the Call and WhatsApp buttons across the public website"
        >
          <div className="space-y-6">
            {/* Call Number */}
            <form onSubmit={handleSaveCallNumber}>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Call Number</label>
              <p className="text-xs text-neutral-500 mb-2">
                Used by every "Call" button and CTA on the public website — header, footer, floating call button, property enquiry CTAs, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="tel"
                    value={callNumberInput}
                    onChange={(e) => { setCallNumberInput(e.target.value); setCallStatus('idle'); }}
                    className={`${inputClass} pl-10`}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <button type="submit" disabled={callStatus === 'saving'} className={`${saveBtnClass} flex-shrink-0`}>
                  {callStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
              <FieldStatus status={callStatus} errorMessage={callError} />
            </form>

            <div className="border-t border-neutral-100" />

            {/* WhatsApp Number */}
            <form onSubmit={handleSaveWhatsappNumber}>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
              <p className="text-xs text-neutral-500 mb-2">
                Used by every "WhatsApp" button and CTA on the public website — floating WhatsApp button, property enquiry CTAs, and more. Can be the same as the Call Number, or different.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="tel"
                    value={whatsappNumberInput}
                    onChange={(e) => { setWhatsappNumberInput(e.target.value); setWhatsappStatus('idle'); }}
                    className={`${inputClass} pl-10`}
                    placeholder="+91 98765 12345"
                  />
                </div>
                <button type="submit" disabled={whatsappStatus === 'saving'} className={`${saveBtnClass} flex-shrink-0`}>
                  {whatsappStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
              <FieldStatus status={whatsappStatus} errorMessage={whatsappError} />
            </form>
          </div>
        </SettingsSection>
      </div>
    </AdminLayout>
  );
}
