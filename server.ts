import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// API Endpoints

// BTP Security AI Copilot Chat
app.post("/api/btp/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API is not configured. Please add GEMINI_API_KEY to your secrets.",
      });
    }

    // Build contents with optional chat history
    let contents = [];
    if (history && Array.isArray(history)) {
      contents = history.map((h: any) => ({
        role: h.role,
        parts: [{ text: h.text }],
      }));
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const systemInstruction = `You are a SAP BTP Security & User Identity Architect.
Your goal is to guide developers on configuring User Management, IAS (Identity Authentication Service), and XSUAA (XML Schema User Account and Authentication) inside SAP BTP (Cloud Foundry or Kyma).
- Understand xs-security.json specifications.
- Help craft role collections, group attributes mapping, and SCIM API queries.
- Answer questions on deploying applications securely with Approuter, @sap/xssec, and @sap/xsenv.
- Provide clear, modular, best-practice code blocks (e.g. CAP CDS definitions, Java Spring Security, Node/Express @sap/xssec middleware).
Keep answers highly technical, crisp, well-structured, and helpful.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// Real Token Decoder
app.post("/api/btp/decode-token", (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required." });
    }

    // JWT token is structured as three parts separated by dots: Header, Payload, Signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return res.status(400).json({ error: "Invalid JWT format. Must be a 3-part base64 encoded JWT." });
    }

    const decodeBase64 = (str: string) => {
      // Normalize base64 encoded string before parsing
      let normalized = str.replace(/-/g, "+").replace(/_/g, "/");
      while (normalized.length % 4) {
        normalized += "=";
      }
      return Buffer.from(normalized, "base64").toString("utf-8");
    };

    const header = JSON.parse(decodeBase64(parts[0]));
    const payload = JSON.parse(decodeBase64(parts[1]));

    // Check if it looks like a typical BTP XSUAA token or standard SAP JWT
    const isXsuaa = !!(payload.xs && payload.xs.system_attributes || payload.scope || payload.user_id);

    res.json({
      header,
      payload,
      isXsuaa,
      signatureLengthBytes: parts[2].length,
    });
  } catch (error: any) {
    res.status(400).json({ error: "Failed to decode JWT: " + error.message });
  }
});

// App Info Context
app.get("/api/btp/config-info", (req, res) => {
  res.json({
    subaccountName: "ais-dev-sandbox",
    region: "us-east5",
    iasTenant: "https://sandbox-ias-service.accounts.ondemand.com",
    apiEndpoint: "https://api.cf.us-east5.hana.ondemand.com",
    xsAppName: "btp-user-explorer",
    availableRoles: ["BTP_Admin", "BTP_Developer", "BTP_Viewer", "BTP_Manager"],
  });
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
