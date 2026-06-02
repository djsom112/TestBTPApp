import React, { useState } from "react";
import { 
  User, Check, Trash, Search, Plus, Filter, UserX, UserCheck, 
  MapPin, ShieldAlert, Mail, Activity, Eye, Sliders 
} from "lucide-react";
import { BtpUser, BtpRoleCollection } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface UserDirectoryProps {
  users: BtpUser[];
  setUsers: React.Dispatch<React.SetStateAction<BtpUser[]>>;
  roleCollections: BtpRoleCollection[];
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
}

export default function UserDirectory({ 
  users, 
  setUsers, 
  roleCollections, 
  selectedUserId, 
  setSelectedUserId 
}: UserDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [originFilter, setOriginFilter] = useState("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Form states for new user
  const [newUsername, setNewUsername] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newOrigin, setNewOrigin] = useState("sap.ids");
  const [newDept, setNewDept] = useState("Finance & Audit");
  const [newUserRoles, setNewUserRoles] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  const activeUser = users.find((u) => u.id === selectedUserId) || users[0];

  const handleToggleRoleCollection = (userId: string, collName: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const hasIt = u.roleCollections.includes(collName);
        return {
          ...u,
          roleCollections: hasIt 
            ? u.roleCollections.filter(c => c !== collName)
            : [...u.roleCollections, collName]
        };
      }
      return u;
    }));
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, active: !u.active };
      }
      return u;
    }));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this BTP user mapping?")) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (selectedUserId === userId) {
        const remaining = users.filter(u => u.id !== userId);
        if (remaining.length > 0) {
          setSelectedUserId(remaining[0].id);
        }
      }
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newUsername || !newFirstName || !newLastName) {
      setFormError("All identity attributes except department are required.");
      return;
    }

    if (!newUsername.includes("@")) {
      setFormError("Username must be a valid email mapped from the core IDP.");
      return;
    }

    const newUser: BtpUser = {
      id: "u-" + Math.floor(1000 + Math.random() * 9000),
      username: newUsername,
      email: newUsername,
      firstName: newFirstName,
      lastName: newLastName,
      origin: newOrigin,
      roleCollections: newUserRoles,
      active: true,
      department: newDept
    };

    setUsers(prev => [newUser, ...prev]);
    setSelectedUserId(newUser.id);
    
    // Reset Form
    setNewUsername("");
    setNewFirstName("");
    setNewLastName("");
    setNewOrigin("sap.ids");
    setNewDept("Finance & Audit");
    setNewUserRoles([]);
    setShowAddUserModal(false);
  };

  const toggleFormSelectedRole = (role: string) => {
    setNewUserRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department || "").toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesOrigin = originFilter === "all" || u.origin === originFilter;
    return matchesSearch && matchesOrigin;
  });

  const getOriginLabel = (origin: string) => {
    switch (origin) {
      case "sap.ids": return "Default SAP ID Service";
      case "external-ias": return "SAP Cloud Identity Services (IAS)";
      case "azure-ad": return "Microsoft Entra ID (Azure AD federated)";
      default: return origin;
    }
  };

  const getOriginBadgeStyle = (origin: string) => {
    switch (origin) {
      case "azure-ad": return "bg-blue-50 text-blue-700 border-blue-200";
      case "external-ias": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "sap.ids": return "bg-slate-100 text-slate-700 border-slate-300";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List of Users Pane (2/3 width) */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[650px]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="text-[#0056b3] w-5 h-5" />
              Active BTP Subaccount Directory
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Read real-time users from Identity Directory and check their subaccount role-collections.
            </p>
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-[#002d62] hover:bg-[#0056b3] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all outline-none"
            id="add-user-btn"
          >
            <Plus className="w-4 h-4" /> Provision User
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg text-xs outline-none w-full transition-all bg-slate-25 hover:bg-slate-50"
              id="search-user-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="text-xs border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg px-3 py-2 outline-none bg-white transition-all text-slate-700"
              id="origin-filter-select"
            >
              <option value="all">All Identity Sources</option>
              <option value="sap.ids">SAP ID Service</option>
              <option value="external-ias">SAP Cloud IAS</option>
              <option value="azure-ad">Microsoft Entra</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-y-auto border border-slate-100 rounded-lg bg-slate-25/50">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UserX className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-500">No users found</p>
              <p className="text-xs text-slate-400 mt-1">Refine your active filters or provision a new user.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse" id="user-directory-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-3">Identity Origin</th>
                  <th className="py-3 px-3">Assigned Role Collections</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isSelected = user.id === selectedUserId;
                  return (
                    <tr 
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`border-b border-slate-100 hover:bg-slate-25 cursor-pointer transition-all ${
                        isSelected ? "bg-slate-50/70 border-l-4 border-l-[#0056b3]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            user.active ? "bg-[#002d62]/10 text-[#002d62]" : "bg-slate-100 text-slate-400"
                          }`}>
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-[10px] text-slate-500 block font-mono truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-block border rounded px-1.5 py-0.5 text-[9px] font-mono font-bold ${getOriginBadgeStyle(user.origin)}`}>
                          {user.origin}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {user.roleCollections.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic">None assigned</span>
                          ) : (
                            user.roleCollections.map((col) => (
                              <span 
                                key={col} 
                                className="inline-flex items-center bg-sky-50 text-sky-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-sky-100 font-mono"
                              >
                                {col}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleUserStatus(user.id);
                          }}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                            user.active 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" 
                              : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                          }`}
                        >
                          {user.active ? (
                            <>
                              <UserCheck className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" /> Locked
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUserId(user.id)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-all title='Inspect Scope Matrix'"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-all"
                            title="Delete User Map"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Role Collection Assignment Panel (1/3 width) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[650px] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#3498db]"></div>

        <div className="border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="text-[#3498db] w-4 h-4" />
            <h4 className="font-bold text-slate-800 text-sm">Security Assigner</h4>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Modify SAP BTP collections mapped in live scope.
          </p>
        </div>

        {activeUser ? (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Active User Header Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0056b3]/10 text-[#0056b3] flex items-center justify-center font-bold text-sm">
                    {activeUser.firstName[0]}{activeUser.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-800 text-xs truncate">
                      {activeUser.firstName} {activeUser.lastName}
                    </h5>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {activeUser.email}
                    </span>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] bg-slate-200 text-slate-600 rounded font-bold uppercase tracking-wide">
                      {activeUser.department || "Core Enterprise"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ID origin provider:</span>
                    <span className="font-mono font-bold text-slate-700">{getOriginLabel(activeUser.origin)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account status:</span>
                    <span className={`font-bold ${activeUser.active ? "text-emerald-600" : "text-amber-500"}`}>
                      {activeUser.active ? "Enabled/Active" : "Locked/Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role Mapping Selections */}
              <h6 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Role Collections Mapping Checkbox
              </h6>

              <div className="space-y-2 max-y-[320px] overflow-y-auto pr-1">
                {roleCollections.map((rc) => {
                  const isAssigned = activeUser.roleCollections.includes(rc.name);
                  return (
                    <div 
                      key={rc.name}
                      onClick={() => handleToggleRoleCollection(activeUser.id, rc.name)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex justify-between items-start ${
                        isAssigned 
                          ? "bg-[#0056b3]/5 border-[#0056b3] ring-1 ring-[#0056b3]/10" 
                          : "bg-white hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-xs text-slate-800 block font-mono">
                          {rc.name}
                        </span>
                        <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                          {rc.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {rc.scopes.map(s => (
                            <span key={s} className="bg-slate-100 text-slate-600 text-[8px] px-1.5 py-0.2 rounded font-mono font-medium">
                              {s.split(".").pop()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                        isAssigned 
                          ? "bg-[#002d62] border-[#002d62] text-white" 
                          : "border-slate-300 bg-slate-50"
                      }`}>
                        {isAssigned && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-25 p-3.5 rounded-lg border border-slate-100 mt-4 text-[10px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700 block mb-1">💡 BTP Platform Tip:</span>
              On SAP BTP, Role Collections are bounded to Users permanently. When a user requests resources, custom Router routes apply these claims inside the secured JSON tokens.
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-slate-400 text-xs">
            Select a BTP user from the left matrix.
          </div>
        )}
      </div>

      {/* Provision User Modal */}
      AnimatePresence
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-[#002d62] text-white px-6 py-4">
              <h4 className="font-bold text-sm">Provision New SAP BTP User</h4>
              <p className="text-blue-200 text-xs mt-0.5">Map corporate provider details to subaccount collections.</p>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-600 text-[11px] p-3 rounded-lg border border-red-100">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Username (Corporate Email) *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="user.name@enterprise.com"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg text-xs outline-none w-full bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg text-xs outline-none w-full bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg text-xs outline-none w-full bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Department</label>
                <input
                  type="text"
                  placeholder="Enterprise Controls"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="px-3 py-2 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg text-xs outline-none w-full bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Identity Provider Source Origin</label>
                <select
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="px-3 py-2 border border-slate-200 focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]/20 rounded-lg text-xs outline-none w-full bg-white text-slate-700"
                >
                  <option value="sap.ids">SAP ID Service (Default)</option>
                  <option value="external-ias">SAP Cloud IAS (Identity Authentication Service)</option>
                  <option value="azure-ad">Microsoft Entra / Azure AD Integration</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Initial Role Collections Mapping</label>
                <div className="flex gap-2flex-wrap">
                  {roleCollections.map((rc) => {
                    const isSelected = newUserRoles.includes(rc.name);
                    return (
                      <button
                        type="button"
                        key={rc.name}
                        onClick={() => toggleFormSelectedRole(rc.name)}
                        className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all ${
                          isSelected 
                            ? "bg-[#002d62] text-white border-[#002d62]" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {rc.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002d62] hover:bg-[#0056b3] text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Save & Bind
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
