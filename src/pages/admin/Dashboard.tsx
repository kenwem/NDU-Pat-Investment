import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import {
  Calendar,
  Package,
  Star,
  Clock,
  Trash2,
} from 'lucide-react';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';
import { parseDateSafe } from '../../utils/dateFormat';

interface ActivityEvent {
  id: string;
  title: string;
  subtitle: string;
  timestamp: number;
  link: string;
  type: 'appointment' | 'message';
}

const CLEARED_AT_KEY = 'dashboard_cleared_at';

function formatRelativeTime(ts: number): string {
  if (!ts) return 'Recently';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export default function Dashboard() {
  const [counts, setCounts] = useState({
    pendingAppointments: 0,
    activeProducts: 0,
    testimonials: 0,
  });

  const [apptEvents, setApptEvents] = useState<ActivityEvent[]>([]);
  const [msgEvents, setMsgEvents] = useState<ActivityEvent[]>([]);
  const [clearedAt, setClearedAt] = useState<number>(() => {
    const raw = localStorage.getItem(CLEARED_AT_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  });

  useEffect(() => {
    const unsubApptsAll = onSnapshot(
      collection(db, 'sites', siteId, 'appointments'),
      (snap) => {
        const pending = snap.docs.filter((d) => d.data().status === 'Pending').length;
        setCounts((prev) => ({ ...prev, pendingAppointments: pending }));
      }
    );

    const unsubProducts = onSnapshot(
      collection(db, 'sites', siteId, 'products'),
      (snap) => {
        setCounts((prev) => ({ ...prev, activeProducts: snap.size }));
      }
    );

    const unsubTestimonials = onSnapshot(
      collection(db, 'sites', siteId, 'testimonials'),
      (snap) => {
        setCounts((prev) => ({ ...prev, testimonials: snap.size }));
      }
    );

    return () => {
      unsubApptsAll();
      unsubProducts();
      unsubTestimonials();
    };
  }, []);

  // Recent Activity listeners (with safe fallback)
  useEffect(() => {
    const mapAppts = (docs: { id: string; data: () => Record<string, unknown> }[]) => {
      const items: ActivityEvent[] = docs.slice(0, 5).map((d) => {
        const data = d.data();
        return {
          id: `appt-${d.id}`,
          title: `Appointment requested by ${String(data.name || 'Client')}`,
          subtitle: String(data.service || 'Consultation'),
          timestamp: parseDateSafe(data.createdAt) || parseDateSafe(data.date),
          link: '/admin/appointments',
          type: 'appointment',
        };
      });
      setApptEvents(items);
    };

    let unsubAppts = onSnapshot(
      query(collection(db, 'sites', siteId, 'appointments'), orderBy('createdAt', 'desc'), limit(5)),
      (snap) => mapAppts(snap.docs),
      () => {
        unsubAppts = onSnapshot(collection(db, 'sites', siteId, 'appointments'), (snap) =>
          mapAppts(snap.docs)
        );
      }
    );

    const mapMsgs = (docs: { id: string; data: () => Record<string, unknown> }[]) => {
      const items: ActivityEvent[] = docs.slice(0, 5).map((d) => {
        const data = d.data();
        return {
          id: `msg-${d.id}`,
          title: `New message from ${String(data.name || 'Visitor')}`,
          subtitle: String(data.subject || 'Inquiry'),
          timestamp: parseDateSafe(data.createdAt) || parseDateSafe(data.date),
          link: '/admin/messages',
          type: 'message',
        };
      });
      setMsgEvents(items);
    };

    let unsubMsgs = onSnapshot(
      query(collection(db, 'sites', siteId, 'messages'), orderBy('createdAt', 'desc'), limit(5)),
      (snap) => mapMsgs(snap.docs),
      () => {
        unsubMsgs = onSnapshot(collection(db, 'sites', siteId, 'messages'), (snap) =>
          mapMsgs(snap.docs)
        );
      }
    );

    return () => {
      unsubAppts();
      unsubMsgs();
    };
  }, []);

  const recentActivity = useMemo(() => {
    return [...apptEvents, ...msgEvents]
      .filter((e) => e.timestamp === 0 || e.timestamp > clearedAt)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);
  }, [apptEvents, msgEvents, clearedAt]);

  const handleClearActivity = () => {
    const now = Date.now();
    localStorage.setItem(CLEARED_AT_KEY, String(now));
    setClearedAt(now);
  };

  const metricCards = [
    {
      label: 'Pending Appointments',
      value: counts.pendingAppointments,
      icon: Calendar,
      color: 'bg-blue-500',
      to: '/admin/appointments',
    },
    {
      label: 'Active Products',
      value: counts.activeProducts,
      icon: Package,
      color: 'bg-indigo-500',
      to: '/admin/products',
    },
    {
      label: 'Testimonials',
      value: counts.testimonials,
      icon: Star,
      color: 'bg-amber-500',
      to: '/admin/testimonials',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 5 Metric Cards in 3-column desktop grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.to}
              className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-all flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-stone-500">{card.label}</p>
                <p className="text-3xl font-extrabold text-stone-900 mt-1 tabular-nums">
                  {card.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl ${card.color} text-white flex items-center justify-center shrink-0 shadow-sm`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Live Recent Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-lime-600" />
            <h2 className="text-lg font-bold text-stone-900">Recent Activity</h2>
          </div>
          {recentActivity.length > 0 && (
            <button
              type="button"
              onClick={handleClearActivity}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>

        <div className="divide-y divide-stone-100">
          {recentActivity.length === 0 ? (
            <div className="p-10 text-center text-stone-400 text-sm">
              No recent activity to display.
            </div>
          ) : (
            recentActivity.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-stone-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-stone-500 truncate mt-0.5">{item.subtitle}</p>
                </div>
                <span className="text-xs font-medium text-stone-400 whitespace-nowrap shrink-0 tabular-nums">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
