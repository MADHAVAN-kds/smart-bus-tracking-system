import { useEffect, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadNotifications() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setItems([]);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("notifications")
        .select("id, title, message, type, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (queryError) throw queryError;

      setItems((data ?? []) as Notification[]);
    } catch (err) {
      console.error("Notification loading failed:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  async function markAsRead(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      setError("Unable to mark notification as read.");
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      )
    );
  }

  const unreadCount = items.filter((item) => !item.is_read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void loadNotifications();
        }}
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative rounded-xl border border-slate-200 bg-white p-3 text-slate-700 hover:bg-slate-50"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(90vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unreadCount} unread
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <p role="alert" className="p-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="p-6 text-center text-sm text-slate-500">
                Loading notifications...
              </p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`border-b border-slate-100 p-4 ${
                    item.is_read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.message}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>

                    {!item.is_read && (
                      <button
                        type="button"
                        onClick={() => void markAsRead(item.id)}
                        title="Mark as read"
                        aria-label={`Mark ${item.title} as read`}
                        className="shrink-0 rounded-lg p-2 text-blue-600 hover:bg-blue-100"
                      >
                        <CheckCheck size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}