import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Eye, Trash2, X, Mail } from 'lucide-react';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';
import { parseDateSafe } from '../../utils/dateFormat';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import Pagination from '../../components/Pagination';

interface MessageDoc {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'Unread' | 'Read';
  date: string;
  createdAt?: unknown;
}

const ITEMS_PER_PAGE = 10;

export default function AdminMessages() {
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [selected, setSelected] = useState<MessageDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MessageDoc | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const path = `sites/${siteId}/messages`;
    const unsub = onSnapshot(
      collection(db, 'sites', siteId, 'messages'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MessageDoc, 'id'>),
        }));
        setMessages(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, path)
    );
    return () => unsub();
  }, []);

  const sorted = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        (parseDateSafe(b.createdAt) || parseDateSafe(b.date)) -
        (parseDateSafe(a.createdAt) || parseDateSafe(a.date))
    );
  }, [messages]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenMessage = async (msg: MessageDoc) => {
    setSelected(msg);
    if (msg.status === 'Unread') {
      const path = `sites/${siteId}/messages/${msg.id}`;
      try {
        await updateDoc(doc(db, 'sites', siteId, 'messages', msg.id), {
          status: 'Read',
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const path = `sites/${siteId}/messages/${deleteTarget.id}`;
    try {
      await deleteDoc(doc(db, 'sites', siteId, 'messages', deleteTarget.id));
      setDeleteTarget(null);
      if (selected?.id === deleteTarget.id) setSelected(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-xs font-bold uppercase text-stone-500">
              <th className="py-3.5 px-5">Sender</th>
              <th className="py-3.5 px-5">Subject</th>
              <th className="py-3.5 px-5">Date</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-stone-400">
                  No contact messages received yet.
                </td>
              </tr>
            ) : (
              paginated.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50/70">
                  <td className="py-4 px-5">
                    <p className="font-bold text-stone-900">{m.name}</p>
                    <p className="text-xs text-stone-500">{m.email}</p>
                  </td>
                  <td className="py-4 px-5 font-medium text-stone-800">{m.subject}</td>
                  <td className="py-4 px-5 text-stone-600 tabular-nums">{m.date}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        m.status === 'Unread'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenMessage(m)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-lime-50 hover:text-lime-700 px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(m)}
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

      {selected && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-lime-400" />
                <h3 className="font-bold text-sm">Message Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase text-stone-400">Subject</p>
                <h4 className="text-lg font-bold text-stone-900">{selected.subject}</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-3.5 rounded-xl">
                <div>
                  <span className="text-stone-400 block">From</span>
                  <strong className="text-stone-800">{selected.name}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Date</span>
                  <strong className="text-stone-800 tabular-nums">{selected.date}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 block">Email</span>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-lime-600 font-semibold hover:underline"
                  >
                    {selected.email}
                  </a>
                </div>
              </div>
              <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap bg-stone-50 p-4 rounded-xl">
                {selected.message}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="bg-stone-900 text-white text-sm font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900">Delete Message?</h3>
            <p className="text-sm text-stone-600">
              Delete inquiry from <strong>{deleteTarget.name}</strong>?
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
