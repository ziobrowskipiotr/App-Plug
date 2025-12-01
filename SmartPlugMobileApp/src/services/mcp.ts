import axios from "axios";

const MCP_API_BASE_URL =
  process.env.EXPO_PUBLIC_MCP_BASE_URL || "http://localhost:3001";

const mcpApi = axios.create({
  baseURL: MCP_API_BASE_URL,
  timeout: 30000, // Longer timeout for AI responses
  headers: {
    "Content-Type": "application/json",
  },
});

export interface McpChatRequest {
  text: string;
}

export interface McpChatResponse {
  message: string;
}

export const mcpService = {
  /**
   * POST /chat
   * Send a message to the MCP client and get AI response
   */
  async sendMessage(text: string): Promise<string> {
    try {
      console.log("Sending message to MCP:", MCP_API_BASE_URL);
      const response = await mcpApi.post<McpChatResponse>("/chat", {
        text,
      } as McpChatRequest);

      return response.data.message || "No response from AI";
    } catch (error: any) {
      console.error("MCP API error:", error);

      if (error.response) {
        // Server responded with error status
        const errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        console.error("Error requesting to MCP:", error.request);
        throw new Error(
          "Unable to connect to MCP server. Please ensure the MCP client is running."
        );
      } else {
        // Error setting up the request
        throw new Error(error.message || "Failed to send message");
      }
    }
  },
};
