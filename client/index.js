import readline from 'readline/promises';
import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv';
config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatHistory = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})


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