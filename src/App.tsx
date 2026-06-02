import React, { useState } from "react";
import { 
  Users, ShieldAlert, Sparkles, Sliders, FileCode, Check, 
  Terminal, Cpu, HelpCircle, Activity, ChevronRight 
} from "lucide-react";

// Components
import IdentityContext from "./components/IdentityContext";
import UserDirectory from "./components/UserDirectory";
import RoleSecurityCatalog from "./components/RoleSecurityCatalog";
import ConfigExporter from "./components/ConfigExporter";
import TokenDebugger from "./components/TokenDebugger";
import SecurityCopilot from "./components/SecurityCopilot";

// Initial static dataset
import { 
  INITIAL_USERS, 
  INITIAL_SCOPES, 
  INITIAL_ROLE_COLLECTIONS 
} from "./data";
import { BtpUser, BtpScope, BtpRoleCollection } from "./types";

export default function App() {
  // Main reactive states for the directory mappings
  const [users, setUsers] = useState<BtpUser[]>(INITIAL_USERS);
  const [scopes, setScopes] = useState<BtpScope[]>(INITIAL_SCOPES);
  const [roleCollections, setRoleCollections] = useState<BtpRoleCollection[]>(INITIAL_ROLE_COLLECTIONS);
  const [xsAppName, setXsAppName] = useState("btp-app-financials");

  const [activeTab, setActiveTab] = useState<"users" | "catalog" | "debugging" | "exporter" | "copilot">("users");
  const [selectedUserId, setSelectedUserId] = useState<string>(INITIAL_USERS[0].id);

  // Live Audit trace log state matching the Bento theme
  const [logs, setLogs] = useState<string[]>([
    "[10:14:02] Joined global subaccount production-core-finance.",
    "[10:12:40] XSUAA JWT validation middleware active.",
    "[10:11:55] Loaded default SAP Cloud IAS integration config.",
    "[10:09:44] Identity directory replication completed successfully."
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 4)]);
  };

  // Sync log triggers whenever directory states update
  React.useEffect(() => {
    addLog(`Subaccount replication changed: ${users.length} active mappings synced.`);
  }, [users.length]);

  React.useEffect(() => {
    addLog(`Role collections updated: ${roleCollections.length} mappings present.`);
  }, [roleCollections.length]);

  React.useEffect(() => {
    addLog(`Scope matrix compiled: $XSAPPNAME contains ${scopes.length} policies.`);
  }, [scopes.length]);

  React.useEffect(() => {
    addLog(`BTP deployment target bound to client sb-${xsAppName}.`);
  }, [xsAppName]);

  // Sync users list to remove deleted role collection assignments so we don't leak stale values
  const handleUpdateUsersRolesOnDelete = (deletedCollectionName: string) => {
    setUsers(prev => prev.map(u => ({
      ...u,
      roleCollections: u.roleCollections.filter(c => c !== deletedCollectionName)
    })));
  };

  return (
    <div className="min-h-screen bg-slate-5 w-full font-sans flex flex-col antialiased">
      {/* Top Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shrink-0 flex items-center justify-between" id="app-top-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#002d62] rounded-xl flex items-center justify-center font-bold text-sm tracking-wide text-white border border-slate-200 shrink-0">
            BTP
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              BTP Identity Explorer
            </h1>
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
              Subaccount: <span className="text-blue-600 font-mono">production-us10-fiori</span>
            </span>
          </div>
        </div>

        {/* Status flags */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 flex items-center shadow-sm select-none">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            Connected to Cloud Foundry
          </div>
          <button 
            onClick={() => addLog("Forced IAS Directory Directory synchronization request.")}
            className="bg-blue-600 hover:bg-blue-750 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:shadow transition-all"
          >
            Sync Directory
          </button>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 flex flex-col min-h-0">
        
        {/* Bento Grid Header / KPI Overview Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="btp-bento-grid-overview">
          {/* KPI 1: Active Directory Users */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-[#0056b3]/30">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Active Users</span>
            <div className="mt-4 flex items-end gap-2 justify-between">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">{users.filter(u => u.active).length}</span>
                <span className="text-green-600 text-xs font-bold mb-1 font-mono">+12%</span>
              </div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Live in IAS</span>
            </div>
          </div>

          {/* KPI 2: Access Templates */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-[#0056b3]/30">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Role Collections</span>
            <div className="mt-4 flex items-end gap-2 justify-between">
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">{roleCollections.length}</span>
              </div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Global Definitions</span>
            </div>
          </div>

          {/* KPI 3: Identity Claims */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-[#0056b3]/30">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Default Identity Provider</span>
            <div className="mt-4 flex items-end gap-2 justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">Identity service</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase">IAS ACTIVE</span>
              </div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold font-mono">OIDC Standard</span>
            </div>
          </div>

          {/* KPI 4: Live Simulated Audit Terminal */}
          <div className="bg-slate-900 rounded-2xl p-4 shadow-md flex flex-col justify-between h-[105px] overflow-hidden text-white font-mono" id="btp-live-audit-mini">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1 bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Real-time Audit Logs</span>
              </div>
              <span className="text-[8px] text-slate-500">Live feed</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-[9px] text-[#2ebd59] scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((logLine, idx) => (
                <div key={idx} className="truncate font-mono">
                  <span className="text-blue-400 font-bold">{logLine.slice(0, 10)}</span>
                  <span>{logLine.slice(10)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subaccount context bar */}
        <IdentityContext appName={xsAppName} setAppName={setXsAppName} />

        {/* Tab Selection Row */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex flex-wrap gap-1 md:gap-2 shrink-0" id="tabs-navigation-panel">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer outline-none ${
              activeTab === "users" 
                ? "bg-[#002d62] text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            id="tab-btn-users"
          >
            <Users className="w-4 h-4" /> BTP User Directory
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer outline-none ${
              activeTab === "catalog" 
                ? "bg-[#002d62] text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            id="tab-btn-catalog"
          >
            <ShieldAlert className="w-4 h-4" /> Role & Scope Catalog
          </button>

          <button
            onClick={() => setActiveTab("debugging")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer outline-none ${
              activeTab === "debugging" 
                ? "bg-[#002d62] text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            id="tab-btn-debugging"
          >
            <Terminal className="w-4 h-4" /> JWT Debugger & Simulator
          </button>

          <button
            onClick={() => setActiveTab("exporter")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer outline-none ${
              activeTab === "exporter" 
                ? "bg-[#002d62] text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            id="tab-btn-exporter"
          >
            <FileCode className="w-4 h-4" /> Config Exporter
          </button>

          <button
            onClick={() => setActiveTab("copilot")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer outline-none ${
              activeTab === "copilot" 
                ? "bg-[#002d62] text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            id="tab-btn-copilot"
          >
            <Cpu className="w-4 h-4" /> Security Advisor (AI)
          </button>
        </div>

        {/* Tab view panels */}
        <div className="flex-1 min-h-0 bg-slate-5 flex flex-col" id="main-workspace-tab-contents">
          {activeTab === "users" && (
            <UserDirectory 
              users={users} 
              setUsers={setUsers}
              roleCollections={roleCollections} 
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
            />
          )}

          {activeTab === "catalog" && (
            <RoleSecurityCatalog 
              scopes={scopes} 
              setScopes={setScopes}
              roleCollections={roleCollections} 
              setRoleCollections={setRoleCollections}
              updateUsersRolesOnDelete={handleUpdateUsersRolesOnDelete}
            />
          )}

          {activeTab === "debugging" && (
            <TokenDebugger 
              users={users} 
              activeUserId={selectedUserId}
              scopes={scopes}
              xsAppName={xsAppName}
            />
          )}

          {activeTab === "exporter" && (
            <ConfigExporter 
              scopes={scopes} 
              roleCollections={roleCollections} 
              xsAppName={xsAppName} 
            />
          )}

          {activeTab === "copilot" && (
            <SecurityCopilot appName={xsAppName} />
          )}
        </div>
      </main>

      {/* Footer bar */}
      <footer className="bg-slate-900 text-slate-400 py-4 px-6 border-t border-slate-800 shrink-0 text-center text-xs justify-between flex items-center">
        <span>SAP BTP Secure User Directory Playground - Full Stack Workspace</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-[#3498db]">
            <Activity className="w-3.5 h-3.5" /> Core Status: Operational
          </span>
          <span className="opacity-30">|</span>
          <span>Powered by Gemini 3.5 Flash</span>
        </div>
      </footer>
    </div>
  );
}
