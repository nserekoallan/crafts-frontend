'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  baseRate: number | string;
  perKgRate: number | string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface ShippingZonesResponse {
  data: ShippingZone[];
}

interface ZoneFormState {
  name: string;
  regions: string;
  baseRate: string;
  perKgRate: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: ZoneFormState = {
  name: '',
  regions: '',
  baseRate: '',
  perKgRate: '0',
  sortOrder: '0',
  isActive: true,
};

// ---------------------------------------------------------------------------
// ZoneFormDialog
// ---------------------------------------------------------------------------

function ZoneFormDialog({
  initial,
  onSave,
  onClose,
  isPending,
  title,
}: {
  initial: ZoneFormState;
  onSave: (data: ZoneFormState) => void;
  onClose: () => void;
  isPending: boolean;
  title: string;
}) {
  const [form, setForm] = useState<ZoneFormState>(initial);

  function set(field: keyof ZoneFormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const inputCls =
    'w-full rounded-lg border border-border-dark bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border-dark bg-bg-elevated p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Zone Name</label>
            <input
              className={inputCls}
              placeholder="e.g. Kampala Metro"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Regions <span className="text-text-tertiary">(comma-separated, e.g. Kampala, Wakiso, Mukono)</span>
            </label>
            <input
              className={inputCls}
              placeholder="Kampala, Wakiso, Mukono"
              value={form.regions}
              onChange={(e) => set('regions', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Base Rate (UGX)</label>
              <input
                type="number"
                min="0"
                className={inputCls}
                placeholder="5000"
                value={form.baseRate}
                onChange={(e) => set('baseRate', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Per Kg Rate (UGX)</label>
              <input
                type="number"
                min="0"
                className={inputCls}
                placeholder="0"
                value={form.perKgRate}
                onChange={(e) => set('perKgRate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Sort Order</label>
              <input
                type="number"
                min="0"
                className={inputCls}
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', e.target.value)}
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="h-4 w-4 accent-gold"
                />
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border-dark py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={isPending || !form.name.trim() || !form.regions.trim() || !form.baseRate}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold py-2 text-sm font-bold text-bg-primary hover:bg-gold-light disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Zone
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminShippingPage() {
  const queryClient = useQueryClient();
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useQuery<ShippingZonesResponse>({
    queryKey: ['admin', 'shipping', 'zones'],
    queryFn: () => api.get<ShippingZonesResponse>('/admin/shipping/zones').then((r) => r),
  });

  const zones = data?.data ?? [];

  const { mutate: createZone, isPending: isCreating } = useMutation({
    mutationFn: (payload: object) => api.post('/admin/shipping/zones', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipping', 'zones'] });
      setDialogMode(null);
    },
  });

  const { mutate: updateZone, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: object }) =>
      api.patch(`/admin/shipping/zones/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipping', 'zones'] });
      setDialogMode(null);
      setEditingZone(null);
    },
  });

  const { mutate: deleteZone, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/shipping/zones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipping', 'zones'] });
      setDeleteConfirm(null);
    },
  });

  function formToPayload(form: ZoneFormState) {
    return {
      name: form.name.trim(),
      regions: form.regions
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
      baseRate: parseFloat(form.baseRate) || 0,
      perKgRate: parseFloat(form.perKgRate) || 0,
      sortOrder: parseInt(form.sortOrder) || 0,
      isActive: form.isActive,
    };
  }

  function zoneToFormState(zone: ShippingZone): ZoneFormState {
    return {
      name: zone.name,
      regions: zone.regions.join(', '),
      baseRate: String(zone.baseRate),
      perKgRate: String(zone.perKgRate),
      sortOrder: String(zone.sortOrder),
      isActive: zone.isActive,
    };
  }

  const handleSave = (form: ZoneFormState) => {
    const payload = formToPayload(form);
    if (dialogMode === 'create') {
      createZone(payload);
    } else if (dialogMode === 'edit' && editingZone) {
      updateZone({ id: editingZone.id, payload });
    }
  };

  const openEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setDialogMode('edit');
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Shipping Zones</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Configure delivery regions and rates
          </p>
        </div>
        <button
          onClick={() => setDialogMode('create')}
          className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-bold text-bg-primary hover:bg-gold-light"
        >
          <Plus className="h-4 w-4" />
          New Zone
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border-dark bg-bg-elevated">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : zones.length === 0 ? (
          <div className="p-12 text-center text-sm text-text-secondary">
            No shipping zones configured yet. Create one to get started.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-dark text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th className="px-5 py-3">Zone</th>
                <th className="px-5 py-3">Regions</th>
                <th className="px-5 py-3 text-right">Base Rate</th>
                <th className="px-5 py-3 text-right">Per Kg</th>
                <th className="px-5 py-3 text-center">Order</th>
                <th className="px-5 py-3 text-center">Active</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-medium text-text-primary">{zone.name}</td>
                  <td className="px-5 py-3 max-w-xs">
                    <span className="line-clamp-1 text-text-secondary">
                      {zone.regions.join(', ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-text-primary">
                    UGX {Number(zone.baseRate).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right text-text-secondary">
                    {Number(zone.perKgRate) > 0
                      ? `UGX ${Number(zone.perKgRate).toLocaleString()}`
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-center text-text-secondary">{zone.sortOrder}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border',
                        zone.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                          : 'bg-white/5 text-text-tertiary border-white/10',
                      )}
                    >
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(zone)}
                        className="rounded-lg border border-border-dark p-1.5 text-text-secondary hover:border-gold hover:text-gold"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {deleteConfirm === zone.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteZone(zone.id)}
                            disabled={isDeleting}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
                          >
                            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-lg border border-border-dark px-2 py-1 text-xs text-text-tertiary hover:text-text-primary"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(zone.id)}
                          className="rounded-lg border border-border-dark p-1.5 text-text-secondary hover:border-red-500/40 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(dialogMode === 'create' || (dialogMode === 'edit' && editingZone)) && (
        <ZoneFormDialog
          title={dialogMode === 'create' ? 'New Shipping Zone' : 'Edit Shipping Zone'}
          initial={dialogMode === 'edit' && editingZone ? zoneToFormState(editingZone) : EMPTY_FORM}
          onSave={handleSave}
          onClose={() => { setDialogMode(null); setEditingZone(null); }}
          isPending={isCreating || isUpdating}
        />
      )}
    </div>
  );
}
