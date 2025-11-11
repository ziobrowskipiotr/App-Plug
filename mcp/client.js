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

await client.connect(serverParams);

const app = express();

app.use(express.json());
app.post('/chat',async(req,res)=>{
    if(!req.body.text){ 
        return res.status(404).json({
            message: "No text passed"
        });
    }
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: req.body.text,
        config: {
            tools: [mcpToTool(client)],
        }
    }); 
    
    return res.status(200).json({
        message: response.text
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
