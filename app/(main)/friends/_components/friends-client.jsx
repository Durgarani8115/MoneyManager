"use client";

import { useState } from "react";
import { Users, Plus, Smartphone, Phone, Edit, Trash2, Search, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreateFriendDrawer } from "@/components/create-friend-drawer";
import { getUserFriends, deleteFriend } from "@/actions/friends";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

export function FriendsClient({ initialFriends = [] }) {
  const [friends, setFriends] = useState(initialFriends);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState(null);
  const confirm = useConfirm();

  const refreshFriends = async () => {
    const res = await getUserFriends();
    if (res?.success) {
      setFriends(res.data);
    }
  };

  const handleEdit = (friend) => {
    setEditingFriend(friend);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingFriend(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (friend) => {
    const ok = await confirm({
      title: `Delete ₹{friend.name}?`,
      description: "This contact will be removed from your friends list. Past expense splits will remain intact.",
      variant: "destructive",
      confirmLabel: "Delete Contact",
    });
    if (!ok) return;

    const res = await deleteFriend(friend.id);
    if (res?.success) {
      toast.success("Friend contact deleted");
      refreshFriends();
    } else {
      toast.error(res?.error || "Failed to delete contact");
    }
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.upiId && f.upiId.toLowerCase().includes(search.toLowerCase())) ||
      (f.phone && f.phone.includes(search))
  );

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-500" />
            Friends & UPI Contacts
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your group contacts and UPI IDs to split trip expenses and request direct payments.
          </p>
        </div>

        <Button
          size="sm"
          className="h-8 px-3 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-medium shadow-xs"
          onClick={handleAdd}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Friend
        </Button>
      </div>

      {/* Search & Filter Bar */}
      {friends.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name, UPI ID or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      )}

      {/* Friends Grid */}
      {filteredFriends.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center p-6 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-3">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {friends.length === 0 ? "No Friends Added Yet" : "No Friends Match Search"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-4">
            {friends.length === 0
              ? "Add friends with their UPI IDs to split bills and send payment links in 1 click during trip planning."
              : "Try searching for a different name or UPI ID."}
          </p>
          {friends.length === 0 && (
            <Button
              size="sm"
              className="text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              onClick={handleAdd}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Your First Friend
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFriends.map((friend) => (
            <Card
              key={friend.id}
              className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-all border-zinc-200/80 dark:border-zinc-800 shadow-xs bg-card"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200 dark:border-emerald-800">
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {friend.name}
                      </CardTitle>
                      {friend.phone && (
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-zinc-400 shrink-0" />
                          <span>{friend.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      onClick={() => handleEdit(friend)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-400 hover:text-rose-600"
                      onClick={() => handleDelete(friend)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                {friend.upiId ? (
                  <div className="flex items-center justify-between p-2 rounded-md bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                    <span className="font-mono text-[11px] text-emerald-900 dark:text-emerald-300 font-medium truncate">
                      {friend.upiId}
                    </span>
                    <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300 text-[10px] font-bold shrink-0 ml-1">
                      <Smartphone className="h-2.5 w-2.5 mr-0.5" /> UPI Ready
                    </Badge>
                  </div>
                ) : (
                  <div className="p-2 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>No UPI ID added</span>
                    <button
                      type="button"
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline text-[10px]"
                      onClick={() => handleEdit(friend)}
                    >
                      + Add UPI ID
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Friend Drawer */}
      <CreateFriendDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSuccess={refreshFriends}
        initialData={editingFriend}
      />
    </>
  );
}
