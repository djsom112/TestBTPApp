import React, { useState, useEffect } from "react";
import { 
  Terminal, ShieldCheck, HelpCircle, Activity, Key, Copy, 
  Check, RefreshCw, Eye, EyeOff, Sliders, AlertTriangle 
} from "lucide-react";
import { BtpUser, BtpScope } from "../types";
import { generateMockBtpToken } from "../data";

interface TokenDebuggerProps {
  users: BtpUser[];
  activeUserId: string;
  scopes: BtpScope[];
  xsAppName: string;
}

export default function TokenDebugger({ users, activeUserId, scopes, xsAppName }: TokenDebuggerProps) {
  // Simulator state
  const [selectedSimUser, setSelectedSimUser] = useState<string>(activeUserId);
  const [simToken, setSimToken] = useState("");
  const [simCopied, setSimCopied] = useState(false);
  const [simDecodedHeader, setSimDecodedHeader] = useState<any>(null);
  const [simDecodedPayload, setSimDecodedPayload] = useState<any>(null);

  // Real JWT decoder state
  const [pastedJwt, setPastedJwt] = useState("");
  const [realCopied, setRealCopied] = useState(false);
  const [decodedHeader, setDecodedHeader] = useState<any>(null);
  const [decodedPayload, setDecodedPayload] = useState<any>(null);
  const [jwtError, setJwtError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedUserObject = users.find(u => u.id === selectedSimUser) || users[0];

  // Map the scopes included based on the selected user's role collections
  const gatherUserScopes = (user: BtpUser) => {
    // Collect all scopes assigned to this user's role collections
    const userScopes: string[] = [];
    user.roleCollections.forEach(rcName => {
      // Find role definition
      if (rcName === "BTP_Admin") {
        userScopes.push("$XSAPPNAME.read", "$XSAPPNAME.write", "$XSAPPNAME.admin");
      } else if (rcName === "BTP_Developer") {
        userScopes.push("$XSAPPNAME.read", "$XSAPPNAME.write");
      } else if (rcName === "BTP_Viewer") {
        userScopes.push("$XSAPPNAME.read");
      } else {
        // Fallback or custom added role collections in catalog (map all available scopes as demo or subset)
        userScopes.push("$XSAPPNAME.read");
      }
    });
    return Array.from(new Set(userScopes));
  };

  const handleSimulateJWT = () => {
    if (!selectedUserObject) return;
    const userScopes = gatherUserScopes(selectedUserObject);
    const token = generateMockBtpToken(selectedUserObject, userScopes, xsAppName);
    setSimToken(token);

    // Manual quick client-side parse of local simulated token to display in JSON tree
    try {
      const parts = token.split(".");
      const dec = (str: string) => JSON.parse(atob(str.replace(/-/g, "+").replace(/_/g, "/")));
      setSimDecodedHeader(dec(parts[0]));
      setSimDecodedPayload(dec(parts[1]));
    } catch (e) {
      console.error("Local decode error:", e);
    }
  };

  // Sync simulator selection with main directory selection
  useEffect(() => {
    if (activeUserId) {
      setSelectedSimUser(activeUserId);
    }
  }, [activeUserId]);

  // Re-generate if dependencies update
  useEffect(() => {
    handleSimulateJWT();
  }, [selectedSimUser, xsAppName, users]);

  const handleCopySimToken = () => {
    navigator.clipboard.writeText(simToken).then(() => {
      setSimCopied(true);
      setTimeout(() => setSimCopied(false), 2000);
    });
  };

  const handleDecodeRealToken = async () => {
    setJwtError("");
    setDecodedHeader(null);
    setDecodedPayload(null);
    if (!pastedJwt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/btp/decode-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: pastedJwt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to decode JWT.");
      }
      setDecodedHeader(data.header);
      setDecodedPayload(data.payload);
    } catch (err: any) {
      setJwtError(err.message || "An exception occurred parsing base64 claims.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Simulation JWT Generator (Left) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[700px] overflow-hidden">
        <div className="border-b border-slate-100 pb-4 mb-4 shrink-0 justify-between flex items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Key className="text-violet-600 w-4.5 h-4.5 animate-pulse" />
              BTP JWT Token Simulator & Playground
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Generate test XSUAA JSON Web Tokens matching your directory configuration.
            </p>
          </div>
        </div>

        {/* Configurations selector for mock user token generation */}
        <div className="flex flex-col md:flex-row gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs mb-3.5 shrink-0 justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 font-mono">Select Active Persona:</span>
            <select
              value={selectedSimUser}
              onChange={(e) => setSelectedSimUser(e.target.value)}
              className="px-2 py-1.5 border border-slate-200 focus:border-violet-500 rounded bg-white text-slate-700 outline-none text-[11px]"
              id="sim-user-select"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.roleCollections.join(", ") || "No Roles"})</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSimulateJWT}
            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold rounded shadow transition-all outline-none"
            id="regenerate-token-btn"
          >
            Regenerate Token
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
          <div>
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-1">
              <span>Token String (Encoded Base64 JWT Header.Payload.Signature)</span>
              <button
                onClick={handleCopySimToken}
                className="hover:text-slate-800 flex items-center gap-1 transition-all font-mono normal-case outline-none cursor-pointer"
              >
                {simCopied ? (
                  <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> Copied JWT</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="w-2.5 h-2.5" /> Copy String</span>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={simToken}
              className="w-full h-16 bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] text-violet-400 select-all focus:outline-none resize-none"
            />
          </div>

          {/* Parsed dynamic json views */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col min-h-[300px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono">1. Decoded JWT JOSE Header:</span>
              <div className="flex-1 bg-slate-950 border border-slate-900 rounded-lg p-3 overflow-auto max-h-[340px]">
                <pre id="sim-decoded-header" className="font-mono text-[10.5px] text-emerald-400 select-all whitespace-pre-wrap">{JSON.stringify(simDecodedHeader, null, 2)}</pre>
              </div>
            </div>
            
            <div className="flex flex-col min-h-[300px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono">2. Decoded JWT Payload (XSUAA claims):</span>
              <div className="flex-1 bg-slate-950 border border-slate-900 rounded-lg p-3 overflow-auto max-h-[340px]">
                <pre id="sim-decoded-payload" className="font-mono text-[10.5px] text-blue-400 select-all whitespace-pre-wrap">{JSON.stringify(simDecodedPayload, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real JWT Claims Parser (Right) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[700px] overflow-hidden">
        <div className="border-b border-slate-100 pb-4 mb-4 shrink-0 justify-between flex items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Terminal className="text-slate-700 w-4.5 h-4.5" />
              Active Subaccount JWT Token Parser
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Paste an active Base64 encoded token from your running BTP Approuter to parse and audit claims.
            </p>
          </div>
        </div>

        {/* Input area */}
        <div className="space-y-2 shrink-0 mb-4">
          <label className="text-[10px] text-slate-400 font-bold block uppercase">Paste Encoded Token (eyJhbGciOi...):</label>
          <div className="flex gap-2">
            <textarea
              placeholder="Paste raw BTP JWT token details to audit payload permissions..."
              value={pastedJwt}
              onChange={(e) => setPastedJwt(e.target.value)}
              className="flex-1 h-14 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs font-mono p-2.5 border border-slate-200 rounded-lg outline-none focus:border-[#0056b3] transition-all resize-none"
              id="raw-jwt-paste-input"
            />
            <button
              onClick={handleDecodeRealToken}
              disabled={loading || !pastedJwt.trim()}
              className="px-4 py-2 bg-[#002d62] hover:bg-[#0056b3] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow transition-all outline-none shrink-0 cursor-pointer text-center"
              id="decode-real-jwt-btn"
            >
              {loading ? "Decoding..." : "Parse Token"}
            </button>
          </div>
        </div>

        {/* Decoded results mapping */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 relative">
          {jwtError && (
            <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-lg border border-red-100 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">JWT Decode Exception</span>
                {jwtError}
              </div>
            </div>
          )}

          {decodedPayload ? (
            <div className="space-y-4">
              {/* Visual Health Card metrics of real token parsed */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Recognized User:</span>
                  <span className="font-bold text-slate-800 block mt-0.5 truncate">{decodedPayload.name || decodedPayload.user_name || "Guest Claims"}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Decoded Origin ID:</span>
                  <span className="font-bold text-blue-700 block mt-0.5 font-mono">{decodedPayload.origin || "Unknown provider"}</span>
                </div>
                <div className="col-span-2 md:col-span-1 bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Assigned Scopes Count:</span>
                  <span className="font-bold text-emerald-600 block mt-0.5 italic">{decodedPayload.scope ? decodedPayload.scope.length : 0} Scopes</span>
                </div>
              </div>

              {/* Scopes pill maps */}
              {decodedPayload.scope && decodedPayload.scope.length > 0 && (
                <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-25/50">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide block mb-2 font-mono">Decoded Scope Claims in Token:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {decodedPayload.scope.map((s: string) => (
                      <span key={s} className="bg-emerald-50 text-emerald-800 border-emerald-100 border text-[10px] font-mono px-2 py-0.5 rounded font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Claims json trees view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col min-h-[200px]">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Decoded JOSE Header:</span>
                  <div className="flex-1 bg-slate-950 p-3 rounded-lg overflow-auto max-h-[300px]">
                    <pre className="font-mono text-[10px] text-emerald-400 select-all whitespace-pre-wrap">{JSON.stringify(decodedHeader, null, 2)}</pre>
                  </div>
                </div>
                <div className="flex flex-col min-h-[200px]">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Full Claims Payload:</span>
                  <div className="flex-1 bg-slate-950 p-3 rounded-lg overflow-auto max-h-[300px]">
                    <pre className="font-mono text-[10px] text-blue-400 select-all whitespace-pre-wrap">{JSON.stringify(decodedPayload, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24 text-slate-400">
              <Key className="w-10 h-10 text-slate-200 mb-2.5" />
              <p className="text-xs font-semibold">No tokens decoded yet</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[280px]">Paste an authorization header JWT starting with `Bearer eyJ...` to retrieve live credentials inspect details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
