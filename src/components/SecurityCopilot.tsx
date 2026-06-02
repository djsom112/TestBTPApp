import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, Send, Sparkles, HelpCircle, User, 
  Trash2, RefreshCw, Cpu, Check, Play 
} from "lucide-react";
import { ChatMessage } from "../types";
import { motion } from "motion/react";

interface SecurityCopilotProps {
  appName: string;
}

const PRESET_PROMPTS = [
  {
    title: "AD Mapping",
    prompt: "How do I map Corporate Active Directory groups to SAP BTP Role Collections using custom attributes in XSUAA?",
    desc: "Azure AD / Okta federation"
  },
  {
    title: "xs-security vs mta",
    prompt: "Explain the architectural relationship between xs-security.json configurations and MTA resource resources in mta.yaml.",
    desc: "Descriptor bindings"
  },
  {
    title: "Backend Authorization",
    prompt: "Show me a clean Node.js Express middleware example utilizing @sap/xssec that validates if an incoming token has my custom admin scope.",
    desc: "Security APIs coding"
  },
  {
    title: "IAS & XSUAA",
    prompt: "What is SAP Cloud Identity Authentication Service (IAS) and how does it interoperate with the XSUAA service for custom corporate SSO authentication?",
    desc: "SSO Identity flows"
  }
];

export default function SecurityCopilot({ appName }: SecurityCopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "How's it going! I am your **SAP BTP Security and Identity Copilot** powered by server-side Gemini. I can help you architect role assignments, draft `xs-security.json` descriptors, write `@sap/xssec` authorize filters, or debug standard IAS SCIM APIs questions.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Map message history into standard format
      const history = messages.slice(1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/btp/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrieve Security Advisor suggestions.");
      }

      const modelMsg: ChatMessage = {
        id: "msg-" + Date.now() + "-model",
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "msg-" + Date.now() + "-error",
        role: "model",
        text: `⚠️ **Security Copilot Error:** ${err.message || "An unexpected error occurred while communicating with Gemini."}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: "How's it going! How can I assist you with your SAP BTP Security Architecture setup today?",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[700px] overflow-hidden">
      {/* Header element */}
      <div className="border-b border-slate-100 pb-4 mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5ClassName bg-slate-100">
            <Cpu className="text-[#0056b3] w-4.5 h-4.5 animate-spin-slow" />
            SAP BTP Enterprise Security Copilot
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Resolve federated Identity Directories mapping claims, SCIM queries, approuters authorization in server-side chats.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-50 transition-all scale-100 hover:scale-105"
          title="Reset Conversation"
          id="clear-copilot-chat-btn"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestion prompt pills */}
      {messages.length === 1 && (
        <div className="mb-4 shrink-0">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide mb-2">Frequently Asked questions</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PRESET_PROMPTS.map((preset) => (
              <button
                key={preset.title}
                onClick={() => handleSendMessage(preset.prompt)}
                className="text-left p-3 border border-slate-200 hover:border-blue-500 rounded-lg hover:bg-slate-50 transition-all outline-none"
              >
                <span className="font-bold text-xs text-[#0056b3] block font-mono">
                  {preset.title}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5 mt-0.5 truncate">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages console area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-xl border border-slate-100 bg-slate-25/40 min-h-0">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div 
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                isUser ? "bg-[#002d62] text-white" : "bg-[#3498db]/15 text-[#0056b3]"
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                isUser 
                  ? "bg-[#002d62] text-white rounded-tr-none" 
                  : "bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none select-text"
              }`}>
                {isUser ? (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                ) : (
                  // Custom rendering for basic markdown elements in Gemini response (bold statements, list ticks)
                  <div className="space-y-2 prose prose-slate select-text">
                    {m.text.split("\n\n").map((para, i) => {
                      if (para.startsWith("- ") || para.startsWith("* ")) {
                        // Render standard list item format
                        const items = para.split(/\n[\-\*] /);
                        return (
                          <ul key={i} className="list-disc pl-5 space-y-1 my-1 select-text">
                            {items.map((it, idx) => (
                              <li key={idx} className="select-text">
                                {it.replace(/^[\-\*]\s+/, "")}
                              </li>
                            ))}
                          </ul>
                        );
                      } else if (para.startsWith("```")) {
                        // Render simple key codes line items
                        const lines = para.split("\n");
                        const cleanCode = lines.slice(1, lines.length - 1).join("\n");
                        return (
                          <div key={i} className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-auto select-all max-h-56">
                            <code>{cleanCode}</code>
                          </div>
                        );
                      }
                      
                      // Highlight matching backticks with colors or code highlight elements
                      const parts = para.split(/(\*\*.*?\*\*|`.*?`)/g);
                      return (
                        <p key={i} className="select-text">
                          {parts.map((p, idx) => {
                            if (p.startsWith("**") && p.endsWith("**")) {
                              return <strong key={idx} className="font-bold text-slate-900 select-text">{p.slice(2, -2)}</strong>;
                            }
                            if (p.startsWith("`") && p.endsWith("`")) {
                              return <code key={idx} className="bg-slate-100 font-mono text-[11px] px-1.5 py-0.2 rounded border border-slate-200 text-[#0056b3] select-text">{p.slice(1, -1)}</code>;
                            }
                            return <span key={idx} className="select-text">{p}</span>;
                          })}
                        </p>
                      );
                    })}
                  </div>
                )}
                <span className={`block text-[8px] mt-1.5 ${isUser ? "text-blue-200/80 text-right" : "text-slate-400 text-left"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-full bg-[#3498db]/15 text-[#0056b3] flex items-center justify-center text-xs shrink-0">
              <Cpu className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 text-slate-800 shadow-sm rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500">Security Architect is typing...</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Input section form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex gap-2 shrink-0 pt-2 border-t border-slate-100"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask about security, groups attributes, IAS, scopes, or @sap/xssec...`}
          className="flex-1 px-4 py-2 text-xs border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg outline-none bg-slate-50 hover:bg-slate-100 focus:bg-white transition-all"
          id="copilot-text-input"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="px-4 py-2 bg-[#002d62] hover:bg-[#0056b3] disabled:opacity-50 text-white rounded-lg shadow-sm font-bold text-xs flex items-center gap-1 transition-all outline-none"
          id="send-copilot-btn"
        >
          Send <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
