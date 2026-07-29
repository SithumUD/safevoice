"use client";

import React, { useState, useEffect } from "react";
import { topicsService } from "@/lib/api/topics";
import { TopicDTO, TopicCategory } from "@/types/api";
import { Plus, Search, MessageSquare, Trash2, Loader2, MessageCircle, Heart, Flame, X, UserX, Image as ImageIcon, BarChart2 } from "lucide-react";
import { CldUploadWidget } from 'next-cloudinary';

export default function TopicsManagementPage() {
  const [topics, setTopics] = useState<TopicDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "GENERAL" as TopicCategory,
    is_trending: false,
    has_poll: false,
    author_is_anonymous: false,
    media_url: "",
  });

  const categories: TopicCategory[] = ["CIVIC", "SAFETY", "EDUCATION", "COMMUNITY", "GENERAL", "POLLS"];

  useEffect(() => {
    fetchTopics();
  }, [selectedCategory]);

  const fetchTopics = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await topicsService.getTopics(selectedCategory, 'latest', 0, 50);
      setTopics(response.content || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load topics: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    
    try {
      const newTopic = await topicsService.createTopic({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        isAnonymous: formData.author_is_anonymous,
        mediaUrl: formData.media_url || null,
        mediaType: formData.media_url ? 'IMAGE' : null,
      });

      setTopics([newTopic, ...topics]);
      setIsModalOpen(false);
      setFormData({ 
        title: "", 
        description: "", 
        category: "GENERAL", 
        is_trending: false,
        has_poll: false,
        author_is_anonymous: false,
        media_url: ""
      });
    } catch (error: any) {
      setErrorMsg("Error creating topic: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to soft delete this topic?")) {
      setErrorMsg(null);
      try {
        await topicsService.deleteTopic(id);
        setTopics(topics.filter(t => t.id !== id));
      } catch (err: any) {
        setErrorMsg("Error deleting topic: " + err.message);
      }
    }
  };

  const toggleTrending = async (topic: TopicDTO) => {
    setErrorMsg(null);
    try {
      const updated = await topicsService.toggleTrending(topic.id, !topic.isTrending);
      setTopics(topics.map(t => t.id === topic.id ? { ...t, isTrending: updated.isTrending } : t));
    } catch (err: any) {
      setErrorMsg("Error updating topic trending status: " + err.message);
    }
  };

  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    topic.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Topics</h1>
          <p className="text-zinc-400 mt-1">Manage community discussion threads and categories.</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center space-x-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border-0 py-2.5 px-3 bg-zinc-900/80 text-white text-sm ring-1 ring-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Search topics..."
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
            New Topic
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
          <p>Loading topics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-xl overflow-hidden hover:border-zinc-700/50 transition-all duration-300 group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {topic.category}
                    </span>
                    {topic.isTrending && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        <Flame className="h-3 w-3 mr-1" /> Trending
                      </span>
                    )}
                    {topic.hasPoll && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" title="Has a poll attached">
                        <BarChart2 className="h-3 w-3 mr-1" /> Poll
                      </span>
                    )}
                    {topic.isAnonymous && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20" title="Posted anonymously">
                        <UserX className="h-3 w-3 mr-1" /> Anon
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => toggleTrending(topic)}
                      className="p-1.5 text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-colors"
                      title={topic.isTrending ? "Remove Trending" : "Make Trending"}
                    >
                      <Flame className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(topic.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Soft Delete Topic"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {topic.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-3 mb-4">{topic.description}</p>
                
                {topic.mediaUrl && (
                  <div className="flex items-center text-xs text-indigo-400 mt-2 mb-4 bg-indigo-500/5 px-2 py-1.5 rounded-md border border-indigo-500/10 w-fit">
                    <ImageIcon className="h-3 w-3 mr-1.5" /> Attached Media
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-zinc-800/50 bg-zinc-900/80 flex items-center justify-between mt-auto">
                <div className="flex items-center text-xs text-zinc-500">
                  <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-4 text-zinc-400 text-sm">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1.5 text-rose-400" />
                    {topic.likes || 0}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1.5 text-indigo-400" />
                    {topic.commentCount || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredTopics.length === 0 && (
            <div className="col-span-full p-12 text-center text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-zinc-600 opacity-50" />
              <p className="text-lg font-medium text-zinc-300">No topics found</p>
              <p className="mt-1">Try adjusting your search query or create a new topic.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Create New Topic</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTopic} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    placeholder="e.g. Community Streetlight Safety Initiative"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-shadow"
                    placeholder="Provide context for the civic discussion..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as TopicCategory})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Media URL (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.media_url}
                    onChange={e => setFormData({...formData, media_url: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center space-x-2 bg-zinc-950/50 px-3 py-2 rounded-lg border border-zinc-800/50">
                  <input 
                    type="checkbox" 
                    id="author_is_anonymous"
                    checked={formData.author_is_anonymous}
                    onChange={e => setFormData({...formData, author_is_anonymous: e.target.checked})}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="author_is_anonymous" className="text-sm text-zinc-300 flex items-center cursor-pointer">
                    <UserX className="h-4 w-4 mr-1.5 text-zinc-400" />
                    Post Anonymously
                  </label>
                </div>
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
                  Publish Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
