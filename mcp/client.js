import { GoogleGenAI, mcpToTool} from '@google/genai';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import dotenv from "dotenv";
import express from "express";
const serverParams = new StreamableHTTPClientTransport(new URL("http://localhost:3000/mcp"));

dotenv.config();

const client = new Client(
  {
    name: "mcp_client",
    version: "1.0.0"
  }
);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

let conversationHistory = [];

await client.connect(serverParams);

const app = express();

app.use(express.json());
app.post('/chat',async(req,res)=>{
    if(!req.body.text){ 
        return res.status(404).json({
            message: "No text passed"
        });
    }
    const userMessage = { role: "user", parts: [{ text: req.body.text }] };
    conversationHistory.push(userMessage);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: conversationHistory,
            config: {
                tools: [mcpToTool(client)],
            }
        });

        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            conversationHistory.push(response.candidates[0].content);
        }

        return res.status(200).json({
            message: response.text
        });

    } catch (error) {
        console.error("Gemini Error:", error);
        conversationHistory.pop();
        return res.status(500).json({ message: "Internal Error", error: error.toString() });
    }
});

app.post('/reset', (req,res)=>{
    conversationHistory = [];
    res.status(200).json({
        message: 'Conversation history cleared.'
    });
});

const port = parseInt(process.env.PORT || 3001);
app.listen(port, ()=>{
    console.log("mcp client as an api running on http://localhost:3001");
    console.log("use /chat endpoint with body.text");
}).on('error', async error=>{
    console.error("Server error: ", error);
    await client.close();
    process.exit(1);
});
