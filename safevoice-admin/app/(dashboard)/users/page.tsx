"use client";

import React, { useState, useEffect } from "react";
import { usersService } from "@/lib/api/users";
import { UserDTO, UserRole } from "@/types/api";
import { Search, Shield, UserX, Loader2, Plus, Trash2, X, Ban, Clock, CheckCircle2 } from "lucide-react";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: "",
    password: "",
    nickname: ""
  });

  // Role Assignment Modal State
  const [roleUser, setRoleUser] = useState<UserDTO | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');

  // Suspension Modal State
  const [suspendUser, setSuspendUser] = useState<UserDTO | null>(null);
  const [suspendDuration, setSuspendDuration] = useState("DAYS_7");
  const [suspendReason, setSuspendReason] = useState("");

  // Slide-out Drawer Detail State
  const [selectedDetailUser, setSelectedDetailUser] = useState<UserDTO | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await usersService.getUsers(0, 50, searchQuery);
      setUsers(response.content || []);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setErrorMsg(err.message || "Failed to fetch users from backend API.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    
    try {
      await usersService.createUser(createFormData);
      alert("User created successfully!");
      setIsCreateModalOpen(false);
      setCreateFormData({ email: "", password: "", nickname: "" });
      fetchUsers();
    } catch (error: any) {
      setErrorMsg("Failed to create user: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!roleUser) return;
    setIsSubmitting(true);
    try {
      await usersService.updateUserRole(roleUser.id, selectedRole);
      setUsers(users.map(u => u.id === roleUser.id ? { ...u, role: selectedRole } : u));
      setRoleUser(null);
    } catch (err: any) {
      alert("Error updating role: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendUser) return;
    if (!suspendReason.trim()) {
      alert("Please provide a reason for the suspension.");
      return;
    }
    setIsSubmitting(true);
    try {
      await usersService.suspendUser(suspendUser.id, suspendDuration, suspendReason);
      setUsers(users.map(u => u.id === suspendUser.id ? { ...u, status: 'SUSPENDED' } : u));
      setSuspendUser(null);
      setSuspendReason("");
    } catch (err: any) {
      alert("Error suspending user: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBanUser = async (user: UserDTO) => {
    const reason = prompt(`Enter permanent ban reason for user ${user.nickname}:`);
    if (!reason) return;

    try {
      await usersService.banUser(user.id, reason);
      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'BANNED' } : u));
    } catch (err: any) {
      alert("Error banning user: " + err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) {
      try {
        await usersService.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err: any) {
        alert("Failed to delete user: " + err.message);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    (user.nickname && user.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Users Management</h1>
          <p className="text-zinc-400 mt-1">Manage platform community profiles, RBAC roles, and safety actions.</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center space-x-3">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 bg-zinc-900/80 text-white shadow-sm ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 backdrop-blur-xl transition-all"
            />
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-xl shadow-sm hover:bg-indigo-500 transition-all"
          >
            <Plus className="h-5 w-5 mr-1.5" />
            Add User
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
            <p>Loading user accounts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/80 text-xs uppercase font-semibold text-zinc-400 border-b border-zinc-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">User Profile</th>
                  <th scope="col" className="px-6 py-4">Role</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Joined</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors cursor-pointer" onClick={() => setSelectedDetailUser(user)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="Avatar" className="h-10 w-10 flex-shrink-0 rounded-full shadow-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {user.nickname ? user.nickname.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">{user.nickname || "No Nickname"}</div>
                          <div className="text-zinc-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { setRoleUser(user); setSelectedRole(user.role); }}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
                            : user.role === 'MODERATOR'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                        }`}
                        title="Click to change role"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : user.status === 'SUSPENDED'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {user.status === 'ACTIVE' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {user.status === 'SUSPENDED' && <Clock className="h-3 w-3 mr-1" />}
                        {user.status === 'BANNED' && <Ban className="h-3 w-3 mr-1" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {user.status === 'ACTIVE' && (
                          <button 
                            onClick={() => setSuspendUser(user)}
                            className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Suspend User (Temporary)"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}

                        {user.status !== 'BANNED' && (
                          <button 
                            onClick={() => handleBanUser(user)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Ban User (Permanent)"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}

                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Permanently Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && !loading && (
              <div className="p-12 text-center text-zinc-500">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Create New User</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={createFormData.email}
                  onChange={e => setCreateFormData({...createFormData, email: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
                <input 
                  required
                  type="password" 
                  value={createFormData.password}
                  onChange={e => setCreateFormData({...createFormData, password: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nickname</label>
                <input 
                  required
                  type="text" 
                  value={createFormData.nickname}
                  onChange={e => setCreateFormData({...createFormData, nickname: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. ModeratorAlex"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {roleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Change Role for {roleUser.nickname}</h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Select User Role</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="USER">USER (Community Member)</option>
                <option value="MODERATOR">MODERATOR (Moderation Queue Access)</option>
                <option value="ADMIN">ADMIN (Full Control)</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
              <button onClick={() => setRoleUser(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button 
                onClick={handleUpdateRole} 
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {suspendUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Suspend {suspendUser.nickname}</h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Suspension Duration</label>
              <select
                value={suspendDuration}
                onChange={e => setSuspendDuration(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white outline-none"
              >
                <option value="DAYS_1">24 Hours (1 Day)</option>
                <option value="DAYS_7">7 Days</option>
                <option value="DAYS_30">30 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Reason</label>
              <textarea
                required
                rows={3}
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                placeholder="Reason for suspension..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white outline-none resize-none"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
              <button onClick={() => setSuspendUser(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button 
                onClick={handleSuspendUser} 
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Slide-out Drawer */}
      {selectedDetailUser && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div 
            className="fixed inset-0"
            onClick={() => setSelectedDetailUser(null)}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">User Profile Details</h2>
              <button 
                onClick={() => setSelectedDetailUser(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card */}
              <div className="flex items-center space-x-4 p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                {selectedDetailUser.avatarUrl ? (
                  <img src={selectedDetailUser.avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500/30" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    {selectedDetailUser.nickname ? selectedDetailUser.nickname.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedDetailUser.nickname}</h3>
                  <p className="text-xs text-zinc-400">{selectedDetailUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {selectedDetailUser.role}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                      selectedDetailUser.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : selectedDetailUser.status === 'SUSPENDED'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {selectedDetailUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Biography</h4>
                <p className="text-sm text-zinc-300 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/80">
                  {selectedDetailUser.bio || "No biography provided."}
                </p>
              </div>

              {/* Engagement Telemetry Grid */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Community Activity</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                    <div className="text-xs text-zinc-500">Topics Created</div>
                    <div className="text-xl font-bold text-white mt-1">{selectedDetailUser.topicsCount ?? 0}</div>
                  </div>
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                    <div className="text-xs text-zinc-500">Comments Posted</div>
                    <div className="text-xl font-bold text-white mt-1">{selectedDetailUser.commentsCount ?? 0}</div>
                  </div>
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                    <div className="text-xs text-zinc-500">Likes Received</div>
                    <div className="text-xl font-bold text-indigo-400 mt-1">{selectedDetailUser.likesReceived ?? 0}</div>
                  </div>
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                    <div className="text-xs text-zinc-500">Poll Votes</div>
                    <div className="text-xl font-bold text-purple-400 mt-1">{selectedDetailUser.pollVotesCount ?? 0}</div>
                  </div>
                </div>
              </div>

              {/* Account Metadata */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Account Metadata</h4>
                <div className="space-y-2 text-xs text-zinc-400 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="font-mono text-zinc-300">{selectedDetailUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joined Platform:</span>
                    <span>{selectedDetailUser.createdAt ? new Date(selectedDetailUser.createdAt).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/80 flex items-center space-x-3">
              <button
                onClick={() => { setRoleUser(selectedDetailUser); setSelectedRole(selectedDetailUser.role); }}
                className="flex-1 py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Change Role
              </button>
              {selectedDetailUser.status === 'ACTIVE' && (
                <button
                  onClick={() => setSuspendUser(selectedDetailUser)}
                  className="flex-1 py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-medium transition-colors"
                >
                  Suspend
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
