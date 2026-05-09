import { useState, useRef } from 'react';
import {
  User, Store, Mail, Phone, Camera, CreditCard,
  ChevronRight, CheckCircle, AlertCircle, Clock,
  Edit2, X, Save, Upload, ArrowLeft, Eye, EyeOff,
  Shield, FileText, Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSeller } from '@/contexts/SellerContext';
import Header from './Header';

type Tab = 'profile' | 'bank';
type FieldState = 'view' | 'edit' | 'otp' | 'saving' | 'saved' | 'error';
type BankStatus = 'none' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

interface ProfileField {
  state: FieldState;
  value: string;
  draft: string;
  otp: string;
  error: string;
}

interface BankSubmission {
  status: BankStatus;
  rejectionReason?: string;
  submittedAt?: string;
  accountTitle: string;
  bankName: string;
  iban: string;
  country: string;
  accountType: string;
  documentName?: string;
}

const COUNTRIES = [
  'Pakistan', 'United Kingdom', 'United States / Canada', 'India',
  'United Arab Emirates', 'Germany', 'France', 'Netherlands',
  'Australia', 'Saudi Arabia', 'Other',
];

const ACCOUNT_TYPES = ['Personal', 'Business'];

const STATUS_CONFIG: Record<BankStatus, { label: string; color: string; icon: React.ReactNode }> = {
  none:         { label: 'Not submitted', color: 'text-gray-400', icon: <Clock className="w-4 h-4" /> },
  draft:        { label: 'Draft',         color: 'text-gray-400', icon: <Edit2 className="w-4 h-4" /> },
  submitted:    { label: 'Submitted',     color: 'text-blue-400', icon: <CheckCircle className="w-4 h-4" /> },
  under_review: { label: 'Under Review',  color: 'text-yellow-400', icon: <Clock className="w-4 h-4" /> },
  approved:     { label: 'Approved',      color: 'text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
  rejected:     { label: 'Rejected',      color: 'text-red-400',   icon: <AlertCircle className="w-4 h-4" /> },
};

function initField(value: string): ProfileField {
  return { state: 'view', value, draft: value, otp: '', error: '' };
}

function FieldRow({
  icon,
  label,
  field,
  requiresOtp = false,
  type = 'text',
  onEdit,
  onDraftChange,
  onSave,
  onOtpChange,
  onOtpConfirm,
  onCancel,
}: {
  icon: React.ReactNode;
  label: string;
  field: ProfileField;
  requiresOtp?: boolean;
  type?: string;
  onEdit: () => void;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onOtpChange: (v: string) => void;
  onOtpConfirm: () => void;
  onCancel: () => void;
}) {
  const isEditing = field.state === 'edit' || field.state === 'otp' || field.state === 'saving';

  return (
    <div className="py-5 border-b border-fleek-gray-800 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="text-gray-400 flex-shrink-0">{icon}</div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>

            {field.state === 'view' || field.state === 'saved' ? (
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium truncate">
                  {field.value || <span className="text-gray-500 italic">Not set</span>}
                </span>
                {field.state === 'saved' && (
                  <span className="text-green-400 text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>
            ) : field.state === 'edit' ? (
              <div className="mt-1">
                <input
                  type={type}
                  value={field.draft}
                  onChange={e => onDraftChange(e.target.value)}
                  className="w-full bg-fleek-gray-800 border border-fleek-gray-700 rounded-lg px-3 py-2
                             text-white text-sm focus:outline-none focus:border-fleek-yellow transition-colors"
                  autoFocus
                />
                {field.error && (
                  <p className="text-red-400 text-xs mt-1">{field.error}</p>
                )}
              </div>
            ) : field.state === 'otp' ? (
              <div className="mt-1 space-y-2">
                <p className="text-gray-400 text-xs">
                  A verification code has been sent to <strong className="text-white">{field.draft}</strong>
                </p>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={field.otp}
                  onChange={e => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-40 bg-fleek-gray-800 border border-fleek-gray-700 rounded-lg px-3 py-2
                             text-white text-sm tracking-widest focus:outline-none focus:border-fleek-yellow transition-colors"
                  autoFocus
                />
                {field.error && (
                  <p className="text-red-400 text-xs">{field.error}</p>
                )}
              </div>
            ) : field.state === 'saving' ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fleek-yellow" />
                <span className="text-gray-400 text-sm">Saving…</span>
              </div>
            ) : field.state === 'error' ? (
              <div className="mt-1">
                <span className="text-red-400 text-sm">{field.error || 'An error occurred'}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-fleek-yellow hover:bg-fleek-gray-800
                         rounded-lg transition-colors"
              title={`Edit ${label}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <>
              {field.state === 'edit' && (
                <button
                  onClick={onSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-fleek-yellow text-fleek-black
                             rounded-lg text-xs font-semibold hover:bg-yellow-300 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {requiresOtp ? 'Send Code' : 'Save'}
                </button>
              )}
              {field.state === 'otp' && (
                <button
                  onClick={onOtpConfirm}
                  disabled={field.otp.length !== 6}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-fleek-yellow text-fleek-black
                             rounded-lg text-xs font-semibold hover:bg-yellow-300 transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Confirm
                </button>
              )}
              <button
                onClick={onCancel}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-fleek-gray-800
                           rounded-lg transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SellerProfileManager() {
  const { supplierHandle, supplierEmail } = useAuth();
  const { sellerId } = useSeller();
  const fileRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile picture
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Profile fields
  const [fields, setFields] = useState({
    shopName:  initField(supplierHandle || ''),
    bio:       initField(''),
    email:     initField(supplierEmail || ''),
    phone:     initField(''),
  });

  // Bank account
  const [bank, setBank] = useState<BankSubmission>({
    status: 'none',
    accountTitle: '',
    bankName: '',
    iban: '',
    country: '',
    accountType: '',
  });
  const [bankDocFile, setBankDocFile] = useState<File | null>(null);
  const [bankErrors, setBankErrors] = useState<Record<string, string>>({});
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [showIban, setShowIban] = useState(false);

  // ── Field helpers ──────────────────────────────────────────────────────────
  function updateField(key: keyof typeof fields, patch: Partial<ProfileField>) {
    setFields(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function handleEdit(key: keyof typeof fields) {
    updateField(key, { state: 'edit', draft: fields[key].value, error: '' });
  }

  function handleCancel(key: keyof typeof fields) {
    updateField(key, { state: 'view', draft: fields[key].value, error: '' });
  }

  function handleDraftChange(key: keyof typeof fields, value: string) {
    updateField(key, { draft: value });
  }

  function handleSave(key: keyof typeof fields, requiresOtp: boolean) {
    const f = fields[key];
    if (!f.draft.trim()) {
      updateField(key, { error: 'This field cannot be empty' });
      return;
    }
    if (requiresOtp) {
      // Simulate sending OTP
      updateField(key, { state: 'otp', otp: '', error: '' });
    } else {
      // Direct save (no OTP needed)
      simulateSave(key, f.draft);
    }
  }

  function simulateSave(key: keyof typeof fields, newValue: string) {
    updateField(key, { state: 'saving' });
    setTimeout(() => {
      updateField(key, { state: 'saved', value: newValue });
      setTimeout(() => updateField(key, { state: 'view' }), 2500);
    }, 900);
  }

  function handleOtpChange(key: keyof typeof fields, otp: string) {
    updateField(key, { otp });
  }

  function handleOtpConfirm(key: keyof typeof fields) {
    const f = fields[key];
    if (f.otp.length !== 6) return;
    // Simulate OTP verification
    updateField(key, { state: 'saving' });
    setTimeout(() => {
      if (f.otp === '000000') {
        // Simulate wrong OTP for demo
        updateField(key, { state: 'otp', error: 'Incorrect code. Please try again.' });
      } else {
        updateField(key, { state: 'saved', value: f.draft });
        setTimeout(() => updateField(key, { state: 'view' }), 2500);
      }
    }, 900);
  }

  // ── Profile picture ────────────────────────────────────────────────────────
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        setAvatarUrl(reader.result as string);
        setAvatarUploading(false);
      }, 800);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // ── Bank validation ────────────────────────────────────────────────────────
  function validateBank(): boolean {
    const errs: Record<string, string> = {};
    if (!bank.accountTitle.trim()) errs.accountTitle = 'Required';
    if (!bank.bankName.trim())     errs.bankName     = 'Required';
    if (!bank.iban.trim())         errs.iban         = 'Required';
    if (!bank.country)             errs.country      = 'Required';
    if (!bank.accountType)         errs.accountType  = 'Required';
    if (!bankDocFile)              errs.document     = 'A supporting document is required (CNIC, bank statement, etc.)';
    setBankErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleBankSubmit() {
    if (!validateBank()) return;
    setBankSubmitting(true);
    setTimeout(() => {
      setBank(prev => ({
        ...prev,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        documentName: bankDocFile?.name,
      }));
      setBankSubmitting(false);
    }, 1200);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const bankStatus = STATUS_CONFIG[bank.status];
  const initials = (supplierHandle || 'S').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-fleek-black">
      <Header sellerId={supplierHandle || ''} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your store profile and payment details
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-fleek-gray-900 rounded-xl p-1 border border-fleek-gray-800">
          {([
            { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
            { id: 'bank',    label: 'Account & Payments', icon: <CreditCard className="w-4 h-4" /> },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                          text-sm font-medium transition-all
                          ${activeTab === tab.id
                            ? 'bg-fleek-yellow text-fleek-black shadow'
                            : 'text-gray-400 hover:text-white'
                          }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Avatar card */}
            <div className="bg-fleek-gray-900 border border-fleek-gray-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                Profile Picture
              </h2>
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-fleek-yellow"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-fleek-yellow flex items-center justify-center
                                    text-fleek-black text-2xl font-bold border-2 border-fleek-yellow">
                      {initials}
                    </div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium mb-1">{supplierHandle || 'Your Store'}</p>
                  <p className="text-gray-400 text-xs mb-3">JPG, PNG or GIF · Max 5MB</p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={avatarUploading}
                    className="flex items-center gap-2 px-4 py-2 border border-fleek-gray-700
                               text-gray-300 rounded-lg text-sm hover:border-fleek-yellow
                               hover:text-fleek-yellow transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    {avatarUploading ? 'Uploading…' : 'Change Photo'}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
            </div>

            {/* Profile details card */}
            <div className="bg-fleek-gray-900 border border-fleek-gray-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Store Information
              </h2>

              <FieldRow
                icon={<Store className="w-4 h-4" />}
                label="Shop Name"
                field={fields.shopName}
                onEdit={() => handleEdit('shopName')}
                onDraftChange={v => handleDraftChange('shopName', v)}
                onSave={() => handleSave('shopName', false)}
                onOtpChange={v => handleOtpChange('shopName', v)}
                onOtpConfirm={() => handleOtpConfirm('shopName')}
                onCancel={() => handleCancel('shopName')}
              />

              <FieldRow
                icon={<FileText className="w-4 h-4" />}
                label="Bio / Store Description"
                field={fields.bio}
                onEdit={() => handleEdit('bio')}
                onDraftChange={v => handleDraftChange('bio', v)}
                onSave={() => handleSave('bio', false)}
                onOtpChange={v => handleOtpChange('bio', v)}
                onOtpConfirm={() => handleOtpConfirm('bio')}
                onCancel={() => handleCancel('bio')}
              />
            </div>

            {/* Contact details card */}
            <div className="bg-fleek-gray-900 border border-fleek-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Contact Details
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  Verified via OTP
                </div>
              </div>

              <FieldRow
                icon={<Mail className="w-4 h-4" />}
                label="Email Address"
                field={fields.email}
                requiresOtp
                type="email"
                onEdit={() => handleEdit('email')}
                onDraftChange={v => handleDraftChange('email', v)}
                onSave={() => handleSave('email', true)}
                onOtpChange={v => handleOtpChange('email', v)}
                onOtpConfirm={() => handleOtpConfirm('email')}
                onCancel={() => handleCancel('email')}
              />

              <FieldRow
                icon={<Phone className="w-4 h-4" />}
                label="Phone Number"
                field={fields.phone}
                requiresOtp
                type="tel"
                onEdit={() => handleEdit('phone')}
                onDraftChange={v => handleDraftChange('phone', v)}
                onSave={() => handleSave('phone', true)}
                onOtpChange={v => handleOtpChange('phone', v)}
                onOtpConfirm={() => handleOtpConfirm('phone')}
                onCancel={() => handleCancel('phone')}
              />
            </div>
          </div>
        )}

        {/* ── BANK TAB ── */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            {/* Status banner */}
            {bank.status !== 'none' && (
              <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border
                ${bank.status === 'approved'  ? 'bg-green-950/40 border-green-800' :
                  bank.status === 'rejected'  ? 'bg-red-950/40 border-red-800' :
                  bank.status === 'under_review' ? 'bg-yellow-950/40 border-yellow-800' :
                  'bg-blue-950/40 border-blue-800'}`}
              >
                <span className={bankStatus.color}>{bankStatus.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${bankStatus.color}`}>{bankStatus.label}</p>
                  {bank.submittedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Submitted {new Date(bank.submittedAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  )}
                  {bank.status === 'rejected' && bank.rejectionReason && (
                    <p className="text-xs text-red-300 mt-1">Reason: {bank.rejectionReason}</p>
                  )}
                </div>
              </div>
            )}

            {/* Bank form */}
            <div className="bg-fleek-gray-900 border border-fleek-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-fleek-yellow" />
                <h2 className="text-base font-semibold text-white">Bank Account Details</h2>
              </div>

              {bank.status === 'approved' ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-medium">Bank account approved</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Your bank details are active and payments will be sent to this account.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Account Title */}
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                      Account Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={bank.accountTitle}
                      onChange={e => setBank(p => ({ ...p, accountTitle: e.target.value }))}
                      placeholder="e.g. John Smith or Company Ltd"
                      disabled={bank.status === 'submitted' || bank.status === 'under_review'}
                      className="w-full bg-fleek-gray-800 border border-fleek-gray-700 rounded-lg px-3 py-2.5
                                 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-fleek-yellow
                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {bankErrors.accountTitle && (
                      <p className="text-red-400 text-xs mt-1">{bankErrors.accountTitle}</p>
                    )}
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                      Bank Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={bank.bankName}
                      onChange={e => setBank(p => ({ ...p, bankName: e.target.value }))}
                      placeholder="e.g. Habib Bank, Barclays, Chase"
                      disabled={bank.status === 'submitted' || bank.status === 'under_review'}
                      className="w-full bg-fleek-gray-800 border border-fleek-gray-700 rounded-lg px-3 py-2.5
                                 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-fleek-yellow
                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {bankErrors.bankName && (
                      <p className="text-red-400 text-xs mt-1">{bankErrors.bankName}</p>
                    )}
                  </div>

                  {/* Country + Account Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                        Country <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={bank.country}
                        onChange={e => setBank(p => ({ ...p, country: e.target.value }))}
                        disabled={bank.status === 'submitted' || bank.status === 'under_review'}
                        className="w-full bg-fleek-gray-800 border border-fleek-gray-700 rounded-lg px-3 py-2.5
                                   text-white text-sm focus:outline-none focus:border-fleek-yellow
                                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {bankErrors.country && (
                        <p className="text-red-400 text-xs mt-1">{bankErrors.country}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                        Account Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={bank.accountType}
                        onChange={e => setBank(p => ({ ...p, accountType: e.target.value }))}
                        disabled={bank.status === 'submitted' || bank.status === 'under_review'}
                        className="w-full bg-fleek-gray-800 border border-fleek-gray-700 rounded-lg px-3 py-2.5
                                   text-white text-sm focus:outline-none focus:border-fleek-yellow
                                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select type</option>
                        {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {bankErrors.accountType && (
                        <p className="text-red-400 text-xs mt-1">{bankErrors.accountType}</p>
                      )}
                    </div>
                  </div>

                  {/* IBAN / Account Number */}
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                      IBAN / Account Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showIban ? 'text' : 'password'}
                        value={bank.iban}
                        onChange={e => setBank(p => ({ ...p, iban: e.target.value.toUpperCase() }))}
                        placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
                        disabled={bank.status === 'submitted' || bank.status === 'under_review'}
                        className="w-full bg-fleek-gray-800 border border-fleek-gray-700 rounded-lg px-3 py-2.5
                                   pr-10 text-white text-sm placeholder-gray-500 font-mono
                                   focus:outline-none focus:border-fleek-yellow transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowIban(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showIban ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {bankErrors.iban && (
                      <p className="text-red-400 text-xs mt-1">{bankErrors.iban}</p>
                    )}
                  </div>

                  {/* Supporting Document */}
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                      Supporting Document <span className="text-red-400">*</span>
                    </label>
                    <p className="text-gray-500 text-xs mb-2">
                      Upload a bank statement, CNIC, or other proof of account ownership
                    </p>

                    {bankDocFile ? (
                      <div className="flex items-center gap-3 px-4 py-3 bg-fleek-gray-800
                                      border border-green-800 rounded-lg">
                        <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-green-300 text-sm truncate">{bankDocFile.name}</span>
                        {bank.status !== 'submitted' && bank.status !== 'under_review' && (
                          <button
                            onClick={() => setBankDocFile(null)}
                            className="ml-auto text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center gap-2 px-4 py-6
                                        border-2 border-dashed border-fleek-gray-700 rounded-lg
                                        hover:border-fleek-yellow transition-colors cursor-pointer
                                        ${bank.status === 'submitted' || bank.status === 'under_review'
                                          ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-400 text-sm">Click to upload</span>
                        <span className="text-gray-500 text-xs">PDF, JPG, PNG · Max 10MB</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={e => setBankDocFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    )}
                    {bankErrors.document && (
                      <p className="text-red-400 text-xs mt-1">{bankErrors.document}</p>
                    )}
                  </div>

                  {/* Submit */}
                  {bank.status !== 'submitted' && bank.status !== 'under_review' && (
                    <div className="pt-2">
                      <button
                        onClick={handleBankSubmit}
                        disabled={bankSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-fleek-yellow
                                   text-fleek-black font-semibold rounded-xl text-sm
                                   hover:bg-yellow-300 transition-colors disabled:opacity-50
                                   disabled:cursor-not-allowed"
                      >
                        {bankSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fleek-black" />
                            Submitting…
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Submit for Review
                          </>
                        )}
                      </button>
                      <p className="text-center text-gray-500 text-xs mt-3">
                        Your submission will be reviewed by the Seller Support team within 48 hours.
                      </p>
                    </div>
                  )}

                  {(bank.status === 'submitted' || bank.status === 'under_review') && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-yellow-950/30
                                    border border-yellow-900 rounded-xl">
                      <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-yellow-300 text-xs">
                        Your submission is under review. You'll be notified once a decision is made.
                        Need help? Contact Seller Support.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
