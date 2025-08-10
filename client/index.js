import readline from 'readline/promises';
import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv';
import {Client} from "@modelcontextprotocol/sdk/client/index.js"
import {SSEClientTransport} from "@modelcontextprotocol/sdk/client/sse.js"
config();


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const client = new Client({
    name:"example-client",
    version:"1.0.0",
})

const chatHistory = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})
const transport = new SSEClientTransport(new URL("http://localhost:3000/sse"))

client.connect

async function chatLoop() {

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


    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: chatHistory

    })
    const responseText = response.candidates[0].content.parts[0].text;
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
chatLoop()