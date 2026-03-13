import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReagentRow, Session } from "../backend";
import { useActor } from "./useActor";

export function useListSessions() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, Session]>>({
    queryKey: ["sessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSession(id: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Session | null>({
    queryKey: ["session", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getSession(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useSaveSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      divisor,
      reagents,
    }: {
      id: string;
      name: string;
      divisor: number;
      reagents: ReagentRow[];
    }) => {
      if (!actor) throw new Error("Not connected");
      const rows: Array<[string, number, number]> = reagents.map((r) => [
        r.name,
        r.price,
        r.volume,
      ]);
      return actor.saveSession(id, name, divisor, rows);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session saved successfully");
    },
    onError: () => {
      toast.error("Failed to save session");
    },
  });
}

export function useDeleteSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSession(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session deleted");
    },
    onError: () => {
      toast.error("Failed to delete session");
    },
  });
}
