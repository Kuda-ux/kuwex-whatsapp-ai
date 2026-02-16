'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Building2, Phone, Mail, Check, X, HelpCircle, ExternalLink, ChevronDown, ChevronUp, Pencil, Trash2, Power, Save, RefreshCw } from 'lucide-react';

interface Client {
  id: string;
  business_name: string;
  whatsapp_phone_number_id: string;
  whatsapp_access_token?: string;
  brand_tone: string;
  services_description: string;
  default_language: string;
  escalation_email: string;
  escalation_whatsapp: string;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  business_name: '',
  whatsapp_phone_number_id: '',
  whatsapp_access_token: '',
  brand_tone: 'professional and friendly',
  services_description: '',
  escalation_email: '',
  escalation_whatsapp: '',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadClients = useCallback(() => {
    fetch('/api/dashboard/clients')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClients(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setSaveError('');
    setSaveSuccess('');
  };

  const startEdit = (client: Client) => {
    setEditingId(client.id);
    setForm({
      business_name: client.business_name,
      whatsapp_phone_number_id: client.whatsapp_phone_number_id,
      whatsapp_access_token: '',
      brand_tone: client.brand_tone || 'professional and friendly',
      services_description: client.services_description || '',
      escalation_email: client.escalation_email || '',
      escalation_whatsapp: client.escalation_whatsapp || '',
    });
    setShowForm(true);
    setSaveError('');
    setSaveSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      if (editingId) {
        const payload: Record<string, unknown> = { id: editingId, ...form };
        if (!form.whatsapp_access_token) delete payload.whatsapp_access_token;

        const res = await fetch('/api/dashboard/clients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSaveSuccess('Client updated successfully!');
          loadClients();
          setTimeout(resetForm, 1200);
        } else {
          const err = await res.json();
          setSaveError(err.error || 'Failed to update client');
        }
      } else {
        const res = await fetch('/api/dashboard/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setSaveSuccess('Client created! AI will now respond to their WhatsApp messages.');
          loadClients();
          setTimeout(resetForm, 1200);
        } else {
          const err = await res.json();
          setSaveError(err.error || 'Failed to create client');
        }
      }
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/clients?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== id));
        setDeleteConfirm(null);
      }
    } catch {
      console.error('Delete failed');
    }
  };

  const toggleActive = async (client: Client) => {
    try {
      const res = await fetch('/api/dashboard/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id, is_active: !client.is_active }),
      });
      if (res.ok) loadClients();
    } catch {
      console.error('Toggle failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">Manage businesses connected to the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadClients}
            className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>

      {/* How to Get Credentials Guide */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-blue-900">How to get WhatsApp Phone Number ID &amp; Access Token</span>
            </div>
            {showGuide ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-blue-500" />}
          </button>

          {showGuide && (
            <div className="mt-4 space-y-4 text-sm text-blue-800">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2">Step 1: Go to Meta Developer Console</h4>
                <p className="mb-2">Open <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline inline-flex items-center gap-1">developers.facebook.com <ExternalLink className="w-3 h-3" /></a> and log in.</p>
                <p>Click <strong>&quot;Create App&quot;</strong> &rarr; select <strong>&quot;Business&quot;</strong> type &rarr; name it after the business.</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2">Step 2: Add WhatsApp Product</h4>
                <p>In your app dashboard, scroll to <strong>&quot;Add Products&quot;</strong> and click <strong>&quot;Set Up&quot;</strong> on <strong>WhatsApp</strong>.</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2">Step 3: Get Phone Number ID</h4>
                <p className="mb-2">Go to <strong>WhatsApp &rarr; API Setup</strong>. Select your phone number from the <strong>&quot;From&quot;</strong> dropdown.</p>
                <p className="mb-2">The <strong>Phone Number ID</strong> is displayed right below. <strong>Do NOT use the test number (+1 555...)</strong> &mdash; use your real business number.</p>
                <p className="bg-blue-50 p-2 rounded font-mono text-xs">Example: 977956835404682</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2">Step 4: Generate Access Token</h4>
                <p className="mb-2 text-orange-700 font-medium">For production, create a <strong>Permanent Token</strong>:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to <strong>Business Settings</strong> &rarr; <strong>System Users</strong></li>
                  <li>Create a system user (Admin role)</li>
                  <li>Click <strong>&quot;Generate New Token&quot;</strong></li>
                  <li>Select your app, add: <code className="bg-blue-50 px-1 rounded">whatsapp_business_messaging</code>, <code className="bg-blue-50 px-1 rounded">whatsapp_business_management</code></li>
                  <li>Copy the token</li>
                </ol>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2">Step 5: Configure Webhook</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to <strong>WhatsApp &rarr; Configuration</strong></li>
                  <li>Callback URL: <code className="bg-blue-50 px-1 rounded text-xs">https://YOUR-VERCEL-URL.vercel.app/api/webhook/whatsapp</code></li>
                  <li>Verify Token: <code className="bg-blue-50 px-1 rounded text-xs">kuwex-wa-verify-2024</code></li>
                  <li>Subscribe to <strong>&quot;messages&quot;</strong></li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Client Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {editingId ? 'Edit Client' : 'New Client'}
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            {editingId ? 'Update the client details. Leave Access Token blank to keep the existing one.' : 'Fill in the business details below.'}
          </p>

          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{saveError}</div>
          )}
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{saveSuccess}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name <span className="text-red-400">*</span></label>
              <input type="text" placeholder="e.g. Kuwex Studios" required value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone Number ID <span className="text-red-400">*</span></label>
              <input type="text" placeholder="e.g. 977956835404682" required value={form.whatsapp_phone_number_id}
                onChange={(e) => setForm({ ...form, whatsapp_phone_number_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <p className="text-xs text-gray-400 mt-1">Use your REAL business number ID, not the Meta test number</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Access Token {!editingId && <span className="text-red-400">*</span>}
              </label>
              <input type="password" placeholder={editingId ? 'Leave blank to keep current token' : 'Paste the access token'}
                required={!editingId} value={form.whatsapp_access_token}
                onChange={(e) => setForm({ ...form, whatsapp_access_token: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Tone</label>
              <select value={form.brand_tone} onChange={(e) => setForm({ ...form, brand_tone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="professional and friendly">Professional &amp; Friendly</option>
                <option value="casual and fun">Casual &amp; Fun</option>
                <option value="formal and corporate">Formal &amp; Corporate</option>
                <option value="warm and empathetic">Warm &amp; Empathetic</option>
                <option value="energetic and enthusiastic">Energetic &amp; Enthusiastic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escalation Email</label>
              <input type="email" placeholder="admin@business.co.zw" value={form.escalation_email}
                onChange={(e) => setForm({ ...form, escalation_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escalation WhatsApp</label>
              <input type="text" placeholder="+263771234567" value={form.escalation_whatsapp}
                onChange={(e) => setForm({ ...form, escalation_whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Services Description</label>
              <textarea placeholder="Describe services, pricing, hours, location, FAQs..." rows={4}
                value={form.services_description}
                onChange={(e) => setForm({ ...form, services_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <p className="text-xs text-gray-400 mt-1">The more detail you provide, the better the AI responds.</p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : editingId ? 'Update Client' : 'Create Client'}
            </button>
            <button type="button" onClick={resetForm}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Client Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-60 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-48" />
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No clients yet</h3>
          <p className="text-gray-400 text-sm mb-4">Add your first business client to start processing WhatsApp messages.</p>
          <button onClick={() => { setShowForm(true); setShowGuide(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Your First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {clients.map((client) => (
            <div key={client.id} className={`bg-white rounded-2xl border p-4 sm:p-6 transition-all hover:shadow-lg hover:shadow-gray-100/50 ${
              !client.is_active ? 'border-gray-200 opacity-70' : 'border-gray-100'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    client.is_active ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Building2 className={`w-5 h-5 ${client.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.business_name}</h3>
                    <p className="text-xs text-gray-400 font-mono">ID: {client.whatsapp_phone_number_id}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  client.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {client.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {client.services_description || 'No services description set'}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                {client.escalation_email && (
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.escalation_email}</span>
                )}
                {client.escalation_whatsapp && (
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.escalation_whatsapp}</span>
                )}
              </div>

              <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Tone: <span className="text-gray-600 capitalize">{client.brand_tone}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(client)} title={client.is_active ? 'Deactivate' : 'Activate'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      client.is_active ? 'hover:bg-orange-50 text-orange-500' : 'hover:bg-green-50 text-green-500'
                    }`}>
                    <Power className="w-4 h-4" />
                  </button>
                  <button onClick={() => startEdit(client)} title="Edit client"
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {deleteConfirm === client.id ? (
                    <div className="flex items-center gap-1 ml-1">
                      <button onClick={() => handleDelete(client.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600">
                        Confirm
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200">
                        No
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(client.id)} title="Delete client"
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
