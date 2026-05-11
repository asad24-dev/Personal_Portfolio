"use strict";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`;

const SYSTEM_PROMPT = [
    "You are the portfolio assistant for Muhammad Asad Majeed.",
    "Answer only questions about Muhammad Asad Majeed, his education, experience, projects, skills, contact routes, and professional fit.",
    "Politely refuse unrelated questions, private personal questions, speculation, medical/legal/financial advice, or anything not grounded in the provided facts.",
    "Keep answers factual, concise, and professional. Use 2 to 4 short sentences. No markdown.",
    "",
    "Facts:",
    "Name: Muhammad Asad Majeed.",
    "Location: London.",
    "Education: Computer Science student at UCL.",
    "Current role: Software Engineering Intern at Cuvama, building AI-driven B2B SaaS data pipelines, dashboards, and taxonomy automation across production infrastructure.",
    "Incoming role: Software Engineering Intern at Google, Summer 2026.",
    "Experience: Robotics Instructor at BlueShift Education, teaching programming and Arduino-based embedded systems. IT Assistant at UCL One Desk, providing technical support and IT services.",
    "Projects: IFRC Virtual Situation Room, a multi-agent RAG pipeline ingesting humanitarian data from HDX, Copernicus, and GDELT with verification and taxonomy mapping for the International Federation of Red Cross.",
    "Projects: ForeSight, a geopolitical risk platform using Perplexity API and event graphs to surface supply-chain signals.",
    "Projects: WonderRoute, an AI trip planner using Gemini, Google Maps, ratings, and collaborative itineraries.",
    "Projects: Finance Tracker, a personal finance tracker with data visualisation and spending categorisation.",
    "Projects: Job Assistant, an LLM-powered job application helper for role matching and application drafts.",
    "Skills: Python, TypeScript, JavaScript, Java, SQL, React, Node.js, FastAPI, Tailwind, PostgreSQL, Docker, AWS, Git, REST APIs, LangChain, RAG pipelines, LLM APIs, evaluation workflows.",
    "Contact: asadmajeed2005@gmail.com, LinkedIn at linkedin.com/in/muhammad-asad-majeed, GitHub at github.com/asad24-dev."
].join("\n");

module.exports = async function handler(req, res) {
    setJsonHeaders(res);

    if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
    }

    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed. Use POST." });
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: "Ask is not configured yet." });
        return;
    }

    const body = parseBody(req.body);
    const question = String(body?.question || "").trim();
    if (!question) {
        res.status(400).json({ error: "Ask needs a question." });
        return;
    }

    if (question.length > 600) {
        res.status(413).json({ error: "Question is too long. Keep it under 600 characters." });
        return;
    }

    try {
        const geminiRes = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                contents: [{
                    role: "user",
                    parts: [{ text: question }]
                }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 320
                }
            })
        });

        const data = await geminiRes.json().catch(() => ({}));
        if (!geminiRes.ok) {
            res.status(502).json({ error: readGeminiError(data) });
            return;
        }

        const answer = readGeminiAnswer(data);
        if (!answer) {
            res.status(502).json({ error: "Ask returned an empty answer." });
            return;
        }

        res.status(200).json({ answer });
    } catch {
        res.status(502).json({ error: "Ask is unavailable right now." });
    }
};

function setJsonHeaders(res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
}

function parseBody(body) {
    if (typeof body !== "string") return body || {};

    try {
        return JSON.parse(body);
    } catch {
        return {};
    }
}

function readGeminiAnswer(data) {
    return data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();
}

function readGeminiError(data) {
    return data?.error?.message || "Ask provider failed. Try again later.";
}
