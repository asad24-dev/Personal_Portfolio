"use strict";

const fs = require("fs");
const path = require("path");

const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`;

const PORTFOLIO_FILE = path.join(process.cwd(), "index.html");
const FALLBACK_CONTEXT = [
    "Name: Muhammad Asad Majeed.",
    "Education: UCL Computer Science.",
    "Roles: Software Engineering Intern at Cuvama, incoming Software Engineering Intern at Google, Robotics Instructor at BlueShift Education, IT Assistant at UCL One Desk.",
    "Projects: IFRC Virtual Situation Room, ForeSight, WonderRoute, Finance Tracker, Job Assistant.",
    "Skills: Python, React, Node.js, FastAPI, LangChain, RAG, PostgreSQL, Docker, AWS, Java, TypeScript, Tailwind.",
    "Contact: asadmajeed2005@gmail.com, linkedin.com/in/muhammad-asad-majeed, github.com/asad24-dev."
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
                    parts: [{ text: buildSystemPrompt(buildPortfolioContext()) }]
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

function buildSystemPrompt(portfolioContext) {
    return [
        "You are the portfolio assistant for Muhammad Asad Majeed.",
        "Answer only questions about Muhammad Asad Majeed, his education, experience, projects, skills, contact routes, and professional fit.",
        "Use only the portfolio context below. Do not invent facts, dates, employers, links, achievements, private details, or live web information.",
        "Politely refuse unrelated questions, private personal questions, speculation, medical/legal/financial advice, or anything not grounded in the portfolio context.",
        "Keep answers factual, concise, and professional. Use 2 to 4 short sentences. No markdown.",
        "",
        "Portfolio context:",
        portfolioContext
    ].join("\n");
}

function buildPortfolioContext() {
    try {
        const html = fs.readFileSync(PORTFOLIO_FILE, "utf8");
        const blocks = [
            makeBlock("Hero", extractBetween(html, "id=\"main-home\"", "class=\"marquee-wrap\"")),
            makeBlock("Toolkit", extractToolkit(html)),
            makeBlock("About", extractSection(html, "About")),
            makeBlock("Experience", extractSection(html, "Experience")),
            makeBlock("Projects", extractSection(html, "Projects")),
            makeBlock("Contact", extractSection(html, "Contact")),
            makeBlock("Footer links", extractBetween(html, "<footer", "</footer>")),
            makeBlock("Visible links", extractLinks(html))
        ].filter(Boolean);

        const context = blocks.join("\n\n").slice(0, 14000).trim();
        return context || FALLBACK_CONTEXT;
    } catch {
        return FALLBACK_CONTEXT;
    }
}

function extractSection(html, id) {
    return extractBetween(html, `id="${id}"`, "</section>");
}

function extractBetween(html, startNeedle, endNeedle) {
    const startIndex = html.indexOf(startNeedle);
    if (startIndex === -1) return "";

    const blockStart = html.lastIndexOf("<", startIndex);
    const contentStart = blockStart === -1 ? startIndex : blockStart;
    const endIndex = html.indexOf(endNeedle, startIndex);
    if (endIndex === -1) return html.slice(contentStart);

    return html.slice(contentStart, endIndex + endNeedle.length);
}

function extractToolkit(html) {
    const matches = [...html.matchAll(/<span class="marquee-item"(?: aria-hidden="true")?>([\s\S]*?)<\/span>/g)]
        .filter(match => !match[0].includes("aria-hidden"))
        .map(match => cleanText(match[1]));

    return matches.length ? `Core toolkit: ${matches.join(", ")}` : "";
}

function extractLinks(html) {
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
        .map(([, href, label]) => {
            const text = cleanText(label);
            return text && href && !href.startsWith("#") && !href.includes("_HERE") ? `${text}: ${href}` : "";
        })
        .filter(Boolean);

    return Array.from(new Set(links)).join("\n");
}

function makeBlock(label, html) {
    const text = cleanText(html);
    return text ? `${label}:\n${text}` : "";
}

function cleanText(html) {
    return decodeHtml(String(html || "")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim());
}

function decodeHtml(value) {
    return value
        .replace(/&mdash;/g, "-")
        .replace(/&middot;/g, "·")
        .replace(/&rarr;/g, "->")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'");
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
