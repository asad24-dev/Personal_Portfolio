"use strict";

const TERMINAL_FS = {
    "/": ["about.md", "cv.pdf", "contact.txt", "projects/", "skills/", "experience/"],
    "/projects/": ["ifrc-situation-room/", "foresight/", "wonderroute/", "finance-tracker/", "job-assistant/"],
    "/skills/": ["languages.txt", "frameworks.txt", "infrastructure.txt", "ai-ml.txt"],
    "/experience/": ["google-2026/", "cuvama-2025/", "blueshift-education/", "ucl-one-desk/"],
    "/contact/": ["email", "linkedin", "calendly"]
};

const TERMINAL_FILES = {
    "/about.md": [
        ["name", "Muhammad Asad Majeed"],
        ["education", "UCL Computer Science"],
        ["current", "SWE Intern @ Cuvama"],
        ["incoming", "SWE Intern @ Google, Summer 2026"],
        ["focus", "AI pipelines, multi-agent systems, full-stack products"]
    ],
    "/contact.txt": [
        ["email", "asadmajeed2005@gmail.com"],
        ["linkedin", "linkedin.com/in/muhammad-asad-majeed"],
        ["calendly", "CALENDLY_URL_HERE"]
    ],
    "/skills/languages.txt": "Python, TypeScript, JavaScript, Java, SQL",
    "/skills/frameworks.txt": "React, Node.js, FastAPI, Tailwind",
    "/skills/infrastructure.txt": "PostgreSQL, Docker, AWS, Git, REST APIs",
    "/skills/ai-ml.txt": "LangChain, RAG pipelines, LLM APIs, evaluation workflows"
};

const TERMINAL_ENTRIES = {
    "ifrc-situation-room/": {
        title: "IFRC Virtual Situation Room",
        desc: "Multi-agent RAG pipeline for humanitarian data ingestion, verification, and taxonomy mapping.",
        stack: "LangChain, RAG, Python, FastAPI, Multi-agent",
        live: "IFRC_LIVE_URL_HERE",
        github: "IFRC_GITHUB_URL_HERE"
    },
    "foresight/": {
        title: "ForeSight",
        desc: "Geopolitical risk platform using Perplexity API and event graphs for supply-chain signals.",
        stack: "Node.js, React, Tailwind, Perplexity",
        live: "https://signal-xfed.onrender.com/",
        github: "https://github.com/asad24-dev/ForeSight"
    },
    "wonderroute/": {
        title: "WonderRoute",
        desc: "AI trip planner connecting Gemini, Google Maps, ratings, and collaborative itineraries.",
        stack: "Gemini, React, Node.js, Google APIs",
        live: "https://wonderroute.onrender.com",
        github: "https://github.com/asad24-dev/WonderRoute"
    },
    "finance-tracker/": {
        title: "Finance Tracker",
        desc: "Personal finance tracker with data visualisation and spending categorisation.",
        stack: "Python, SQLite, Matplotlib",
        live: "https://ai-finance-webapp-1.onrender.com",
        github: "https://github.com/asad24-dev/AI-Finance-WebApp"
    },
    "job-assistant/": {
        title: "Job Assistant",
        desc: "LLM-powered job application helper for role matching and application drafts.",
        stack: "LLM, FastAPI, Python",
        github: "https://github.com/asad24-dev/JobApplicationAssistant"
    },
    "google-2026/": {
        title: "Google",
        desc: "Incoming Software Engineering Intern, Summer 2026.",
        stack: "London, UK"
    },
    "cuvama-2025/": {
        title: "Cuvama",
        desc: "Software Engineering Intern building AI-driven B2B SaaS data pipelines, dashboards, and taxonomy automation.",
        stack: "AI Pipelines, Python, React, Looker Studio"
    },
    "blueshift-education/": {
        title: "BlueShift Education",
        desc: "Robotics Instructor teaching programming and Arduino-based embedded systems.",
        stack: "Arduino, C++, Robotics"
    },
    "ucl-one-desk/": {
        title: "UCL One Desk",
        desc: "IT Assistant providing technical support and IT services at UCL.",
        stack: "London, UK"
    }
};

const TERMINAL_LINKS = {
    email: "mailto:asadmajeed2005@gmail.com",
    linkedin: "https://www.linkedin.com/in/muhammad-asad-majeed",
    github: "https://github.com/asad24-dev",
    calendly: "CALENDLY_URL_HERE",
    cv: "./images/Majeed_MuhammadAsad_cv (9).pdf",
    "cv.pdf": "./images/Majeed_MuhammadAsad_cv (9).pdf"
};

document.addEventListener("DOMContentLoaded", () => {
    initTerminal();
});

