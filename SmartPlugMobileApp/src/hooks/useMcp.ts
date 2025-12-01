import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mcpService } from "@/src/services/mcp";
import { deviceKeys } from "./useDevices";

interface UseMcpOptions {
  onError?: (error: Error) => void;
  onSuccess?: (response: string) => void;
}

export const useMcp = (options: UseMcpOptions = {}) => {
  const { onError, onSuccess } = options;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (message: string): Promise<string> => {
      if (!message.trim()) {
        throw new Error("Message cannot be empty");
      }
      return await mcpService.sendMessage(message);
    },
    onSuccess: (response) => {
      // Invalidate device queries since MCP actions might have changed device states
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      // Also invalidate all device details and stats
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });

      onSuccess?.(response);
    },
    onError: (err: any) => {
      const errorMessage = err?.message || "Failed to send message";
      const errorObj = new Error(errorMessage);
      onError?.(errorObj);
      console.error("MCP error:", err);
    },
  });

  const sendMessage = async (message: string): Promise<string | null> => {
    try {
      const response = await mutation.mutateAsync(message);
      return response;
    } catch {
      // Error is already handled by onError callback
      return null;
    }
  };

  return {
    isLoading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
    sendMessage,
    clearError: mutation.reset,
    mutation,
  };
};
