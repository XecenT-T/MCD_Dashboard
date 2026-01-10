const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');
const Chat = require('../models/Chat');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithGemini = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        // Fetch User Context
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ msg: "User not found" });

        // Retrieve existing chat history
        let chat = await Chat.findOne({ user: userId });
        if (!chat) {
            chat = new Chat({
                user: userId,
                messages: []
            });
        }

        // Context Prompt Construction
        const systemPrompt = `
        You are the "MCD Personal Assistant" for the Municipal Corporation of Delhi.
        User: ${user.name} (${user.role}).
        
        Style: Professional, helpful, concise. Use Markdown.
        
        (Simulated Data Context):
        - Attendance: Data unavailable (System Under Construction).
        - Payroll: Data unavailable (System Under Construction).
        - Grievances: Check "My Grievances" section.
        
        History:
        ${chat.messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}
        
        User Query: ${message}
        `;

        // Start Chat
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Persist Message and Reply
        chat.messages.push({ role: 'user', content: message });
        chat.messages.push({ role: 'model', content: text });
        chat.updatedAt = Date.now();
        await chat.save();

        res.json({ reply: text });

    } catch (err) {
        console.error("Gemini Chat Error:", err);
        res.status(500).json({ msg: "Sorry, I'm having trouble connecting to the AI service right now." });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const chat = await Chat.findOne({ user: req.user.id });
        if (!chat) {
            return res.json([]);
        }
        res.json(chat.messages);
    } catch (err) {
        console.error("Get History Error:", err);
        res.status(500).send("Server Error");
    }
};

exports.refineText = async (req, res) => {
    try {
        const { text, language } = req.body;

        if (!text || !text.trim()) {
            return res.json({ refinedText: text });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
        You are an expert editor. 
        Input Text (${language || 'en'}): "${text}"
        
        Task: 
        1. Correct any spelling or grammar mistakes.
        2. Fix context errors common in speech-to-text (e.g., "right" vs "write").
        3. Keep the meaning EXACTLY the same. Do not summarize.
        4. Return ONLY the corrected text. Do not add quotes or preambles.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const refinedText = response.text().trim();

        res.json({ refinedText });

    } catch (err) {
        console.error("Gemini Refine Error:", err);
        // Fallback to original text if error
        res.json({ refinedText: req.body.text });
    }
};
