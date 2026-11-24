import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';
import {
  convertDDMMYYYYToInputDate,
  convertInputDateToDDMMYYYY,
  formatDateDDMMYYYY,
  parseDateSafe,
} from '../../utils/dateFormat';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import Pagination from '../../components/Pagination';

interface AppointmentDoc {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  message?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt?: unknown;
}

const ITEMS_PER_PAGE = 10;

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Completed: 'bg-stone-100 text-stone-700',
  Cancelled: 'bg-stone-100 text-stone-600',
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<AppointmentDoc[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentDoc | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '10:00 AM',
    status: 'Pending' as AppointmentDoc['status'],
    message: '',
  });

  useEffect(() => {
    const path = `sites/${siteId}/appointments`;
    const unsub = onSnapshot(
      collection(db, 'sites', siteId, 'appointments'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AppointmentDoc, 'id'>),
        }));
        setAppointments(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, path)
    );
    return () => unsub();
  }, []);

  const sorted = useMemo(() => {
    const copy = [...appointments];
    copy.sort((a, b) => {
      const ta = parseDateSafe(a.createdAt) || parseDateSafe(a.date);
      const tb = parseDateSafe(b.createdAt) || parseDateSafe(b.date);
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });
    return copy;
  }, [appointments, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      service: 'Instrument Sales & Sound Advisory',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      status: 'Pending',
      message: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item: AppointmentDoc) => {
    setEditing(item);
    setForm({
      name: item.name,
      email: item.email,
      phone: item.phone,
      service: item.service,
      date: convertDDMMYYYYToInputDate(item.date),
      time: item.time,
      status: item.status,
      message: item.message || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = convertInputDateToDDMMYYYY(form.date) || formatDateDDMMYYYY(new Date());
    const path = `sites/${siteId}/appointments`;

    try {
      if (editing) {
        await updateDoc(doc(db, 'sites', siteId, 'appointments', editing.id), {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          service: form.service.trim(),
          date: formattedDate,
          time: form.time.trim(),
          status: form.status,
          message: form.message.trim(),
          createdAt: editing.createdAt || serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'sites', siteId, 'appointments'), {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          service: form.service.trim(),
          date: formattedDate,
          time: form.time.trim(),
          status: form.status,
          message: form.message.trim(),
          createdAt: serverTimestamp(),
        });
      }
      setModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, editing ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const path = `sites/${siteId}/appointments/${deleteTarget.id}`;
    try {
      await deleteDoc(doc(db, 'sites', siteId, 'appointments', deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-stone-500 uppercase">Sort by Date:</label>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as 'newest' | 'oldest');
              setCurrentPage(1);
            }}
            className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Appointment
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-xs font-bold uppercase text-stone-500">
              <th className="py-3.5 px-5">Client Info</th>
              <th className="py-3.5 px-5">Service</th>
              <th className="py-3.5 px-5">Schedule</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-stone-400">
                  No appointments recorded yet.
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/70">
                  <td className="py-4 px-5">
                    <p className="font-bold text-stone-900">{item.name}</p>
                    <p className="text-xs text-stone-500">{item.email}</p>
                    <p className="text-xs text-stone-500 tabular-nums">{item.phone}</p>
                  </td>
                  <td className="py-4 px-5 font-medium text-stone-700">{item.service}</td>
                  <td className="py-4 px-5 tabular-nums">
                    <p className="font-semibold text-stone-900">
                      {formatDateDDMMYYYY(item.date)}
                    </p>
                    <p className="text-xs font-bold text-lime-600">{item.time}</p>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                        STATUS_BADGE[item.status] || 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-lime-700 bg-stone-100 hover:bg-lime-50 px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Manage
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold">
                {editing ? 'Manage Appointment' : 'Add Appointment'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Service</label>
                <input
                  type="text"
                  required
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as AppointmentDoc['status'] })
                    }
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
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

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900">Delete Appointment?</h3>
            <p className="text-sm text-stone-600">
              Remove appointment request from <strong>{deleteTarget.name}</strong>? This cannot be undone.
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
