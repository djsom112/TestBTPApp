import React, { useState } from "react";
import { 
  ShieldAlert, Plus, Trash, Check, Lock, Shield, 
  HelpCircle, Sparkles, Sliders 
} from "lucide-react";
import { BtpScope, BtpRoleCollection } from "../types";

interface RoleSecurityCatalogProps {
  scopes: BtpScope[];
  setScopes: React.Dispatch<React.SetStateAction<BtpScope[]>>;
  roleCollections: BtpRoleCollection[];
  setRoleCollections: React.Dispatch<React.SetStateAction<BtpRoleCollection[]>>;
  updateUsersRolesOnDelete: (deletedCollectionName: string) => void;
}

export default function RoleSecurityCatalog({
  scopes,
  setScopes,
  roleCollections,
  setRoleCollections,
  updateUsersRolesOnDelete,
}: RoleSecurityCatalogProps) {
  const [newScopeName, setNewScopeName] = useState("");
  const [newScopeDesc, setNewScopeDesc] = useState("");
  const [newRcName, setNewRcName] = useState("");
  const [newRcDesc, setNewRcDesc] = useState("");
  const [newRcScopes, setNewRcScopes] = useState<string[]>([]);
  
  const [scopeError, setScopeError] = useState("");
  const [rcError, setRcError] = useState("");

  const handleAddScope = (e: React.FormEvent) => {
    e.preventDefault();
    setScopeError("");

    if (!newScopeName || !newScopeDesc) {
      setScopeError("All parameters are required.");
      return;
    }

    // Standardize scope name prepending $XSAPPNAME. if missing
    let finalScopeName = newScopeName.trim();
    if (!finalScopeName.startsWith("$XSAPPNAME.")) {
      finalScopeName = `$XSAPPNAME.${finalScopeName}`;
    }

    if (scopes.some(s => s.name.toLowerCase() === finalScopeName.toLowerCase())) {
      setScopeError("Scope with this name already exists in the catalog.");
      return;
    }

    setScopes(prev => [...prev, { name: finalScopeName, description: newScopeDesc }]);
    setNewScopeName("");
    setNewScopeDesc("");
  };

  const handleDeleteScope = (scopeName: string) => {
    if (confirm(`Deleting scope ${scopeName} will remove it from all assigned Role Collections. Continue?`)) {
      setScopes(prev => prev.filter(s => s.name !== scopeName));
      // Remove this scope from all role collections
      setRoleCollections(prev => prev.map(rc => ({
        ...rc,
        scopes: rc.scopes.filter(s => s !== scopeName)
      })));
    }
  };

  const handleAddRc = (e: React.FormEvent) => {
    e.preventDefault();
    setRcError("");

    if (!newRcName || !newRcDesc) {
      setRcError("Role Collection Name and Description are required.");
      return;
    }

    // Clean name from spaces / non-alpha
    const cleanName = newRcName.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    if (roleCollections.some(rc => rc.name.toLowerCase() === cleanName.toLowerCase())) {
      setRcError("Role Collection already exists.");
      return;
    }

    const newCollection: BtpRoleCollection = {
      name: cleanName,
      description: newRcDesc,
      scopes: newRcScopes
    };

    setRoleCollections(prev => [...prev, newCollection]);
    setNewRcName("");
    setNewRcDesc("");
    setNewRcScopes([]);
  };

  const handleDeleteRc = (rcName: string) => {
    if (confirm(`Are you sure you want to delete ${rcName} Role Collection? Assigned users will lose this mapping.`)) {
      setRoleCollections(prev => prev.filter(rc => rc.name !== rcName));
      updateUsersRolesOnDelete(rcName);
    }
  };

  const toggleRcScope = (scopeName: string) => {
    setNewRcScopes(prev => 
      prev.includes(scopeName) 
        ? prev.filter(s => s !== scopeName) 
        : [...prev, scopeName]
    );
  };

  const toggleScopeOnExistingRc = (rcName: string, scopeName: string) => {
    setRoleCollections(prev => prev.map(rc => {
      if (rc.name === rcName) {
        const hasIt = rc.scopes.includes(scopeName);
        return {
          ...rc,
          scopes: hasIt 
            ? rc.scopes.filter(s => s !== scopeName)
            : [...rc.scopes, scopeName]
        };
      }
      return rc;
    }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Scope definitions Pane */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col min-h-[550px]">
        <div className="border-b border-slate-100 pb-4 mb-5 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Lock className="text-[#002d62] w-4.5 h-4.5" />
              1. SAP BTP Scopes Catalog ($XSAPPNAME)
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Scopes map to chemical permissions verified in applications. Prefix starting with <code className="bg-slate-50 italic px-1 rounded">$XSAPPNAME.</code> is automatic.
            </p>
          </div>
        </div>

        {/* Existing Scopes Map */}
        <div className="flex-1 space-y-3 mb-5 overflow-y-auto max-h-[300px] border border-slate-100 p-3 rounded-lg bg-slate-50/40">
          {scopes.map((s) => (
            <div key={s.name} className="flex justify-between items-start p-3 bg-white border border-slate-200 rounded-lg group hover:border-[#0056b3]/30 transition-all shadow-sm">
              <div className="min-w-0 pr-3">
                <span className="font-mono text-xs font-bold text-[#0056b3] block">
                  {s.name}
                </span>
                <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
                  {s.description}
                </p>
              </div>
              <button
                onClick={() => handleDeleteScope(s.name)}
                className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition-all"
                title="Delete Scope"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Scope Section */}
        <div className="bg-slate-25 p-4 rounded-xl border border-slate-100 mt-auto">
          <h4 className="font-bold text-slate-700 text-xs mb-3 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-[#002d62]" /> Design New Scope
          </h4>
          <form onSubmit={handleAddScope} className="space-y-3">
            {scopeError && <p className="text-red-500 text-[10px] bg-red-25 p-2 rounded">{scopeError}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Scope Key Name *</label>
                <div className="relative">
                  <span className="text-slate-400 font-mono text-[11px] absolute left-2 top-1/2 -translate-y-1/2">$XSAPPNAME.</span>
                  <input
                    type="text"
                    required
                    placeholder="write"
                    value={newScopeName.replace(/^\$XSAPPNAME\./, "")}
                    onChange={(e) => setNewScopeName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    className="pl-[100px] pr-2 py-2 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg text-xs outline-none w-full bg-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Human Description *</label>
                <input
                  type="text"
                  required
                  placeholder="Granted write ledger capabilities"
                  value={newScopeDesc}
                  onChange={(e) => setNewScopeDesc(e.target.value)}
                  className="px-3 py-2 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg text-xs outline-none w-full bg-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full text-center bg-[#002d62] hover:bg-[#0056b3] text-white py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all outline-none mt-2"
            >
              Add Scope to Application
            </button>
          </form>
        </div>
      </div>

      {/* Role Collection designer Pane */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col min-h-[550px]">
        <div className="border-b border-slate-100 pb-4 mb-5 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Shield className="text-[#3498db] w-4.5 h-4.5" />
              2. Design Role Collections Mapping
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Role Collections bundle multiple scopes into higher logical sets. Users take these roles upon deployment.
            </p>
          </div>
        </div>

        {/* Dynamic Role Collections Selector catalog */}
        <div className="flex-1 space-y-4 mb-5 overflow-y-auto max-h-[300px] border border-slate-100 p-3 rounded-lg bg-slate-50/40">
          {roleCollections.map((rc) => (
            <div key={rc.name} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-2">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-700 block">
                    {rc.name}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{rc.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteRc(rc.name)}
                  className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition-all"
                  title="Remove Collection"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scopes included list toggle pills */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Check Mapped Scopes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {scopes.map(s => {
                    const isSelected = rc.scopes.includes(s.name);
                    return (
                      <button
                        key={s.name}
                        onClick={() => toggleScopeOnExistingRc(rc.name, s.name)}
                        className={`text-[9.5px] px-2 py-0.5 rounded border flex items-center gap-1 font-mono transition-all ${
                          isSelected 
                            ? "bg-slate-900 text-white border-slate-900 font-bold" 
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                        {s.name.split(".").pop()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Role Collection input block */}
        <div className="bg-slate-25 p-4 rounded-xl border border-slate-100 mt-auto">
          <h4 className="font-bold text-slate-700 text-xs mb-3 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-[#3498db]" /> Draft Role Collection
          </h4>
          <form onSubmit={handleAddRc} className="space-y-3">
            {rcError && <p className="text-red-500 text-[10px] bg-red-25 p-2 rounded">{rcError}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Collection Name *</label>
                <input
                  type="text"
                  required
                  placeholder="EX_Audit_Team"
                  value={newRcName}
                  onChange={(e) => setNewRcName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                  className="px-3 py-2 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg text-xs outline-none w-full bg-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Human Description *</label>
                <input
                  type="text"
                  required
                  placeholder="Audit scopes assigned specifically."
                  value={newRcDesc}
                  onChange={(e) => setNewRcDesc(e.target.value)}
                  className="px-3 py-2 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg text-xs outline-none w-full bg-white"
                />
              </div>
            </div>

            {/* Scopes check selection for new creation */}
            <div className="pt-2">
              <label className="text-[10px] text-slate-400 font-bold block mb-1.5">Include Scopes:</label>
              <div className="flex flex-wrap gap-2">
                {scopes.map(s => {
                  const isChecked = newRcScopes.includes(s.name);
                  return (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() => toggleRcScope(s.name)}
                      className={`px-2.5 py-1 text-[10px] rounded border transition-all ${
                        isChecked 
                          ? "bg-slate-800 text-white border-slate-800 font-bold" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      {s.name.split(".").pop()}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-center bg-[#3498db] hover:bg-[#2980b9] text-white py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all outline-none mt-2"
            >
              Build Role Collection
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
