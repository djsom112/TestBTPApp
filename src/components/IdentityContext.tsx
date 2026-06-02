import React from "react";
import { Building, Shield, RefreshCw, Key, HelpCircle } from "lucide-react";

interface IdentityContextProps {
  appName: string;
  setAppName: (name: string) => void;
}

export default function IdentityContext({ appName, setAppName }: IdentityContextProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
      {/* Background Accent Banner */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#002d62]"></div>
      
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Building className="w-5 h-5 text-slate-500" />
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400">
              SAP BTP Cockpit &bull; Global Account
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Subaccount ID: <code className="bg-slate-50 px-2 py-0.5 rounded text-sm text-[#0056b3] border border-slate-100 italic">production-core-finance</code>
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 max-w-xl">
            Linked to Identity Authentication Service (IAS) with tenant ID: <span className="font-mono text-slate-600 font-bold bg-slate-100 px-1 py-0.5 rounded">https://tenant-p20349.accounts.ondemand.com</span>
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-25 p-4 rounded-lg border border-slate-100 self-stretch lg:self-auto min-w-[280px]">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Region / Provider</span>
            <span className="text-xs font-semibold text-slate-700 block">AWS / us-east-5</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Runtime Engine</span>
            <span className="text-xs font-semibold text-slate-700 block text-[#0056b3]">Cloud Foundry</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">API Access Status</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Connected
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Default IdP</span>
            <span className="text-xs font-semibold text-slate-700 block">SAP Cloud IAS</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 font-mono">BTP XSAPPNAME Binding:</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">sb-</span>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
              className="pl-7 pr-3 py-1 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-mono text-slate-800 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-md outline-none transition-all w-52 font-bold"
              placeholder="my-xsappname"
              id="xt-app-name-input"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" /> Security: <strong className="text-slate-700 font-bold">OIDC / OAuth 2.0</strong>
          </span>
          <span className="flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-slate-400" /> Strategy: <strong className="text-slate-700 font-bold">Role Collections Mapping</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
