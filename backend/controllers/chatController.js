const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');
const Chat = require('../models/Chat');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Grievance = require('../models/Grievance');
const DepartmentNotice = require('../models/DepartmentNotice');

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

        // Fetch Real Context Data in Parallel
        const [attendance, payroll, grievances, notices] = await Promise.all([
            Attendance.find({ user: userId }).sort({ date: -1 }).limit(30),
            Payroll.find({ user: userId }).sort({ year: -1, month: -1 }).limit(3),
            Grievance.find({ userId: userId }).select('title status department createdAt'),
            DepartmentNotice.find({ department: user.department }).sort({ date: -1 }).limit(5)
        ]);

        // Format Data for LLM
        const contextData = `
        ### User Profile
        - Name: ${user.name}
        - Role: ${user.role}
        - Department: ${user.department}
        - Ward: ${user.ward || 'N/A'}

        ### Recent Attendance (Last 30 Days)
        ${attendance.length ? attendance.map(a => `- ${new Date(a.date).toLocaleDateString()}: ${a.status} (${a.checkInTime || '-'} to ${a.checkOutTime || '-'})`).join('\n') : "No attendance records found."}

        ### Payroll History (Recent)
        ${payroll.length ? payroll.map(p => `- ${p.month}: Net Salary ₹${p.netPay} (Status: ${p.status})`).join('\n') : "No payroll records found."}

        ### My Grievances
        ${grievances.length ? grievances.map(g => `- ${new Date(g.createdAt).toLocaleDateString()}: "${g.title}" (Status: ${g.status})`).join('\n') : "No grievances submitted."}

        ### Department Notices
        ${notices.length ? notices.map(n => `- ${new Date(n.date).toLocaleDateString()}: ${n.title}\n  ${n.content.substring(0, 150)}...`).join('\n') : "No recent notices."}
        `;

        // Context Prompt Construction
        const systemPrompt = `
        You are the "MCD Personal Assistant" for the Municipal Corporation of Delhi.
        Your goal is to help the employee by answering questions based STRICTLY on the provided data below.
        
        IMPORTANT: Data IS AVAILABLE. Do NOT say the system is under construction. If you see payroll or attendance records below, state them clearly.
        
        Style: Professional, helpful, concise, empathetic. Use Markdown for formatting.
        
        
        === USER DATA CONTEXT ===
        Debug Info: UserID=${userId}, PayrollCount=${payroll.length}, AttendanceCount=${attendance.length}
        ${contextData}
        =========================

        // History:
        // ${chat.messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}
        
        User Query: ${message}
        `;

        console.log("--- SYSTEM PROMPT DEBUG ---");
        console.log("User:", user.email);
        console.log(contextData);
        console.log("---------------------------");

        // Start Chat
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

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

        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
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

exports.classifyGrievance = async (req, res) => {
    try {
        const { title, description } = req.body;

        // Input validation
        if (!title && !description) {
            return res.status(400).json({ msg: "Title or description required" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `
        You are an intelligent classification system for Municipal Corporation grievances.
        
        Context:
        - "HR": Issues related to:
            - Salary
            - Attendance
            - Leave
            - Pension
            - Promotion
            - Transfer (paperwork)
            - Medical claims
            - Service book
            - Contract payments
            - Disciplinary letters

        - "Official": Issues related to:
            - Duty allocation
            - Safety gear
            - Tools & equipment
            - Harassment by supervisor
            - Overtime assignment
            - Workplace conditions
            - Injury in field
            - Staffing problems
            - Transfer (placement)
            - Target/pressure issues

        Task:
        Analyze the provided "Title" and "Description" and classify the grievance into 'HR' or 'Official'.
        
        Rules:
        1. If the text contains keywords from the "HR" list (e.g., Salary, Leave, Pension), it MUST be classified as "HR".
        2. If the text contains keywords from the "Official" list, it MUST be classified as "Official".
        3. Output MUST be valid JSON. Do not include markdown formatting.
        
        Title: "${title || ''}"
        Description: "${description || ''}"

        Output Format:
        { "role": "HR", "confidence": 0.9 }
        OR
        { "role": "official", "confidence": 0.9 }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Clean the text to ensure it's valid JSON
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("Gemini Raw Response:", text); // Debug Log

        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonResponse = JSON.parse(cleanText);
            res.json(jsonResponse);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            console.error("Failed Text:", text);

            // Manual fallback parsing
            if (text.includes('"role": "HR"') || text.includes("'role': 'HR'")) {
                res.json({ role: 'HR', confidence: 0.8 });
            } else {
                // Default to official if ambiguous, but log it
                res.json({ role: 'official', confidence: 0 });
            }
        }

    } catch (err) {
        console.error("Grievance Classification Error:", err);
        res.status(500).json({ msg: "Classification failed" });
    }
};
