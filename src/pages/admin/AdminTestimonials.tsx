import React, { useState, useEffect, useMemo } from 'react';
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
import { Plus, Search, Edit2, Trash2, X, RotateCcw } from 'lucide-react';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';
import { DEFAULT_TESTIMONIALS, TestimonialItem } from '../../constants/defaultData';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null);

  const [form, setForm] = useState({
    position: 1,
    author: '',
    location: '',
    text: '',
  });

  useEffect(() => {
    const path = `sites/${siteId}/testimonials`;
    const q = query(
      collection(db, 'sites', siteId, 'testimonials'),
      orderBy('position', 'asc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<TestimonialItem, 'id'>),
        }));
        setTestimonials(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, path)
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return testimonials.filter(
      (t) =>
        t.author.toLowerCase().includes(term) ||
        t.location.toLowerCase().includes(term) ||
        t.text.toLowerCase().includes(term)
    );
  }, [testimonials, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      position: testimonials.length + 1,
      author: '',
      location: '',
      text: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item: TestimonialItem) => {
    setEditing(item);
    setForm({
      position: item.position || 1,
      author: item.author,
      location: item.location,
      text: item.text,
    });
    setModalOpen(true);
  };

  const handleSeed = async () => {
    const batch = writeBatch(db);
    DEFAULT_TESTIMONIALS.forEach((t) => {
      batch.set(doc(db, 'sites', siteId, 'testimonials', t.id), {
        text: t.text,
        author: t.author,
        location: t.location,
        position: t.position,
      });
    });
    await batch.commit();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      position: Number(form.position) || 1,
      author: form.author.trim(),
      location: form.location.trim(),
      text: form.text.trim(),
    };
    const path = `sites/${siteId}/testimonials`;
    try {
      if (editing) {
        await updateDoc(doc(db, 'sites', siteId, 'testimonials', editing.id), payload);
      } else {
        await addDoc(collection(db, 'sites', siteId, 'testimonials'), payload);
      }
      setModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, editing ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const path = `sites/${siteId}/testimonials/${deleteTarget.id}`;
    try {
      await deleteDoc(doc(db, 'sites', siteId, 'testimonials', deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search testimonials..."
            className="w-full rounded-xl border border-stone-200 pl-10 pr-4 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {testimonials.length === 0 && (
            <button
              type="button"
              onClick={handleSeed}
              className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Load Sample Reviews
            </button>
          )}
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-xs font-bold uppercase text-stone-500">
              <th className="py-3.5 px-4">Pos</th>
              <th className="py-3.5 px-4">Author</th>
              <th className="py-3.5 px-4">Testimonial Text</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-stone-400">
                  No testimonials found.
                </td>
              </tr>
            ) : (
              paginated.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/70">
                  <td className="py-4 px-4 font-mono text-xs tabular-nums">{t.position}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <p className="font-bold text-stone-900">{t.author}</p>
                    <p className="text-xs text-stone-500">{t.location}</p>
                  </td>
                  <td className="py-4 px-4 max-w-lg">
                    <p className="text-stone-600 line-clamp-2">{t.text}</p>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-lime-50 hover:text-lime-700 px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(t)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold">
                {editing ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Author</label>
                  <input
                    type="text"
                    required
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                  />
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
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Lagos, Nigeria"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Testimonial Text
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                />
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900">Delete Testimonial?</h3>
            <p className="text-sm text-stone-600">
              Delete review by <strong>{deleteTarget.author}</strong>?
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
