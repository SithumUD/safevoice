"use client";

import React, { useState, useEffect } from "react";
import { pollsService } from "@/lib/api/polls";
import { topicsService } from "@/lib/api/topics";
import { PollDTO, TopicDTO } from "@/types/api";
import { Plus, Search, BarChart2, Trash2, Loader2, CheckCircle2, X, Image as ImageIcon } from "lucide-react";

export default function PollsManagementPage() {
  const [polls, setPolls] = useState<PollDTO[]>([]);
  const [topics, setTopics] = useState<TopicDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    topic_id: "",
    question: "",
    media_url: "",
    is_multiple_choice: false,
    options: ["", ""], // Start with two options
    closes_at: "",
  });

  useEffect(() => {
    fetchPolls();
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await topicsService.getTopics(undefined, 'latest', 0, 100);
      setTopics(res.content || []);
    } catch (e) {
      // Ignore topic load errors for selector
    }
  };

  const fetchPolls = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await pollsService.getPolls(0, 50);
      setPolls(res.content || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load polls: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    const validOptions = formData.options.filter(o => o.trim() !== "");
    if (validOptions.length < 2) {
      setErrorMsg("You must provide at least two valid options.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newPoll = await pollsService.createPoll({
        topicId: formData.topic_id || null,
        question: formData.question,
        options: validOptions,
        isMultipleChoice: formData.is_multiple_choice,
        closesAt: formData.closes_at ? new Date(formData.closes_at).toISOString() : null,
        mediaUrl: formData.media_url || null,
      });

      setPolls([newPoll, ...polls]);
      setIsModalOpen(false);
      setFormData({ topic_id: "", question: "", media_url: "", is_multiple_choice: false, options: ["", ""], closes_at: "" });
    } catch (error: any) {
      setErrorMsg("Error creating poll: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOptionField = () => {
    setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = text;
    setFormData({ ...formData, options: newOptions });
  };

  const removeOptionField = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this poll? All voting data will be lost.")) {
      setErrorMsg(null);
      try {
        await pollsService.deletePoll(id);
        setPolls(polls.filter(p => p.id !== id));
      } catch (err: any) {
        setErrorMsg("Error deleting poll: " + err.message);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentClosesAt: string | null) => {
    setErrorMsg(null);
    const isActive = !currentClosesAt || new Date(currentClosesAt) > new Date();
    const newClosesAt = isActive ? new Date().toISOString() : null;
    
    try {
      const updated = await pollsService.togglePollStatus(id, newClosesAt);
      setPolls(polls.map(p => p.id === id ? { ...p, closesAt: updated.closesAt, status: updated.status } : p));
    } catch (err: any) {
      setErrorMsg("Error updating poll status: " + err.message);
    }
  };

  const filteredPolls = polls.filter(poll => 
    poll.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Polls</h1>
          <p className="text-zinc-400 mt-1">Create and manage community polls and view voting results.</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center space-x-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 bg-zinc-900/80 text-white shadow-sm ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 backdrop-blur-xl transition-all"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-xl shadow-sm hover:bg-indigo-500 transition-all"
          >
            <Plus className="h-5 w-5 mr-1.5" />
            Create Poll
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
          <p>Loading polls...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPolls.map((poll) => {
            const isActive = poll.status === 'OPEN' && (!poll.closesAt || new Date(poll.closesAt) > new Date());
            return (
            <div key={poll.id} className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-xl overflow-hidden hover:border-zinc-700/50 transition-all duration-300 flex flex-col">
              <div className="p-6 border-b border-zinc-800/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {isActive ? 'Active (Live)' : 'Closed'}
                    </span>
                    {poll.isMultipleChoice && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Multiple Choice
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleToggleStatus(poll.id, poll.closesAt)}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                      title={isActive ? "Close Poll" : "Reopen Poll"}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(poll.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{poll.question}</h3>
                    <p className="text-xs text-zinc-500 mt-2">
                      {poll.createdAt ? `Created ${new Date(poll.createdAt).toLocaleDateString()} • ` : ''}{poll.totalVotes || 0} total votes
                      {poll.topicId ? " • Attached to Topic" : " • Standalone Poll"}
                    </p>
                  </div>
                  {poll.mediaUrl && (
                    <div className="flex-shrink-0">
                      <img src={poll.mediaUrl} alt="Poll Media" className="h-16 w-16 object-cover rounded-lg border border-zinc-700/50" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 bg-zinc-900/30 flex-1">
                <div className="space-y-4">
                  {(poll.options || []).map((option) => {
                    const percentage = option.percentage !== undefined
                      ? option.percentage
                      : ((poll.totalVotes && poll.totalVotes > 0) 
                          ? Math.round((option.votes / poll.totalVotes) * 100) 
                          : 0);
                      
                    return (
                      <div key={option.id}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-zinc-300 font-medium">{option.label}</span>
                          <span className="text-zinc-400">{percentage}% ({option.votes || 0})</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              isActive ? 'bg-indigo-500' : 'bg-zinc-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );})}
          
          {filteredPolls.length === 0 && (
            <div className="col-span-full p-12 text-center text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
              <BarChart2 className="h-12 w-12 mx-auto mb-4 text-zinc-600 opacity-50" />
              <p className="text-lg font-medium text-zinc-300">No polls found</p>
              <p className="mt-1">Create a new poll to engage with your community.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Poll Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 flex-shrink-0">
              <h2 className="text-xl font-semibold text-white">Create New Poll</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePoll} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Attach to Topic (Optional)</label>
                <select 
                  value={formData.topic_id}
                  onChange={e => setFormData({...formData, topic_id: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">None (Standalone Poll)</option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Question</label>
                <input 
                  required
                  type="text" 
                  value={formData.question}
                  onChange={e => setFormData({...formData, question: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Should Sector 4 install solar streetlights?"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="is_multiple_choice"
                  checked={formData.is_multiple_choice}
                  onChange={e => setFormData({...formData, is_multiple_choice: e.target.checked})}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_multiple_choice" className="text-sm text-zinc-300 cursor-pointer">
                  Allow Multiple Choice Selection
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Expiry Date & Time (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={formData.closes_at}
                  onChange={e => setFormData({...formData, closes_at: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Options</label>
                <div className="space-y-3">
                  {formData.options.map((opt, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input 
                        required={index < 2}
                        type="text" 
                        value={opt}
                        onChange={e => updateOptionText(index, e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder={`Option ${index + 1}`}
                      />
                      {index >= 2 && (
                        <button 
                          type="button" 
                          onClick={() => removeOptionField(index)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {formData.options.length < 6 && (
                  <button 
                    type="button"
                    onClick={addOptionField}
                    className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
