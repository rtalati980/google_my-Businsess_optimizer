'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../layout';
import { apiService } from '@/lib/api';
import { Post } from '@/lib/types';
import {
  Sparkles, AlertCircle, Loader2, Send, Edit3, Check, Clock,
  Image as ImageIcon, Zap, Target, TrendingUp, Copy, Trash2
} from 'lucide-react';

interface PostTemplate {
  name: string;
  emoji: string;
  value: string;
  description: string;
  color: string;
  example: string;
}

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
  const [tabActive, setTabActive] = useState('create');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const postTemplates: PostTemplate[] = [
    {
      name: 'Weekly Update',
      emoji: '📅',
      value: 'WEEKLY',
      description: 'Build customer loyalty with consistent weekly updates about your business.',
      color: 'from-blue-500 to-cyan-500',
      example: '👋 Happy Monday! We\'re open and excited to serve you this week!'
    },
    {
      name: 'Festival Greetings',
      emoji: '🎉',
      value: 'FESTIVAL',
      description: 'Engage customers during holidays and local celebrations.',
      color: 'from-purple-500 to-pink-500',
      example: '🎄 Wishing you a magical holiday season!'
    },
    {
      name: 'Special Offers',
      emoji: '🔥',
      value: 'PROMOTION',
      description: 'Drive sales with time-limited promotions and exclusive deals.',
      color: 'from-orange-500 to-red-500',
      example: '⚡ Limited time: 20% OFF all services this weekend only!'
    },
    {
      name: 'Product Showcase',
      emoji: '✨',
      value: 'PRODUCT',
      description: 'Highlight your best offerings and specialty items.',
      color: 'from-yellow-500 to-amber-500',
      example: '🌟 Check out our new premium selection in stock now!'
    },
  ];

  const fetchPosts = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      const data = await apiService.getPosts(selectedLocation.id);
      setPosts(data);
      setErrorMsg('');
    } catch (err) {
      console.error('Error fetching posts:', err);
      setErrorMsg('Failed to load campaign history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    setActiveDraft(null);
    setDraftContent('');
  }, [selectedLocation]);

  // Dynamic AI Image Text-Overlay Generator
  const generateBrandedImage = (topicText: string) => {
    if (!selectedLocation) return '';
    const bizName = selectedLocation.name;
    const bizCategory = selectedLocation.category || 'local business';
    const cleanTopic = (topicText || 'Special Offer').replace(/["']/g, '');
    const randomSeed = Math.floor(Math.random() * 1000000);
    const prompt = encodeURIComponent(
      `A professional marketing banner for "${bizName}" (${bizCategory}). The banner features the text "${cleanTopic}" in bold, modern, clean typography. High contrast, premium graphic design, corporate branding, social media template style, 4k resolution`
    );
    return `https://image.pollinations.ai/prompt/${prompt}?width=600&height=400&nologo=true&seed=${randomSeed}`;
  };

  const handleGeneratePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      setGenerating(true);
      const post = await apiService.generatePost(selectedLocation.id, postType, topic, includeImage);
      if (includeImage) {
        post.mediaUrl = generateBrandedImage(topic || post.topic || 'Special Announcement');
      }
      setActiveDraft(post);
      setDraftContent(post.content);
      setTopic('');
      setTabActive('edit');
      setSuccessMsg('✨ Post generated! Review and customize it below.');
    } catch (err: any) {
      console.error('Error generating post:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to generate post. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!activeDraft) return;
    try {
      setSaving(true);
      setErrorMsg('');
      const updated = await apiService.updatePost(activeDraft.id, draftContent, activeDraft.mediaUrl);
      setActiveDraft(updated);
      await fetchPosts();
      setSuccessMsg('Draft saved successfully!');
    } catch (err: any) {
      console.error('Error saving draft:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishPost = async (postId: string, isFromDraft: boolean = false) => {
    try {
      setPublishing(true);
      setErrorMsg('');

      if (isFromDraft && activeDraft) {
        if (!draftContent || draftContent.trim().length === 0) {
          setErrorMsg('Post content cannot be empty');
          setPublishing(false);
          return;
        }
        if (draftContent.length > 300) {
          setErrorMsg(`Post exceeds 300 character limit (Current: ${draftContent.length})`);
          setPublishing(false);
          return;
        }
        await apiService.updatePost(activeDraft.id, draftContent, activeDraft.mediaUrl);
      }

      await apiService.publishPost(postId);
      if (isFromDraft) {
        setActiveDraft(null);
        setDraftContent('');
      }
      await fetchPosts();
      setSuccessMsg('✅ Post published to Google Business Profile!');
      setTabActive('history');
    } catch (err: any) {
      console.error('Error publishing post:', err);
      const statusCode = err.response?.status;
      let message = 'Failed to publish post';

      if (statusCode === 400) message = 'Invalid post content. Please check and try again.';
      else if (statusCode === 401) message = 'Authentication failed. Please reconnect your account.';
      else if (statusCode === 403) message = 'You don\'t have permission to publish this post.';
      else if (statusCode === 500) message = 'Server error. Please try again later.';
      else message = err.response?.data?.message || message;

      setErrorMsg(message);
    } finally {
      setPublishing(false);
    }
  };

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDraft) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 2MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setActiveDraft({ ...activeDraft, mediaUrl: reader.result });
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAiImageGeneration = () => {
    if (!selectedLocation || !activeDraft) return;
    const topicText = topic || activeDraft.topic || 'Special Announcement';
    const generatedUrl = generateBrandedImage(topicText);
    setActiveDraft({ ...activeDraft, mediaUrl: generatedUrl });
  };

  if (!selectedLocation) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
        <div className="text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-lg font-semibold">No Location Selected</p>
          <p className="text-sm">Please select a business location to create posts.</p>
        </div>
      </div>
    );
  }

  const currentTemplate = postTemplates.find(t => t.value === postType);
  const publishedCount = posts.filter(p => p.status === 'PUBLISHED').length;
  const draftCount = posts.filter(p => p.status === 'DRAFT').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Posts Builder</h1>
            <p className="text-sm text-muted-foreground">Create engaging posts that drive customer engagement</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-black text-primary">{posts.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Campaigns</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-black text-emerald-500">{publishedCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Published</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-black text-amber-500">{draftCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Drafts</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-black text-foreground">{selectedLocation.name.split(' ').length}</div>
          <div className="text-xs text-muted-foreground mt-1">Location Words</div>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-sm font-medium flex items-start gap-2">
          <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Campaign Creator */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-4">
            <h2 className="text-lg font-black mb-5 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              New Campaign
            </h2>

            <form onSubmit={handleGeneratePost} className="space-y-5">
              {/* Template Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Campaign Type</label>
                <div className="space-y-2">
                  {postTemplates.map((template) => (
                    <button
                      key={template.value}
                      type="button"
                      onClick={() => setPostType(template.value)}
                      className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${
                        postType === template.value
                          ? `bg-gradient-to-r ${template.color} text-white border-transparent shadow-lg`
                          : 'bg-secondary/40 border-border hover:bg-secondary/60 text-foreground'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5">{template.emoji}</span>
                        <div>
                          <div className="font-bold text-sm">{template.name}</div>
                          <div className="text-xs opacity-85 mt-0.5 leading-relaxed">{template.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Add Details</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={`Example: ${currentTemplate?.example || 'Add specific details for your post...'}`}
                  rows={4}
                  className="w-full bg-background border border-border text-foreground text-sm rounded-xl p-3 focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                />
              </div>

              {/* Image Option */}
              <label className="flex items-center gap-3 p-3 bg-secondary/40 border border-border rounded-xl cursor-pointer hover:bg-secondary/60 transition-all">
                <input
                  type="checkbox"
                  checked={includeImage}
                  onChange={(e) => setIncludeImage(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background accent-primary"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">Add Featured Image</div>
                  <div className="text-xs text-muted-foreground">Include a custom banner with your post</div>
                </div>
              </label>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 gradient-bg hover:opacity-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate with AI
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Draft & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Draft Editor */}
          {activeDraft && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-in slide-in-from-top duration-300">
              <div className="mb-4 pb-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></div>
                  <span className="font-bold text-foreground">Draft Editor</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  postType === 'PROMOTION' ? 'bg-red-500/10 text-red-500' :
                  postType === 'FESTIVAL' ? 'bg-purple-500/10 text-purple-500' :
                  postType === 'PRODUCT' ? 'bg-yellow-500/10 text-yellow-600' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {postType}
                </span>
              </div>

              <div className="space-y-5">
                {/* Content Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Post Content</label>
                    <div className={`text-xs font-bold ${
                      draftContent.length > 300 ? 'text-red-500' :
                      draftContent.length > 250 ? 'text-amber-500' :
                      'text-emerald-500'
                    }`}>
                      {draftContent.length}/300 characters
                    </div>
                  </div>
                  <textarea
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value.slice(0, 300))}
                    rows={5}
                    className={`w-full bg-background border rounded-xl p-4 text-foreground text-sm focus:outline-none resize-none ${
                      draftContent.length > 300
                        ? 'border-destructive focus:ring-1 focus:ring-destructive/30'
                        : 'border-border focus:ring-1 focus:ring-primary/30'
                    }`}
                  />
                  {draftContent.length > 300 && (
                    <div className="flex items-center gap-2 text-destructive text-xs font-semibold">
                      <AlertCircle className="h-4 w-4" />
                      Post exceeds Google limit (reduce by {draftContent.length - 300} chars)
                    </div>
                  )}
                </div>

                {/* Image Section */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Featured Image</label>
                  <div className="space-y-2">
                    {activeDraft.mediaUrl ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-border bg-background h-40">
                          <img
                            src={activeDraft.mediaUrl}
                            alt="Campaign preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setActiveDraft({ ...activeDraft, mediaUrl: '' })}
                            className="absolute top-2 right-2 p-1.5 bg-destructive hover:bg-destructive/90 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="file"
                          id="media-upload"
                          accept="image/*"
                          onChange={handleLocalUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('media-upload')?.click()}
                          className="p-3 border border-border hover:bg-secondary/40 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold text-foreground"
                        >
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          Upload Photo
                        </button>
                        <button
                          type="button"
                          onClick={handleAiImageGeneration}
                          className="p-3 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold text-primary"
                        >
                          <Sparkles className="h-4 w-4" />
                          AI Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 border border-border hover:bg-secondary/40 text-foreground font-bold rounded-xl transition-all text-sm"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Save Draft'}
                </button>
                <button
                  onClick={() => handlePublishPost(activeDraft.id, true)}
                  disabled={publishing || draftContent.length > 300 || !draftContent.trim()}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  {publishing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Publish
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Campaign History */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-foreground">Campaign History</h3>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
                <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-foreground font-semibold mb-1">No campaigns yet</p>
                <p className="text-xs text-muted-foreground">Create your first campaign above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => {
                  const isPublished = post.status === 'PUBLISHED';
                  return (
                    <div
                      key={post.id}
                      className={`bg-card border ${
                        isPublished
                          ? 'border-border'
                          : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
                      } rounded-xl p-4 space-y-3 shadow-sm`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-foreground capitalize text-sm">{post.postType}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">{post.content}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${
                          isPublished
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {isPublished ? '✓ Published' : '⏱ Draft'}
                        </span>
                      </div>

                      {post.mediaUrl && (
                        <div className="rounded-lg overflow-hidden border border-border h-32">
                          <img
                            src={post.mediaUrl}
                            alt="Campaign"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {!isPublished && (
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <button
                            onClick={() => {
                              setActiveDraft(post);
                              setDraftContent(post.content);
                            }}
                            className="flex-1 py-1.5 text-xs font-bold text-primary hover:underline transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handlePublishPost(post.id, false)}
                            disabled={publishing}
                            className="flex-1 py-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/25 rounded transition-all"
                          >
                            {publishing ? 'Publishing...' : 'Publish'}
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
