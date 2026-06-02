import React, { useState } from "react";
import { 
  FileCode, Copy, Check, Terminal, ExternalLink, Download, 
  Settings, Server, CheckSquare, Sparkles 
} from "lucide-react";
import { BtpScope, BtpRoleCollection } from "../types";
import { 
  generateXsSecurityJson, generateMtaYaml, generateServerJs 
} from "../data";

interface ConfigExporterProps {
  scopes: BtpScope[];
  roleCollections: BtpRoleCollection[];
  xsAppName: string;
}

export default function ConfigExporter({ scopes, roleCollections, xsAppName }: ConfigExporterProps) {
  const [activeTab, setActiveTab] = useState<"xs-security" | "mta" | "server">("xs-security");
  const [copied, setCopied] = useState(false);

  const getCodeString = () => {
    switch (activeTab) {
      case "xs-security":
        return generateXsSecurityJson(scopes, roleCollections, xsAppName);
      case "mta":
        return generateMtaYaml(xsAppName);
      case "server":
        return generateServerJs(xsAppName);
      default:
        return "";
    }
  };

  const handleCopyCode = () => {
    const code = getCodeString();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getFileName = () => {
    switch (activeTab) {
      case "xs-security": return "xs-security.json";
      case "mta": return "mta.yaml";
      case "server": return "server.js";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[650px] overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5 mb-5 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileCode className="text-emerald-600 w-4.5 h-4.5" />
            Project Descriptor & Security Config Exporter
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Export generated cloud descriptors mapping dynamic security role configurations, compile and deploy directly onto SAP BTP.
          </p>
        </div>

        {/* Copy / Action panel */}
        <button
          onClick={handleCopyCode}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all outline-none border cursor-pointer ${
            copied 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
          id="copy-config-code-btn"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 animate-scale" /> Copied File Code!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" /> Copy {getFileName()}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Navigation / Explanatory files index */}
        <div className="lg:col-span-1 flex flex-col gap-2 border-r border-slate-100 pr-4 shrink-0">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-2">Export Selection</span>
          
          <button
            onClick={() => setActiveTab("xs-security")}
            className={`w-full text-left p-3 rounded-lg border text-xs font-semibold font-mono flex items-center justify-between transition-all ${
              activeTab === "xs-security" 
                ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                : "border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            }`}
            id="tab-xs-security-btn"
          >
            <span>xs-security.json</span>
            <Settings className="w-3.5 h-3.5 opacity-65" />
          </button>

          <button
            onClick={() => setActiveTab("mta")}
            className={`w-full text-left p-3 rounded-lg border text-xs font-semibold font-mono flex items-center justify-between transition-all ${
              activeTab === "mta" 
                ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                : "border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            }`}
            id="tab-mta-btn"
          >
            <span>mta.yaml</span>
            <FileCode className="w-3.5 h-3.5 opacity-65" />
          </button>

          <button
            onClick={() => setActiveTab("server")}
            className={`w-full text-left p-3 rounded-lg border text-xs font-semibold font-mono flex items-center justify-between transition-all ${
              activeTab === "server" 
                ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                : "border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            }`}
            id="tab-server-btn"
          >
            <span>server.js</span>
            <Server className="w-3.5 h-3.5 opacity-65" />
          </button>

          {/* Explanation notes card */}
          <div className="bg-sky-50/60 rounded-lg p-3.5 border border-sky-100 mt-auto text-[10px] text-sky-800 leading-relaxed space-y-1.5">
            <span className="font-bold flex items-center gap-1"><Sparkles className="w-3 h-3 text-sky-700 hover:animate-spin" /> Live Synchronized files!</span>
            <p>Every added scope or restructured role-collection binds instantly and modifies the outputs. Run <code className="bg-sky-100 px-1 py-0.2 rounded font-mono font-bold">mbt build</code> to build your BTP package archive before deploy.</p>
          </div>
        </div>

        {/* Code display card editor (3/4 width) */}
        <div className="lg:col-span-3 flex flex-col min-h-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-inner">
          {/* Editor Header Bar */}
          <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-800 shrink-0 text-slate-400 font-mono text-[10px] uppercase font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="ml-2 font-semibold text-slate-500 select-none">EDITOR / {getFileName()}</span>
            </div>
            <span>Read Only</span>
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 scroll-smooth leading-normal select-text">
            <pre className="whitespace-pre select-text h-full" id="config-code-preview">{getCodeString()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
