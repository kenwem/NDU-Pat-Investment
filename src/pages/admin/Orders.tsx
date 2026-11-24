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
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';
import {
  formatNaira,
  formatDateDDMMYYYY,
  convertDDMMYYYYToInputDate,
  convertInputDateToDDMMYYYY,
} from '../../utils/dateFormat';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import Pagination from '../../components/Pagination';

interface OrderDoc {
  id: string;
  orderId: string;
  name: string;
  product: string;
  total: string;
  status: 'Processing' | 'Shipped' | 'Delivered';
  date: string;
  createdAt?: unknown;
}

const ITEMS_PER_PAGE = 10;

const STATUS_STYLE: Record<string, string> = {
  Processing: 'bg-amber-100 text-amber-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
};

export default function Orders() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OrderDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrderDoc | null>(null);

  const [form, setForm] = useState({
    orderId: '',
    name: '',
    product: '',
    total: '',
    status: 'Processing' as OrderDoc['status'],
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const path = `sites/${siteId}/orders`;
    const unsub = onSnapshot(
      collection(db, 'sites', siteId, 'orders'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<OrderDoc, 'id'>),
        }));
        setOrders(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, path)
    );
    return () => unsub();
  }, []);

  const sorted = useMemo(() => {
    return [...orders].sort((a, b) => b.orderId.localeCompare(a.orderId));
  }, [orders]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      orderId: `#NDU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      product: '',
      total: '',
      status: 'Processing',
      date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEdit = (o: OrderDoc) => {
    setEditing(o);
    setForm({
      orderId: o.orderId,
      name: o.name,
      product: o.product,
      total: o.total,
      status: o.status,
      date: convertDDMMYYYYToInputDate(o.date),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawId = form.orderId.trim();
    const normalizedId = rawId.startsWith('#') ? rawId : `#${rawId}`;
    const payload = {
      orderId: normalizedId,
      name: form.name.trim(),
      product: form.product.trim(),
      total: formatNaira(form.total),
      status: form.status,
      date: convertInputDateToDDMMYYYY(form.date) || formatDateDDMMYYYY(new Date()),
      createdAt: editing?.createdAt || serverTimestamp(),
    };
    const path = `sites/${siteId}/orders`;
    try {
      if (editing) {
        await updateDoc(doc(db, 'sites', siteId, 'orders', editing.id), payload);
      } else {
        await addDoc(collection(db, 'sites', siteId, 'orders'), payload);
      }
      setModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, editing ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const path = `sites/${siteId}/orders/${deleteTarget.id}`;
    try {
      await deleteDoc(doc(db, 'sites', siteId, 'orders', deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-600">
          Track musical instrument orders and delivery progress.
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Order
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-xs font-bold uppercase text-stone-500">
              <th className="py-3.5 px-5">Order ID</th>
              <th className="py-3.5 px-5">Customer</th>
              <th className="py-3.5 px-5">Instrument / Product</th>
              <th className="py-3.5 px-5">Total</th>
              <th className="py-3.5 px-5">Date</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-stone-400">
                  No orders recorded yet.
                </td>
              </tr>
            ) : (
              paginated.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50/70">
                  <td className="py-4 px-5 font-mono font-bold text-stone-900">
                    {o.orderId}
                  </td>
                  <td className="py-4 px-5 font-semibold text-stone-800">{o.name}</td>
                  <td className="py-4 px-5 text-stone-600">{o.product}</td>
                  <td className="py-4 px-5 font-bold text-lime-700 tabular-nums">
                    {o.total}
                  </td>
                  <td className="py-4 px-5 text-stone-600 tabular-nums">
                    {formatDateDDMMYYYY(o.date)}
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        STATUS_STYLE[o.status] || 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(o)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-lime-50 hover:text-lime-700 px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(o)}
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
              <h3 className="font-bold">{editing ? 'Edit Order' : 'Add Order'}</h3>
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
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Order ID (#)
                  </label>
                  <input
                    type="text"
                    required
                    value={form.orderId}
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product / Instrument
                </label>
                <input
                  type="text"
                  required
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Total (₦)
                  </label>
                  <input
                    type="text"
                    required
                    value={form.total}
                    onChange={(e) => setForm({ ...form, total: e.target.value })}
                    placeholder="285,000"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Order Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as OrderDoc['status'] })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
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
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900">Delete Order?</h3>
            <p className="text-sm text-stone-600">
              Delete order <strong>{deleteTarget.orderId}</strong>?
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
