import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  X,
  ShieldCheck,
  GraduationCap,
  Award,
  Leaf,
  Heart,
  BookOpen,
} from 'lucide-react';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';
import { DEFAULT_SERVICES, ServiceItem } from '../../constants/defaultData';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import ImageUpload from '../../components/admin/ImageUpload';

const ICON_OPTIONS = [
  { value: 'ShieldCheck', label: 'ShieldCheck', Icon: ShieldCheck },
  { value: 'GraduationCap', label: 'GraduationCap', Icon: GraduationCap },
  { value: 'Award', label: 'Award', Icon: Award },
  { value: 'Leaf', label: 'Leaf', Icon: Leaf },
  { value: 'Heart', label: 'Heart', Icon: Heart },
  { value: 'BookOpen', label: 'BookOpen', Icon: BookOpen },
];

export default function AdminServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [restoring, setRestoring] = useState(false);

  const [form, setForm] = useState({
    title: '',
    icon: 'ShieldCheck',
    position: 1,
    image: '',
    description: '',
    features: [''],
  });

  useEffect(() => {
    const path = `sites/${siteId}/services`;
    const q = query(collection(db, 'sites', siteId, 'services'), orderBy('position', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ServiceItem, 'id'>),
        }));
        setServices(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, path)
    );
    return () => unsub();
  }, []);

  const handleRestoreOriginals = async () => {
    setRestoring(true);
    const path = `sites/${siteId}/services`;
    try {
      const batch = writeBatch(db);
      DEFAULT_SERVICES.forEach((srv) => {
        batch.set(doc(db, 'sites', siteId, 'services', srv.id), {
          title: srv.title,
          description: srv.description,
          icon: srv.icon,
          image: srv.image,
          features: srv.features,
          position: srv.position,
        });
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setRestoring(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      title: '',
      icon: 'ShieldCheck',
      position: services.length + 1,
      image: '',
      description: '',
      features: [''],
    });
    setModalOpen(true);
  };

  const openEdit = (srv: ServiceItem) => {
    setEditing(srv);
    setForm({
      title: srv.title,
      icon: srv.icon || 'ShieldCheck',
      position: srv.position || 1,
      image: srv.image || '',
      description: srv.description,
      features: srv.features && srv.features.length > 0 ? [...srv.features] : [''],
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFeatures = form.features.map((f) => f.trim()).filter(Boolean);
    const payload = {
      title: form.title.trim(),
      icon: form.icon,
      position: Number(form.position) || 1,
      image: form.image.trim(),
      description: form.description.trim(),
      features: cleanFeatures,
    };
    const path = `sites/${siteId}/services`;
    try {
      if (editing) {
        await updateDoc(doc(db, 'sites', siteId, 'services', editing.id), payload);
      } else {
        await addDoc(collection(db, 'sites', siteId, 'services'), payload);
      }
      setModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, editing ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const path = `sites/${siteId}/services/${deleteTarget.id}`;
    try {
      await deleteDoc(doc(db, 'sites', siteId, 'services', deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-stone-600">
          Manage showroom consultations, luthier repairs, and acoustic installations.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRestoreOriginals}
            disabled={restoring}
            className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-lime-600" />
            {restoring ? 'Restoring...' : 'Restore Originals'}
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-xs font-bold uppercase text-stone-500">
              <th className="py-3.5 px-5">Pos</th>
              <th className="py-3.5 px-5">Icon</th>
              <th className="py-3.5 px-5">Title</th>
              <th className="py-3.5 px-5">Features</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {services.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-stone-400">
                  No services stored in Firestore yet. Click "Restore Originals" or "Add Service".
                </td>
              </tr>
            ) : (
              services.map((srv) => {
                const iconDef =
                  ICON_OPTIONS.find((o) => o.value === srv.icon) || ICON_OPTIONS[0];
                const IconComp = iconDef.Icon;
                return (
                  <tr key={srv.id} className="hover:bg-stone-50/70">
                    <td className="py-4 px-5 font-mono text-xs tabular-nums">
                      {srv.position}
                    </td>
                    <td className="py-4 px-5">
                      <div className="w-9 h-9 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-stone-900">{srv.title}</td>
                    <td className="py-4 px-5 text-stone-600 tabular-nums">
                      {srv.features?.length || 0} bullet points
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(srv)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-lime-50 hover:text-lime-700 px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(srv)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Edit Service' : 'Add Service'}</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Service Title
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Icon</label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                  >
                    {ICON_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Position
                  </label>
                  <input
                    type="number"
                    required
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <ImageUpload
                label="Service Image"
                folder="services"
                aspect={16 / 9}
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700">
                    Feature Bullet Points
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, features: [...form.features, ''] })
                    }
                    className="text-xs font-bold text-lime-600 hover:underline cursor-pointer"
                  >
                    + Add Feature
                  </button>
                </div>
                {form.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const next = [...form.features];
                        next[idx] = e.target.value;
                        setForm({ ...form, features: next });
                      }}
                      placeholder="Feature bullet..."
                      className="flex-1 rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          features: form.features.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-red-500 hover:text-red-700 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-sm font-bold bg-lime-600 hover:bg-lime-700 text-white cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900">Delete Service?</h3>
            <p className="text-sm text-stone-600">
              Delete <strong>{deleteTarget.title}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
