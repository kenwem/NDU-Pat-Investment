import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import {
  MessageSquare,
  Send,
  Trash2,
  CornerDownRight,
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { db, auth } from '../firebase';
import { siteId, isAdmin } from '../constants/siteConfig';
import { formatDateDDMMYYYY, parseDateSafe } from '../utils/dateFormat';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

interface CommentSectionProps {
  collectionName: string;
  docId: string;
}

interface ReplyItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: unknown;
  status: 'pending' | 'approved';
}

interface CommentItem extends ReplyItem {
  replies?: ReplyItem[];
}

export default function CommentSection({ collectionName, docId }: CommentSectionProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [repliesMap, setRepliesMap] = useState<Record<string, ReplyItem[]>>({});
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Pending approval notice popup
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubAuth();
  }, []);

  const userIsAdmin = isAdmin(user?.email);

  useEffect(() => {
    if (!docId) return;
    const basePath = `sites/${siteId}/${collectionName}/${docId}/comments`;
    const commentsRef = collection(db, 'sites', siteId, collectionName, docId, 'comments');
    const q = userIsAdmin
      ? query(commentsRef)
      : query(commentsRef, where('status', '==', 'approved'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: CommentItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.status === 'approved' || isAdmin(data.userEmail) || userIsAdmin) {
            items.push({
              id: docSnap.id,
              userId: data.userId,
              userEmail: data.userEmail,
              userName: data.userName,
              userPhoto: data.userPhoto || '',
              text: data.text,
              createdAt: data.createdAt,
              status: data.status,
            });
          }
        });
        items.sort((a, b) => parseDateSafe(a.createdAt) - parseDateSafe(b.createdAt));
        setComments(items);
      },
      (error) => {
        console.error('Comments subscription error:', error);
        if (error.message.includes('permission')) {
          handleFirestoreError(error, OperationType.LIST, basePath);
        }
      }
    );

    return () => unsub();
  }, [collectionName, docId, userIsAdmin]);

  // Listen to replies for each visible comment
  useEffect(() => {
    if (!docId || comments.length === 0) {
      setRepliesMap({});
      return;
    }

    const unsubs: (() => void)[] = [];

    comments.forEach((comment) => {
      const repliesRef = collection(
        db,
        'sites',
        siteId,
        collectionName,
        docId,
        'comments',
        comment.id,
        'replies'
      );
      const q = userIsAdmin
        ? query(repliesRef)
        : query(repliesRef, where('status', '==', 'approved'));

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: ReplyItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.status === 'approved' || isAdmin(data.userEmail) || userIsAdmin) {
              list.push({
                id: docSnap.id,
                userId: data.userId,
                userEmail: data.userEmail,
                userName: data.userName,
                userPhoto: data.userPhoto || '',
                text: data.text,
                createdAt: data.createdAt,
                status: data.status,
              });
            }
          });
          list.sort((a, b) => parseDateSafe(a.createdAt) - parseDateSafe(b.createdAt));
          setRepliesMap((prev) => ({ ...prev, [comment.id]: list }));
        },
        (err) => {
          console.error('Replies listener error:', err);
        }
      );

      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [comments, collectionName, docId, userIsAdmin]);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      setAuthModalOpen(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        if (!authName.trim()) {
          setAuthError('Please enter your display name.');
          setAuthLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        await updateProfile(cred.user, { displayName: authName.trim() });
      } else {
        await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      }
      setAuthModalOpen(false);
      setAuthPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    const path = `sites/${siteId}/${collectionName}/${docId}/comments`;
    try {
      const status = isAdmin(user.email) ? 'approved' : 'pending';
      await addDoc(collection(db, 'sites', siteId, collectionName, docId, 'comments'), {
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || user.email?.split('@')[0] || 'Musician',
        userPhoto: user.photoURL || '',
        text: newComment.trim(),
        createdAt: serverTimestamp(),
        status,
      });
      setNewComment('');
      if (status === 'pending') {
        setNoticeMessage('Your comment is pending approval by the administrator.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;
    setSubmitting(true);
    const path = `sites/${siteId}/${collectionName}/${docId}/comments/${commentId}/replies`;
    try {
      const status = isAdmin(user.email) ? 'approved' : 'pending';
      await addDoc(
        collection(db, 'sites', siteId, collectionName, docId, 'comments', commentId, 'replies'),
        {
          userId: user.uid,
          userEmail: user.email || '',
          userName: user.displayName || user.email?.split('@')[0] || 'Musician',
          userPhoto: user.photoURL || '',
          text: replyText.trim(),
          createdAt: serverTimestamp(),
          status,
        }
      );
      setReplyText('');
      setReplyingTo(null);
      if (status === 'pending') {
        setNoticeMessage('Your reply is pending approval by the administrator.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const path = `sites/${siteId}/${collectionName}/${docId}/comments/${commentId}`;
    try {
      await deleteDoc(doc(db, 'sites', siteId, collectionName, docId, 'comments', commentId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    const path = `sites/${siteId}/${collectionName}/${docId}/comments/${commentId}/replies/${replyId}`;
    try {
      await deleteDoc(
        doc(db, 'sites', siteId, collectionName, docId, 'comments', commentId, 'replies', replyId)
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">Community Discussion</h3>
            <p className="text-sm text-stone-500">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </p>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-stone-600">
              Signed in as <strong className="text-stone-900">{user.displayName || user.email}</strong>
            </span>
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-red-600 px-3 py-1.5 rounded-full border border-stone-200 hover:border-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Sign in to comment
          </button>
        )}
      </div>

      {/* Pending approval modal */}
      {noticeMessage && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-stone-100">
            <div className="w-12 h-12 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-stone-900 mb-2">Submitted for Moderation</h4>
            <p className="text-sm text-stone-600 mb-6">{noticeMessage}</p>
            <button
              type="button"
              onClick={() => setNoticeMessage(null)}
              className="w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold py-2.5 rounded-full transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* New Comment Form */}
      {user ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            required
            placeholder="Share your thoughts, instrument questions, or studio experience..."
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-stone-50 rounded-2xl p-6 text-center border border-stone-100">
          <p className="text-stone-600 text-sm mb-3">
            Join the conversation with fellow musicians, sound engineers, and worship leaders.
          </p>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="text-lime-600 hover:text-lime-700 font-bold text-sm underline cursor-pointer"
          >
            Sign in to post a comment
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-6">
            No approved comments yet. Be the first to start the discussion!
          </p>
        ) : (
          comments.map((comment) => {
            const canDelete = user && (user.uid === comment.userId || userIsAdmin);
            const authorIsAdmin = isAdmin(comment.userEmail);
            const replies = repliesMap[comment.id] || [];

            return (
              <div
                key={comment.id}
                className="group bg-stone-50/70 rounded-2xl p-5 border border-stone-100 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {comment.userPhoto ? (
                      <img
                        src={comment.userPhoto}
                        alt={comment.userName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-lime-100 text-lime-700 font-bold flex items-center justify-center text-sm">
                        {comment.userName?.charAt(0).toUpperCase() || 'M'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">
                          {comment.userName}
                        </span>
                        {authorIsAdmin && (
                          <span className="inline-flex items-center gap-1 bg-lime-100 text-lime-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                        {comment.status === 'pending' && userIsAdmin && (
                          <span className="bg-yellow-100 text-yellow-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-400 tabular-nums">
                        {formatDateDDMMYYYY(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      aria-label="Delete comment"
                      className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 p-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.text}
                </p>

                {user && (
                  <button
                    type="button"
                    onClick={() =>
                      setReplyingTo(replyingTo === comment.id ? null : comment.id)
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-600 hover:text-lime-700 cursor-pointer"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    Reply
                  </button>
                )}

                {replyingTo === comment.id && user && (
                  <form
                    onSubmit={(e) => handlePostReply(e, comment.id)}
                    className="pl-6 border-l-2 border-lime-200 space-y-2 pt-2"
                  >
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                      required
                      placeholder={`Reply to ${comment.userName}...`}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-700 px-3 py-1.5 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !replyText.trim()}
                        className="bg-lime-600 hover:bg-lime-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full cursor-pointer"
                      >
                        Post Reply
                      </button>
                    </div>
                  </form>
                )}

                {replies.length > 0 && (
                  <div className="pl-6 border-l-2 border-stone-200 space-y-3 pt-2">
                    {replies.map((reply) => {
                      const canDeleteReply =
                        user && (user.uid === reply.userId || userIsAdmin);
                      const replyAuthorAdmin = isAdmin(reply.userEmail);
                      return (
                        <div
                          key={reply.id}
                          className="group/reply bg-white rounded-xl p-4 border border-stone-100 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-800 text-xs">
                                {reply.userName}
                              </span>
                              {replyAuthorAdmin && (
                                <span className="bg-lime-100 text-lime-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Admin
                                </span>
                              )}
                              {reply.status === 'pending' && userIsAdmin && (
                                <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Pending
                                </span>
                              )}
                              <span className="text-[11px] text-stone-400 tabular-nums">
                                {formatDateDDMMYYYY(reply.createdAt)}
                              </span>
                            </div>
                            {canDeleteReply && (
                              <button
                                type="button"
                                onClick={() => handleDeleteReply(comment.id, reply.id)}
                                aria-label="Delete reply"
                                className="opacity-0 group-hover/reply:opacity-100 text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-stone-600 text-sm whitespace-pre-wrap">
                            {reply.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Authentication Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100">
            <div className="bg-stone-900 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {authMode === 'signin' ? 'Sign In to Comment' : 'Create Account'}
                </h3>
                <p className="text-xs text-stone-400">NDU PAT Investment Community</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {authError && (
                <div className="bg-red-50 text-red-700 text-xs font-medium px-4 py-3 rounded-xl border border-red-100">
                  {authError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm py-3 px-4 rounded-xl border border-stone-300 shadow-sm transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200" />
                <span className="flex-shrink mx-3 text-xs text-stone-400 uppercase font-semibold">
                  Or with email
                </span>
                <div className="flex-grow border-t border-stone-200" />
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-lime-600 hover:bg-lime-700 disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl transition-colors cursor-pointer"
                >
                  {authLoading
                    ? 'Please wait...'
                    : authMode === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-xs text-stone-500">
                {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    setAuthError('');
                  }}
                  className="text-lime-600 font-bold hover:underline cursor-pointer"
                >
                  {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