function initTerminal() {
    const overlay = document.getElementById("terminal-overlay");
    const form = document.getElementById("terminal-form");
    const input = document.getElementById("terminal-input");
    const output = document.getElementById("terminal-output");
    const title = document.getElementById("terminal-title");
    const prompt = document.getElementById("terminal-prompt");
    const shellTabs = Array.from(document.querySelectorAll("[data-shell]"));

    if (!overlay || !form || !input || !output || !title || !prompt) return;

    const state = {
        shell: "bash",
        cwd: "/",
        history: [],
        historyIndex: 0
    };

    function openTerminal() {
        overlay.classList.add("open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("terminal-open");
        window.setTimeout(() => input.focus(), 0);
    }

    function closeTerminal() {
        overlay.classList.remove("open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("terminal-open");
    }

    function updateTitle() {
        title.textContent = `asad@portfolio ~${state.cwd}`;
        prompt.textContent = buildPrompt(state);
        input.placeholder = state.shell === "powershell"
            ? "dir, Set-Location projects/, Start-Process foresight/, help"
            : "ls, cd projects/, open foresight/, help";
    }

    function appendLine(content = "", className = "") {
        const line = document.createElement("div");
        line.className = `terminal-line ${className}`.trim();
        line.innerHTML = content;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    async function runCommand(raw) {
        const command = raw.trim();
        if (!command) return;

        appendLine(`<span class="terminal-prompt">${escapeHtml(buildPrompt(state))}</span> <span class="terminal-cmd">${escapeHtml(command)}</span>`);
        state.history.push(command);
        state.history = state.history.slice(-20);
        state.historyIndex = state.history.length;

        const [name, ...args] = command.split(/\s+/);
        const lower = normalizeCommand(name.toLowerCase());

        if (lower === "clear" || lower === "cls") {
            output.innerHTML = "";
            return;
        }

        if (lower === "exit") {
            closeTerminal();
            return;
        }

        const result = await handleCommand(lower, args, state, appendLine);
        if (result.clear) output.innerHTML = "";
        result.lines.forEach(line => appendLine(line.html, line.className));
        updateTitle();
    }

    document.querySelectorAll("[data-terminal-open]").forEach(trigger => {
        trigger.addEventListener("click", openTerminal);
    });

    document.querySelectorAll("[data-terminal-close]").forEach(trigger => {
        trigger.addEventListener("click", closeTerminal);
    });

    shellTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            state.shell = tab.dataset.shell === "powershell" ? "powershell" : "bash";
            shellTabs.forEach(item => item.classList.toggle("active", item === tab));
            updateTitle();
            appendLine(`shell mode: <span class="terminal-key">${state.shell}</span>`, "terminal-dim");
            input.focus();
        });
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeTerminal();
    });

    document.addEventListener("keydown", event => {
        const target = event.target;
        const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;

        if (event.key === "/" && !isTyping) {
            event.preventDefault();
            openTerminal();
        }

        if (event.key === "Escape" && overlay.classList.contains("open")) {
            closeTerminal();
        }
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        runCommand(input.value);
        input.value = "";
    });

    input.addEventListener("keydown", event => {
        if (event.key === "ArrowUp") {
            event.preventDefault();
            state.historyIndex = Math.max(0, state.historyIndex - 1);
            input.value = state.history[state.historyIndex] || "";
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
            input.value = state.history[state.historyIndex] || "";
        }

        if (event.key === "Tab") {
            event.preventDefault();
            completeCommand(input, state, appendLine);
        }
    });

    updateTitle();
    appendLine("type <span class=\"terminal-key\">help</span> for commands, or press <span class=\"terminal-key\">/</span> anywhere to reopen", "terminal-dim");
}

