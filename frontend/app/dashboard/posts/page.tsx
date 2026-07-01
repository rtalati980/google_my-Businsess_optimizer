'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../layout';
import { apiService } from '@/lib/api';
import { Post } from '@/lib/types';
import { 
  Megaphone, Sparkles, AlertCircle, Loader2, 
  Send, Edit3, Calendar, Check, Save, Clock
} from 'lucide-react';

export default function PostsPage() {
  const { selectedLocation } = useDashboard();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postType, setPostType] = useState('WEEKLY');
  const [topic, setTopic] = useState('');
  const [activeDraft, setActiveDraft] = useState<Post | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [includeImage, setIncludeImage] = useState(true);

  const fetchPosts = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      const data = await apiService.getPosts(selectedLocation.id);
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    setActiveDraft(null);
    setDraftContent('');
  }, [selectedLocation]);

  const handleGeneratePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;
    try {
      setGenerating(true);
      const post = await apiService.generatePost(selectedLocation.id, postType, topic, includeImage);
      setActiveDraft(post);
      setDraftContent(post.content);
      setTopic('');
    } catch (err) {
      console.error('Error generating post:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!activeDraft) return;
    try {
      setSaving(true);
      const updated = await apiService.updatePost(activeDraft.id, draftContent, activeDraft.mediaUrl);
      setActiveDraft(updated);
      await fetchPosts();
    } catch (err) {
      console.error('Error saving draft:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishPost = async (postId: string, isFromDraft: boolean = false) => {
    try {
      setPublishing(true);
      if (isFromDraft && activeDraft) {
        // Validate post before publishing
        if (!draftContent || draftContent.trim().length === 0) {
          alert('Post content cannot be empty. Please add content to your post.');
          return;
        }
        if (draftContent.length > 300) {
          alert('Post exceeds Google API limit of 300 characters. Current: ' + draftContent.length + ' chars. Please shorten your post.');
          return;
        }
        // Save first before publishing
        await apiService.updatePost(activeDraft.id, draftContent, activeDraft.mediaUrl);
      }
      await apiService.publishPost(postId);
      if (isFromDraft) {
        setActiveDraft(null);
        setDraftContent('');
      }
      await fetchPosts();
      alert('✓ Post published successfully to Google Business Profile!');
    } catch (err: any) {
      console.error('Error publishing post:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to publish post';
      const statusCode = err.response?.status;

      let userMessage = 'Error publishing post: ' + errorMsg;
      if (statusCode === 400) {
        userMessage = 'Invalid post data. Make sure:\n- Post has content\n- Website URL is valid\n- Post is not too long (max 300 chars for Google API)';
      } else if (statusCode === 401) {
        userMessage = 'Authentication failed. Please reconnect your Google Business Profile.';
      } else if (statusCode === 403) {
        userMessage = 'Access denied. You may not have permission to publish posts for this location.';
      }

      alert(userMessage);
    } finally {
      setPublishing(false);
    }
  };

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!selectedLocation || !file || !activeDraft) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit. Please choose a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setActiveDraft({ ...activeDraft, mediaUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAiImageGeneration = () => {
    if (!selectedLocation || !activeDraft) return;
    const topicText = topic || activeDraft.topic || 'promotions';
    const bizCategory = selectedLocation.category || 'local business';
    const randomSeed = Math.floor(Math.random() * 1000000);
    
    const promptText = encodeURIComponent(
      `commercial high-resolution product showcase photo for a ${bizCategory} business, featuring topic: ${topicText}, professional photography, cinematic lighting, 4k`
    );
    const generatedUrl = `https://image.pollinations.ai/prompt/${promptText}?width=600&height=400&nologo=true&seed=${randomSeed}`;
    setActiveDraft({ ...activeDraft, mediaUrl: generatedUrl });
  };

  if (!selectedLocation) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-primary mb-2" />
        <p>Please select a business location first.</p>
      </div>
    );
  }

  const postTypes = [
    { label: 'Weekly Update 📅', value: 'WEEKLY', desc: 'Promote customer trust with consistent weekly updates.' },
    { label: 'Festival Greetings 🎉', value: 'FESTIVAL', desc: 'Greet local customers for holidays or local events.' },
    { label: 'Promotional Offer 🔥', value: 'PROMOTION', desc: 'Drive conversion by sharing active codes or services sales.' },
    { label: 'Product Showcase ✨', value: 'PRODUCT', desc: 'Highlight a specific menu item, catalog listing, or service.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">GMB Posts Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Draft weekly updates, promotions, and holiday greeting posts that keep customers engaged.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Generator Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-black mb-4 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-primary" /> Create Campaign
            </h3>
            
            <form onSubmit={handleGeneratePost} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Campaign Type
                </label>
                <div className="space-y-2">
                  {postTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        postType === type.value 
                          ? 'bg-primary/5 border-primary text-foreground' 
                          : 'bg-card border-border hover:bg-secondary text-muted-foreground'
                      }`}
                    >
                      <input
                        type="radio"
                        name="postType"
                        value={type.value}
                        checked={postType === type.value}
                        onChange={() => setPostType(type.value)}
                        className="mt-0.5 text-primary focus:ring-primary focus:outline-none"
                      />
                      <div>
                        <span className="font-bold text-foreground block">{type.label}</span>
                        <span className="text-[10px] leading-relaxed block mt-0.5">{type.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Notes & Details (Optional)
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  placeholder="e.g., Lasagna is 15% off this weekend; we close early at 8 PM on Easter Sunday"
                  className="w-full bg-card border border-border text-xs rounded-xl p-3 focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-border">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Attach Suggested Image</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Include a high-quality relevant category photo.</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeImage}
                  onChange={(e) => setIncludeImage(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-primary/25"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating copy...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Draft Post with Claude
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Draft & History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Draft Review Panel */}
          {activeDraft && (
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-md border-primary/30 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Edit Generated Post
                </span>
                <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {activeDraft.postType}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span>Post Copy Description</span>
                    <span className={`text-[10px] font-semibold ${draftContent.length > 300 ? 'text-red-500' : draftContent.length > 250 ? 'text-yellow-500' : 'text-green-600'}`}>
                      {draftContent.length}/300 chars
                    </span>
                  </label>
                  <textarea
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    rows={6}
                    className={`w-full bg-card border rounded-xl p-3 text-sm focus:ring-1 focus:outline-none leading-relaxed ${draftContent.length > 300 ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
                  />
                  {draftContent.length > 300 && (
                    <div className="mt-2 flex items-center gap-2 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-semibold">Exceeds Google API limit (300 chars max)</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span>Campaign Media URL (Optional)</span>
                    {activeDraft.mediaUrl && (
                      <button
                        onClick={() => setActiveDraft({ ...activeDraft, mediaUrl: '' })}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Remove Image
                      </button>
                    )}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={activeDraft.mediaUrl || ''}
                      onChange={(e) => setActiveDraft({ ...activeDraft, mediaUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-card border border-border text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="file"
                        id="local-media-upload"
                        accept="image/*"
                        onChange={handleLocalUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('local-media-upload')?.click()}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 border border-border hover:bg-secondary text-[10px] font-bold rounded-xl transition-all"
                      >
                        📁 Upload Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleAiImageGeneration}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 text-[10px] font-bold rounded-xl transition-all"
                      >
                        🤖 Generate AI Image
                      </button>
                    </div>
                  </div>

                  {activeDraft.mediaUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-border max-h-[160px] flex items-center justify-center bg-secondary/10">
                      <img
                        src={activeDraft.mediaUrl}
                        alt="Campaign Preview"
                        className="max-h-[160px] w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-5">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-2 border border-border hover:bg-secondary text-xs font-bold rounded-xl transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handlePublishPost(activeDraft.id, true)}
                  disabled={publishing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-emerald-600/20"
                >
                  <Send className="h-4 w-4" />
                  {publishing ? 'Publishing...' : 'Publish to Google'}
                </button>
              </div>
            </div>
          )}

          {/* History */}
          <div className="space-y-4">
            <h3 className="text-base font-black flex items-center gap-2">
              <Megaphone className="h-4.5 w-4.5 text-muted-foreground" /> Campaigns Logs
            </h3>

            {loading ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" /> Loading archives...
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
                No past campaigns found. Create your first post using the form.
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const isPublished = post.status === 'PUBLISHED';
                  return (
                    <div key={post.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground capitalize">
                            {post.postType.toLowerCase()} post
                          </span>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPublished 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-slate-500/10 text-muted-foreground'
                        }`}>
                          {isPublished ? (
                            <>
                              <Check className="h-3 w-3" /> Published
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> Draft
                            </>
                          )}
                        </span>
                      </div>

                      {post.mediaUrl && (
                        <div className="rounded-xl overflow-hidden border border-border max-h-[220px]">
                          <img 
                            src={post.mediaUrl} 
                            alt="Campaign Media" 
                            className="w-full h-44 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                        {post.content}
                      </p>

                      {!isPublished && (
                        <div className="flex justify-end border-t border-border pt-3">
                          <button
                            onClick={() => {
                              setActiveDraft(post);
                              setDraftContent(post.content);
                            }}
                            className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Edit Draft
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
