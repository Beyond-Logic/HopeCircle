// hooks/use-chat-users.ts
"use client";

import { chatService } from "@/lib/supabase/service/chat-service";
import { useEffect, useState } from "react";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useChatUsers(chats: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<Record<string, any>>({});

  useEffect(() => {
    async function fetchUsers() {
      const missingIds = chats
        .map((c) => c.otherUserId)
        .filter((id) => id && !users[id]);

      if (missingIds.length === 0) return;

      const results = await Promise.all(
        missingIds.map((id) => chatService.getUserById(id))
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newUsers: Record<string, any> = {};
      results.forEach((res, i) => {
        if (res.data) {
          newUsers[missingIds[i]] = res.data;
        }
      });

      setUsers((prev) => ({ ...prev, ...newUsers }));
    }

    if (chats?.length > 0) {
      fetchUsers();
    }
  }, [chats]);

  return users;
}
