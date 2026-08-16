import { getUserFriends } from "@/actions/friends";
import { FriendsClient } from "./_components/friends-client";

export const metadata = {
  title: "Friends & UPI Contacts | Trakex",
  description: "Manage group contacts and UPI IDs to split expenses and request direct payments.",
};

export default async function FriendsPage() {
  const res = await getUserFriends();
  const initialFriends = res?.success ? res.data : [];

  return <FriendsClient initialFriends={initialFriends} />;
}
