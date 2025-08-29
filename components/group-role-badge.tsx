import { Badge } from "@/components/ui/badge";
import { Crown, Shield, User } from "lucide-react";

export function GroupRoleBadge({
  role,
}: {
  role: "admin" | "moderator" | "member";
}) {
  const roleConfig = {
    admin: {
      label: "Admin",
      icon: <Crown className="w-3 h-3" />,
      style: "bg-yellow-500 text-black", // 🟡 Gold
    },
    moderator: {
      label: "Moderator",
      icon: <Shield className="w-3 h-3" />,
      style: "bg-indigo-500 text-white", // 🔵 Indigo/Blue
    },
    member: {
      label: "Member",
      icon: <User className="w-3 h-3" />,
      style: "bg-gray-300 text-black", // ⚪ Neutral Gray
    },
  } as const;

  const { label, icon, style } = roleConfig[role];

  return (
    <Badge className={`${style} capitalize ml-2 p-0.5`} title={label}>
      {icon}
      {/* {label} */}
    </Badge>
  );
}