function handleCommand(name, args, state, appendLine) {
    if (name === "help") return lines([
        "ls / dir - list files in the current directory",
        "cd / Set-Location - move between portfolio directories",
        "pwd / Get-Location - print the current directory",
        "cat / type / Get-Content - read files like about.md or contact.txt",
        "open / start / Start-Process - open project, section, CV, email, GitHub, LinkedIn, or Calendly links",
        "grep <term> projects/ - search projects by keyword",
        "tree - show the portfolio filesystem",
        "profile - print a compact bio",
        "projects / skills / contact - jump to high-signal portfolio data",
        "repo / cv / cv.pdf - open GitHub profile or CV",
        "history - show recent commands",
        "shell bash|powershell - switch terminal mode",
        "clear / cls / Clear-Host - clear output",
        "whoami / date / uname -a / exit - small system commands",
        "ask <question> - ask the portfolio assistant about Asad"
    ]);

    if (name === "pwd") return lines([state.cwd]);
    if (name === "whoami") return lines(["Muhammad Asad Majeed - UCL CS, SWE intern, AI systems builder."]);
    if (name === "date") return lines([new Date().toISOString()]);
    if (name === "uname") return lines([args[0] === "-a" ? "portfolio-os v3.0 London" : "portfolio-os"]);
    if (name === "ask") return handleAsk(args, appendLine);
    if (name === "tree") return tree();
    if (name === "profile") return readFile("/about.md", state);
    if (name === "projects") return listPath("/projects/", state);
    if (name === "skills") return listPath("/skills/", state);
    if (name === "contact") return readFile("contact.txt", state);
    if (name === "repo") return openEntry("github", state);
    if (name === "cv") return openEntry("cv", state);
    if (name === "history") return lines(state.history.length ? state.history : ["no history yet"], "terminal-dim");
    if (name === "echo") return lines([args.join(" ")]);
    if (name === "shell") return switchShell(args[0], state);

    const easter = handleEasterEgg(name, args);
    if (easter) return easter;

    if (name === "ls" || name === "dir") return listPath(args[0], state);
    if (name === "cd") return changeDirectory(args[0] || "/", state);
    if (name === "cat" || name === "type") return readFile(args[0], state);
    if (name === "open" || name === "start") return openEntry(args[0], state);
    if (name === "grep") return grepProjects(args);

    return lines([`command not found: ${escapeHtml(name)}. try help.`], "terminal-error");
}

function listPath(target, state) {
    const path = normalizePath(target || state.cwd, state.cwd, true);
    const entries = TERMINAL_FS[path];
    if (!entries) return lines([`not a directory: ${escapeHtml(target || path)}`], "terminal-error");

    return {
        lines: [{
            html: entries.map(entry => entry.endsWith("/") ? `<span class="terminal-dir">${entry}</span>` : escapeHtml(entry)).join("   "),
            className: ""
        }]
    };
}

function changeDirectory(target, state) {
    const path = normalizePath(target, state.cwd, true);
    if (!TERMINAL_FS[path]) return lines([`no such directory: ${escapeHtml(target)}`], "terminal-error");
    state.cwd = path;
    return lines([]);
}

function readFile(target, state) {
    if (!target) return lines(["usage: cat <file>"], "terminal-error");

    const path = normalizePath(target, state.cwd, false);
    const file = TERMINAL_FILES[path];
    if (!file) return lines([`no such file: ${escapeHtml(target)}`], "terminal-error");

    if (Array.isArray(file)) {
        return {
            lines: file.map(([key, value]) => ({
                html: `<span class="terminal-key">${escapeHtml(key)}:</span> <span class="terminal-string">${escapeHtml(value)}</span>`,
                className: ""
            }))
        };
    }

    return lines([escapeHtml(file)]);
}

function openEntry(target, state) {
    if (!target) return lines(["usage: open <project/company/link>"], "terminal-error");

    const linkTarget = target.replace(/^\.\/+/, "").toLowerCase();
    const clean = target.endsWith("/") ? target : `${target}/`;
    const entry = TERMINAL_ENTRIES[clean];
    if (entry) {
        const preferred = entry.live || entry.github;
        if (preferred) window.open(preferred, "_blank", "noopener");
        return describeEntry(entry, preferred ? `opened ${preferred}` : "no public link available");
    }

    const link = TERMINAL_LINKS[linkTarget];
    if (link) {
        window.open(link, "_blank", "noopener");
        return lines([`opened ${escapeHtml(link)}`]);
    }

    const sectionId = target.replace(/^#/, "");
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        return lines([`opened section #${escapeHtml(sectionId)}`]);
    }

    const path = normalizePath(target, state.cwd, true);
    const dirName = path.split("/").filter(Boolean).pop();
    const fallback = TERMINAL_ENTRIES[`${dirName}/`];
    if (fallback) return describeEntry(fallback, "entry details");

    return lines([`cannot open: ${escapeHtml(target)}`], "terminal-error");
}

async function handleAsk(args, appendLine) {
    const question = args.join(" ").trim();
    if (!question) return lines(["usage: ask <question>"], "terminal-error");

    appendLine("thinking...", "terminal-dim");

    try {
        const response = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.error) {
            return lines([data.error || "Ask failed. Try again later."], "terminal-error");
        }

        return lines([data.answer || "No answer returned."]);
    } catch {
        return lines(["Ask is unavailable right now. The server endpoint may not be deployed yet."], "terminal-error");
    }
}

function grepProjects(args) {
    const [term, path] = args;
    if (!term || path !== "projects/") return lines(["usage: grep <term> projects/"], "terminal-error");

    const matches = Object.values(TERMINAL_ENTRIES)
        .filter(entry => `${entry.title} ${entry.desc} ${entry.stack}`.toLowerCase().includes(term.toLowerCase()))
        .map(entry => `${entry.title}: ${entry.desc}`);

    return lines(matches.length ? matches.map(escapeHtml) : [`no project matches: ${escapeHtml(term)}`]);
}

