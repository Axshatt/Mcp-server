import readline from 'readline/promises';
import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv';
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"
config();

let tools = []
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const client = new Client({
    name: "example-client",
    version: "1.0.0",
})

const chatHistory = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})
const transport = new SSEClientTransport(new URL("http://localhost:3000/sse"))
await client.connect(transport).then(
    async () => {
        console.log("Connected to MCP Server");

        tools = (await client.listTools()).tools.map(tool => {
            return {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: tool.inputSchema.type,
                    properties: tool.inputSchema.properties,
                    required: tool.inputSchema.required
                }
            }
        })


        chatLoop()

    })


async function chatLoop(toolCall) {

    if (toolCall) {
        chatHistory.push({
            role: "model",
            parts: [
                {
                    text: `Calling tool ${toolCall.name}`,
                    type: "text"
                }
            ]
        })
        const toolResult = await client.callTool({
            name: toolCall.name,
            arguments: toolCall.args
        })

        chatHistory.push({
            role: "user",
            parts: [
                {
                    type: "text",
                    text: `Tool result is ${toolResult.content[0].text}`
                }
            ]
        })


    } else {


        const question = await rl.question("You: ")
        if (question.toLowerCase() === "exit") {
            console.log("Chat ended.");
            rl.close();
            process.exit(0);
        }
        chatHistory.push({
            role: "user",
            parts: [
                {
                    text: question,
                    type: "text"
                }
            ]
        })
    }


    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: chatHistory,
        config: {
            tools: [
                {
                    functionDeclarations: tools
                }
            ]
        }

    })
    const fnCall = response.candidates[0].content.parts[0].functionCall;
    const responseText = response.candidates[0].content.parts[0].text;

    console.log(response.candidates[0].content.parts[0]);

    if (fnCall) {
        return chatLoop(fnCall)
    }



    chatHistory.push({
        role: "model",
        parts: [
            {
                text: responseText,
                type: "text"
            }
        ]
    })
    console.log("AI: " + responseText);




    chatLoop()

}
