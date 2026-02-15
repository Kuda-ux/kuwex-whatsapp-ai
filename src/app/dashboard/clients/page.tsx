'use client';

import { useEffect, useState } from 'react';
import { Plus, Building2, Phone, Mail, Check, X } from 'lucide-react';

interface Client {
  id: string;
  business_name: string;
  whatsapp_phone_number_id: string;
  brand_tone: string;
  services_description: string;
  default_language: string;
  escalation_email: string;
  escalation_whatsapp: string;
  is_active: boolean;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    whatsapp_phone_number_id: '',
    whatsapp_access_token: '',
    brand_tone: 'professional and friendly',
    services_description: '',
    escalation_email: '',
    escalation_whatsapp: '',
  });

  const loadClients = () => {
    fetch('/api/dashboard/clients')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClients(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadClients(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({
          business_name: '',
          whatsapp_phone_number_id: '',
          whatsapp_access_token: '',
          brand_tone: 'professional and friendly',
          services_description: '',
          escalation_email: '',
          escalation_whatsapp: '',
        });
        loadClients();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage businesses connected to the platform</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Add Client Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Client</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'business_name', label: 'Business Name', placeholder: 'Acme Digital Agency', required: true },
              { key: 'whatsapp_phone_number_id', label: 'WhatsApp Phone Number ID', placeholder: 'From Meta Developer Console', required: true },
              { key: 'whatsapp_access_token', label: 'WhatsApp Access Token', placeholder: 'Bearer token from Meta', required: true },
              { key: 'brand_tone', label: 'Brand Tone', placeholder: 'professional and friendly' },
              { key: 'escalation_email', label: 'Escalation Email', placeholder: 'admin@business.co.zw' },
              { key: 'escalation_whatsapp', label: 'Escalation WhatsApp', placeholder: '+263771234567' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  required={field.required}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Services Description</label>
              <textarea
                placeholder="Describe the services and pricing this business offers..."
                rows={3}
                value={form.services_description}
                onChange={(e) => setForm({ ...form, services_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Client'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Client Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-60 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-48" />
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No clients yet</h3>
          <p className="text-gray-400 text-sm">Add your first business client to start processing WhatsApp messages.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.business_name}</h3>
                    <p className="text-xs text-gray-400">ID: {client.whatsapp_phone_number_id}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  client.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {client.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {client.services_description || 'No services description set'}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                {client.escalation_email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {client.escalation_email}
                  </span>
                )}
                {client.escalation_whatsapp && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {client.escalation_whatsapp}
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Tone: <span className="text-gray-600">{client.brand_tone}</span>
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(client.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