function tree() {
    return lines([
        "./",
        "  about.md",
        "  contact.txt",
        "  projects/",
        "    ifrc-situation-room/",
        "    foresight/",
        "    wonderroute/",
        "    finance-tracker/",
        "    job-assistant/",
        "  skills/",
        "    languages.txt",
        "    frameworks.txt",
        "    infrastructure.txt",
        "    ai-ml.txt",
        "  experience/",
        "    google-2026/",
        "    cuvama-2025/",
        "    blueshift-education/",
        "    ucl-one-desk/"
    ]);
}

function switchShell(target, state) {
    if (!target || !["bash", "powershell", "ps"].includes(target.toLowerCase())) {
        return lines(["usage: shell bash|powershell"], "terminal-error");
    }

    state.shell = target.toLowerCase() === "bash" ? "bash" : "powershell";
    document.querySelectorAll("[data-shell]").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.shell === state.shell);
    });
    return lines([`shell mode: ${state.shell}`], "terminal-dim");
}

function handleEasterEgg(name, args) {
    const command = [name, ...args].join(" ");
    if (command === "rm -rf boring-jobs/") return lines(["nice try. but also: i'm hireable. -> asadmajeed2005@gmail.com"], "terminal-dim");
    if (command === "sudo hire-me") return lines(["[sudo] password: check my github"], "terminal-dim");
    if (command === "ls .easter-eggs/") return lines(["nothing to see here. or is there?"], "terminal-dim");
    if (command === "cat .easter-eggs/secret") return lines(["google already did."], "terminal-dim");
    return null;
}

function describeEntry(entry, status) {
    const rows = [
        `<span class="terminal-key">title:</span> <span class="terminal-string">${escapeHtml(entry.title)}</span>`,
        `<span class="terminal-key">desc:</span> ${escapeHtml(entry.desc)}`,
        `<span class="terminal-key">stack:</span> <span class="terminal-value">${escapeHtml(entry.stack)}</span>`,
        `<span class="terminal-dim">${escapeHtml(status)}</span>`
    ];

    if (entry.live) rows.splice(3, 0, `<span class="terminal-key">live:</span> ${escapeHtml(entry.live)}`);
    if (entry.github) rows.splice(3, 0, `<span class="terminal-key">github:</span> ${escapeHtml(entry.github)}`);

    return {
        lines: rows.map(row => ({ html: row, className: "" }))
    };
}

function completeCommand(input, state, appendLine) {
    const value = input.value;
    const parts = value.split(/\s+/);
    const current = parts[parts.length - 1] || "";
    const pool = ["ls", "dir", "cd", "Set-Location", "pwd", "Get-Location", "cat", "type", "Get-Content", "open", "start", "Start-Process", "grep", "tree", "profile", "projects", "skills", "contact", "repo", "cv", "ask", "history", "echo", "shell", "clear", "cls", "Clear-Host", "help", "whoami", "date", "uname", "exit"]
        .concat(TERMINAL_FS[state.cwd] || [])
        .concat(Object.keys(TERMINAL_LINKS));
    const matches = pool.filter(item => item.toLowerCase().startsWith(current.toLowerCase()));

    if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        input.value = parts.join(" ");
        return;
    }

    if (matches.length > 1) appendLine(matches.map(escapeHtml).join("   "), "terminal-dim");
}

function normalizeCommand(name) {
    const aliases = {
        "gci": "ls",
        "get-childitem": "ls",
        "sl": "cd",
        "set-location": "cd",
        "gl": "pwd",
        "get-location": "pwd",
        "gc": "cat",
        "get-content": "cat",
        "ii": "open",
        "invoke-item": "open",
        "start-process": "open",
        "clear-host": "clear"
    };

    return aliases[name] || name;
}

function buildPrompt(state) {
    if (state.shell === "powershell") {
        const psPath = state.cwd === "/" ? "asad:\\" : `asad:\\${state.cwd.replace(/^\/|\/$/g, "").replace(/\//g, "\\")}`;
        return `PS ${psPath}>`;
    }

    const bashPath = state.cwd === "/" ? "~/" : `~${state.cwd}`;
    return `asad@portfolio:${bashPath}$`;
}

function normalizePath(target = "/", cwd = "/", directory) {
    if (target === "..") {
        const parts = cwd.split("/").filter(Boolean);
        parts.pop();
        return parts.length ? `/${parts.join("/")}/` : "/";
    }

    let path = target.startsWith("/") ? target : `${cwd}${target}`;
    path = path.replace(/\/+/g, "/");

    if (directory && !path.endsWith("/")) path += "/";
    return path;
}

function lines(values, className = "") {
    return {
        lines: values.map(value => ({
            html: escapeHtml(value),
            className
        }))
    };
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
