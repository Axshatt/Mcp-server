const readline= require('readline/promises')
const  {GoogleGenAI}  = require('@google/genai') 
require('dotenv').config();

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

const chatHistory = [];

const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout,   
})


async function chatLoop(){
    
    const responseText = response.candidates[0].content.parts[0].text;
    chatHistory.push({
        role:"user",
        parts:[
            {
                text:responseText,
                type:"text"
            }
        ]
    })

    const response = await ai.models.generateContent({
        model:"gemini-2.5-flash",
        contents:chatHistory

    }) 
    console.log("AI: "+responseText);
    chatLoop()
    
}
chatLoop()