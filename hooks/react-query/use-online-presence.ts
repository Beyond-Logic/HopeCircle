// hooks/react-query/use-online-presence.ts
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  console.log("online users", onlineUsers)

  useEffect(() => {
    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: "user-presence",
        },
      },
    });

    // Track current user's presence
    const trackPresence = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await channel.track({
          userId: user.id,
          onlineAt: new Date().toISOString(),
        });
      }
    };

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const userIds = new Set<string>();

        // Extract user IDs from presence state
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(state).forEach((presences: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          presences.forEach((presence: any) => {
            if (presence.userId) {
              userIds.add(presence.userId);
            }
          });
        });

        setOnlineUsers(userIds);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        // Handle user coming online
        const newUserIds = newPresences
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => p.userId)
          .filter(Boolean);
        setOnlineUsers((prev) => new Set([...prev, ...newUserIds]));
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        // Handle user going offline
        const leftUserIds = leftPresences
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => p.userId)
          .filter(Boolean);
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          leftUserIds.forEach((id) => updated.delete(id));
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await trackPresence();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return onlineUsers;
}
