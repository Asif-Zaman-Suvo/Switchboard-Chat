"use client";

import { searchUsers } from "@/lib/api/users";
import { startDirect } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useSessionStore } from "@/stores/session-store";
import type { User } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function NewChatDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const token = useSessionStore((s) => s.token)!;
  const me = useSessionStore((s) => s.user);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const search = useQuery({
    queryKey: ["users", debounced],
    queryFn: () => searchUsers(token, debounced),
    enabled: open && debounced.length >= 2,
  });

  const start = useMutation({
    mutationFn: (userId: string) => startDirect(token, userId),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onClose();
      router.push(`/chat/${conversation.id}`);
    },
  });

  if (!open) return null;

  const people = (search.data ?? []).filter((u) => u.id !== me?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col border border-line bg-ink">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-serif text-xl text-paper">New line</h2>
          <button type="button" onClick={onClose} className="text-mute hover:text-paper">
            Close
          </button>
        </div>
        <div className="p-4">
          <Input
            autoFocus
            placeholder="Search by name or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            data-testid="user-search"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {debounced.length < 2 ? (
            <EmptyState title="Type at least two characters" body="We’ll search the switchboard." />
          ) : search.isPending ? (
            <div className="space-y-2 px-4 pb-4">
              <Skeleton />
              <Skeleton />
            </div>
          ) : search.isError ? (
            <ErrorState
              message={search.error instanceof ApiError ? search.error.message : "Search failed"}
              onRetry={() => search.refetch()}
            />
          ) : people.length === 0 ? (
            <EmptyState title="No people match" body="Try another name or number." />
          ) : (
            <ul>
              {people.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  pending={start.isPending}
                  onPick={() => start.mutate(user.id)}
                />
              ))}
            </ul>
          )}
        </div>
        {start.isError ? (
          <p className="border-t border-line px-4 py-2 text-sm text-signal">
            {start.error instanceof ApiError ? start.error.message : "Could not start chat"}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function UserRow({
  user,
  pending,
  onPick,
}: {
  user: User;
  pending: boolean;
  onPick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        disabled={pending}
        onClick={onPick}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-line/60"
      >
        <Avatar name={user.name} />
        <span className="min-w-0">
          <span className="block truncate text-sm text-paper">{user.name}</span>
          <span className="block truncate font-mono text-[11px] text-mute">{user.phone}</span>
        </span>
      </button>
    </li>
  );
}

export function CreateGroupDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const token = useSessionStore((s) => s.token)!;
  const me = useSessionStore((s) => s.user);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<User[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const search = useQuery({
    queryKey: ["users", debounced],
    queryFn: () => searchUsers(token, debounced),
    enabled: open && debounced.length >= 2,
  });

  const create = useMutation({
    mutationFn: () =>
      import("@/lib/api/conversations").then(({ createGroup }) =>
        createGroup(token, {
          name: name.trim(),
          participantIds: picked.map((p) => p.id),
        }),
      ),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onClose();
      setPicked([]);
      setName("");
      router.push(`/chat/${conversation.id}`);
    },
  });

  if (!open) return null;

  const people = (search.data ?? []).filter(
    (u) => u.id !== me?.id && !picked.some((p) => p.id === u.id),
  );
  const canCreate = name.trim().length > 0 && picked.length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col border border-line bg-ink">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-serif text-xl text-paper">New group</h2>
          <button type="button" onClick={onClose} className="text-mute hover:text-paper">
            Close
          </button>
        </div>
        <div className="space-y-3 p-4">
          <Input
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Add people by name or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {picked.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {picked.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPicked((list) => list.filter((x) => x.id !== p.id))}
                  className="border border-brass/40 px-2 py-1 font-mono text-[11px] text-brass"
                >
                  {p.name} ×
                </button>
              ))}
            </div>
          ) : (
            <p className="font-mono text-[11px] text-mute">Select at least two other people.</p>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {debounced.length >= 2 && search.isPending ? (
            <div className="space-y-2 px-4 pb-4">
              <Skeleton />
            </div>
          ) : null}
          {people.map((user) => (
            <UserRow key={user.id} user={user} pending={false} onPick={() => setPicked((l) => [...l, user])} />
          ))}
        </div>
        <div className="border-t border-line p-4">
          {create.isError ? (
            <p className="mb-2 text-sm text-signal">
              {create.error instanceof ApiError ? create.error.message : "Could not create group"}
            </p>
          ) : null}
          <Button
            variant="signal"
            className="w-full"
            disabled={!canCreate || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Opening line…" : "Create group"}
          </Button>
        </div>
      </div>
    </div>
  );
}
