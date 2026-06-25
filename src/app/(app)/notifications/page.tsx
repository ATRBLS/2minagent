import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = user
    ? await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <div className="px-4 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Notifications</h1>
        <button className="text-xs text-neutral-500">Tout marquer comme lu</button>
      </div>

      {!notifications?.length ? (
        <div className="rounded-2xl bg-neutral-900 p-6 text-center text-sm text-neutral-500">
          🔔 Rien pour le moment. Tes agents te préviendront ici.
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl p-3 ring-1 ${
                n.is_read ? "bg-neutral-900/50 ring-neutral-800" : "bg-neutral-900 ring-green-900"
              }`}
            >
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-neutral-400">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
