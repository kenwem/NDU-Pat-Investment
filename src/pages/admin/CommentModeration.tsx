import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { CheckCircle2, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';
import { formatDateTimeDDMMYYYY, parseDateSafe } from '../../utils/dateFormat';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import Pagination from '../../components/Pagination';

interface ModeratedItem {
  id: string;
  collectionName: 'products' | 'services';
  parentDocId: string;
  parentTitle: string;
  parentSlug?: string;
  isReply: boolean;
  parentCommentId?: string;
  userName: string;
  userEmail: string;
  text: string;
  status: 'pending' | 'approved';
  createdAt: unknown;
}

const ITEMS_PER_PAGE = 10;

export default function CommentModeration() {
  const [items, setItems] = useState<ModeratedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ModeratedItem | null>(null);

  const fetchAllComments = async () => {
    setLoading(true);
    const scanned: ModeratedItem[] = [];
    const targetCols: ('products' | 'services')[] = [
      'products',
      'services',
    ];

    try {
      for (const colName of targetCols) {
        const parentSnap = await getDocs(collection(db, 'sites', siteId, colName));
        for (const pDoc of parentSnap.docs) {
          const pData = pDoc.data();
          const parentTitle = String(pData.title || pData.name || pDoc.id);
          const parentSlug = pData.slug ? String(pData.slug) : undefined;

          const commentsSnap = await getDocs(
            collection(db, 'sites', siteId, colName, pDoc.id, 'comments')
          );

          for (const cDoc of commentsSnap.docs) {
            const cData = cDoc.data();
            scanned.push({
              id: cDoc.id,
              collectionName: colName,
              parentDocId: pDoc.id,
              parentTitle,
              parentSlug,
              isReply: false,
              userName: String(cData.userName || 'Visitor'),
              userEmail: String(cData.userEmail || ''),
              text: String(cData.text || ''),
              status: cData.status === 'approved' ? 'approved' : 'pending',
              createdAt: cData.createdAt,
            });

            const repliesSnap = await getDocs(
              collection(
                db,
                'sites',
                siteId,
                colName,
                pDoc.id,
                'comments',
                cDoc.id,
                'replies'
              )
            );
            for (const rDoc of repliesSnap.docs) {
              const rData = rDoc.data();
              scanned.push({
                id: rDoc.id,
                collectionName: colName,
                parentDocId: pDoc.id,
                parentTitle,
                parentSlug,
                isReply: true,
                parentCommentId: cDoc.id,
                userName: String(rData.userName || 'Visitor'),
                userEmail: String(rData.userEmail || ''),
                text: String(rData.text || ''),
                status: rData.status === 'approved' ? 'approved' : 'pending',
                createdAt: rData.createdAt,
              });
            }
          }
        }
      }

      scanned.sort((a, b) => parseDateSafe(b.createdAt) - parseDateSafe(a.createdAt));
      setItems(scanned);
    } catch (err) {
      console.error('Error loading comments for moderation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComments();
  }, []);

  const filtered = useMemo(() => {
    if (filterTab === 'all') return items;
    return items.filter((item) => item.status === filterTab);
  }, [items, filterTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getDocRef = (item: ModeratedItem) => {
    if (item.isReply && item.parentCommentId) {
      return doc(
        db,
        'sites',
        siteId,
        item.collectionName,
        item.parentDocId,
        'comments',
        item.parentCommentId,
        'replies',
        item.id
      );
    }
    return doc(
      db,
      'sites',
      siteId,
      item.collectionName,
      item.parentDocId,
      'comments',
      item.id
    );
  };

  const handleApprove = async (item: ModeratedItem) => {
    const ref = getDocRef(item);
    try {
      await updateDoc(ref, { status: 'approved' });
      // Keep approved items visible in list until deleted
      setItems((prev) =>
        prev.map((x) =>
          x.id === item.id && x.parentDocId === item.parentDocId
            ? { ...x, status: 'approved' }
            : x
        )
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, ref.path);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ref = getDocRef(deleteTarget);
    try {
      await deleteDoc(ref);
      setItems((prev) =>
        prev.filter(
          (x) =>
            !(
              x.id === deleteTarget.id &&
              x.parentDocId === deleteTarget.parentDocId &&
              x.isReply === deleteTarget.isReply
            )
        )
      );
      setDeleteTarget(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, ref.path);
    }
  };

  const getViewUrl = (item: ModeratedItem) => {
    if (item.collectionName === 'products') return '/products';
    return '/services';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setFilterTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                filterTab === tab
                  ? 'bg-lime-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab} (
              {tab === 'all'
                ? items.length
                : items.filter((i) => i.status === tab).length}
              )
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={fetchAllComments}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 divide-y divide-stone-100">
        {loading ? (
          <div className="p-10 text-center text-stone-400 text-sm">
            Scanning comments across products and services...
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-10 text-center text-stone-400 text-sm">
            No {filterTab === 'all' ? '' : filterTab} comments found.
          </div>
        ) : (
          paginated.map((item) => (
            <div
              key={`${item.collectionName}-${item.parentDocId}-${item.id}`}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/70"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">
                    {item.userName}
                  </span>
                  <span className="text-xs text-stone-400">({item.userEmail})</span>
                  {item.isReply && (
                    <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Reply
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {item.status === 'approved' ? 'Approved' : 'Pending'}
                  </span>
                  <span className="text-xs text-stone-400 tabular-nums">
                    {formatDateTimeDDMMYYYY(item.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-stone-700 whitespace-pre-wrap">{item.text}</p>

                <p className="text-xs text-stone-500">
                  On <span className="font-semibold capitalize">{item.collectionName}</span>:{' '}
                  <strong className="text-stone-700">{item.parentTitle}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getViewUrl(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-lg"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Page
                </a>
                {item.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(item)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-lime-600 hover:bg-lime-700 px-3 py-2 rounded-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900">Delete Comment?</h3>
            <p className="text-sm text-stone-600">
              Permanently remove this comment by <strong>{deleteTarget.userName}</strong>?
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
