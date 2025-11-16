import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from "zod";
import express from 'express';
import util from 'node:util';
import child_process from 'node:child_process';

const PATH_SPCON = "../spc/spc-on.sh";
const PATH_SPCOFF = "../spc/spc-off.sh";
const PATH_SPCSTATE = "../spc/spc-state.sh";
const PATH_SPCVOLTAGE = "../spc/spc-voltage.sh";
const PATH_SPCCURRENT = "../spc/spc-current.sh";
const PATH_SPCENERGY_TODAY = "../spc/spc-energy-today.sh";
const PATH_SPCENERGY_YESTERDAY = "../spc/spc-energy-yesterday.sh";
const PATH_SPCENERGY = "../spc/spc-energy.sh";

const tools = [{
    name: "spc-on",
    title: "SPC On",
    description: "Enable Smart Plug",
    path: PATH_SPCON
}, {
    name: "spc-off",
    title: "SPC Off",
    description: "Disable Smart Plug",
    path: PATH_SPCOFF
}, {
    name: "spc-state",
    title: "SPC State",
    description: "Display Current Smart Plug State",
    path: PATH_SPCSTATE
}, {
    name: "spc-voltage",
    title: "SPC Voltage",
    description: "Display Smart Plug Voltage",
    path: PATH_SPCVOLTAGE
}, {
    name: "spc-current",
    title: "SPC Current",
    description: "Display Smart Plug Current",
    path: PATH_SPCCURRENT
}, {
    name: "spc-energy-today",
    title: "SPC Energy Today",
    description: "Display Smart Plug Energy Consumption Today",
    path: PATH_SPCENERGY_TODAY
}, {
    name: "spc-energy-yesterday",
    title: "SPC Energy Yesterday",
    description: "Display Smart Plug Energy Consumption Yesterday",
    path: PATH_SPCENERGY_YESTERDAY
}, {
    name: "spc-energy",
    title: "SPC Energy",
    description: "Display Smart Plug Total Energy Consumption",
    path: PATH_SPCENERGY
}];

const exec = util.promisify(child_process.exec);

const server = new McpServer({
    name: "spc",
    version: "1.0.0"
});

for (const tool of tools) {
    server.registerTool(tool.name, {
        title: tool.title,
        description: tool.description,
        outputSchema: { message: z.string() }
    },
        async () => {
            try {
                const { stdout, stderr } = await exec(tool.path);
                // console.log(stdout,stderr);
                return {
                    content: [{ type: 'text', text: JSON.stringify(stdout) }],
                    structuredContent: stdout
                }
            } catch (err) {
                console.log(err.stdout);
                return {
                    content: [{ type: 'text', text: JSON.stringify(err) }],
                    structuredContent: err
                }
            }
        }
    )
}

const app = express();
app.use(express.json());
app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});