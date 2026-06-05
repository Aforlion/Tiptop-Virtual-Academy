'use client';

import React, { useState, useActionState, useTransition } from 'react';
import { createForumPost, createForumReply } from '@/app/admin/actions';
import { ForumChannel, ForumPostWithReplies, ForumReply } from '@/lib/types';
import { 
  Pin, 
  MessageSquare, 
  Check, 
  PlusCircle, 
  Send, 
  ChevronRight, 
  ArrowLeft, 
  User,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface ForumClientProps {
  channel: ForumChannel;
  channels: ForumChannel[];
  initialPosts: ForumPostWithReplies[];
  currentUserId: string;
  currentUserRole: string;
}

export default function ForumClient({
  channel,
  channels,
  initialPosts,
  currentUserId,
  currentUserRole,
}: ForumClientProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  // Transitions for pin/unpin/answer modifications
  const [isPending, startTransition] = useTransition();

  // Selected post object helper
  const activePost = initialPosts.find(p => p.id === selectedPostId);

  // Form action hooks
  const [postState, postAction, postPending] = useActionState(async (state: any, fd: FormData) => {
    const res = await createForumPost(state, fd);
    if (res.success) {
      setShowNewPostForm(false);
    }
    return res;
  }, null);

  const [replyState, replyAction, replyPending] = useActionState(async (state: any, fd: FormData) => {
    const res = await createForumReply(state, fd);
    if (res.success) {
      // Clear reply textareas automatically via standard reset
      const form = document.getElementById('reply-form') as HTMLFormElement;
      form?.reset();
    }
    return res;
  }, null);

  // Handle setting reply as correct answer
  const handleToggleAnswer = async (replyId: string, isAnswer: boolean) => {
    startTransition(async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase
        .from('forum_replies')
        .update({ is_answer: !isAnswer })
        .eq('id', replyId);
      // Let the page re-fetch or reload
      window.location.reload();
    });
  };

  // Handle toggling pinned post status
  const handleTogglePin = async (postId: string, pinned: boolean) => {
    if (currentUserRole !== 'admin') return;
    startTransition(async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase
        .from('forum_posts')
        .update({ pinned: !pinned })
        .eq('id', postId);
      window.location.reload();
    });
  };

  const isTeacherOrAdmin = currentUserRole === 'admin' || currentUserRole === 'teacher';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
      
      {/* ── LEFT PANEL: Channels list ── */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'hsl(var(--text-secondary))' }}>
          Channels
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {channels.map((ch) => {
            const isActive = ch.id === channel.id;
            return (
              <Link
                key={ch.id}
                href={`/community/${ch.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  color: isActive ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                  borderLeft: isActive ? '3px solid hsl(var(--accent-purple))' : '3px solid transparent',
                }}
              >
                <span>{ch.emoji}</span>
                <span style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ch.name}
                </span>
              </Link>
            );
          })}
        </div>
        
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border-soft))' }}>
          <Link href="/community" className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
            <ArrowLeft style={{ width: '14px', height: '14px' }} /> Hub Directory
          </Link>
        </div>
      </div>

      {/* ── RIGHT PANEL: Thread view or Post List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Post Detail Thread View */}
        {selectedPostId && activePost ? (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header info */}
            <div>
              <button 
                onClick={() => setSelectedPostId(null)}
                className="btn-secondary" 
                style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Posts
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <User style={{ width: '18px', height: '18px', color: 'hsl(var(--text-secondary))' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{activePost.author_name}</span>
                      <span className="badge" style={{
                        fontSize: '0.6rem', padding: '0.1rem 0.4rem',
                        background: activePost.author_role === 'admin' ? 'rgba(217, 119, 6, 0.15)' : activePost.author_role === 'teacher' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: activePost.author_role === 'admin' ? '#f59e0b' : activePost.author_role === 'teacher' ? '#22d3ee' : 'hsl(var(--text-secondary))'
                      }}>
                        {activePost.author_role}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      {new Date(activePost.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {currentUserRole === 'admin' && (
                  <button
                    onClick={() => handleTogglePin(activePost.id, activePost.pinned)}
                    className="btn-secondary"
                    style={{ padding: '0.4rem', borderRadius: '50%', color: activePost.pinned ? '#f59e0b' : 'inherit' }}
                  >
                    <Pin style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Post Title & Body */}
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {activePost.pinned && <Pin style={{ width: '18px', height: '18px', color: '#f59e0b', fill: '#f59e0b' }} />}
                {activePost.title}
              </h2>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'hsl(var(--text-secondary))' }}>
                {activePost.body}
              </p>
            </div>

            {/* Replies section */}
            <div style={{ borderTop: '1px solid hsl(var(--border-soft))', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare style={{ width: '18px', height: '18px' }} />
                Replies ({activePost.forum_replies?.length || 0})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {(activePost.forum_replies || []).map((reply) => (
                  <div 
                    key={reply.id} 
                    className="glass-card" 
                    style={{ 
                      padding: '1rem', 
                      background: reply.is_answer ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.01)',
                      border: reply.is_answer ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid hsl(var(--border-soft))',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{reply.author_name}</span>
                        <span className="badge" style={{
                          fontSize: '0.55rem', padding: '0.1rem 0.3rem',
                          background: reply.author_role === 'admin' ? 'rgba(217, 119, 6, 0.15)' : reply.author_role === 'teacher' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: reply.author_role === 'admin' ? '#f59e0b' : reply.author_role === 'teacher' ? '#22d3ee' : 'hsl(var(--text-secondary))'
                        }}>
                          {reply.author_role}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                          {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => handleToggleAnswer(reply.id, reply.is_answer)}
                          className="btn-secondary"
                          style={{
                            padding: '0.25rem 0.5rem', fontSize: '0.7rem',
                            borderColor: reply.is_answer ? 'rgba(16, 185, 129, 0.4)' : 'inherit',
                            color: reply.is_answer ? '#34d399' : 'inherit',
                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                          }}
                        >
                          <Check style={{ width: '12px', height: '12px' }} />
                          {reply.is_answer ? 'Verified Answer' : 'Mark as Answer'}
                        </button>
                      )}
                      {!isTeacherOrAdmin && reply.is_answer && (
                        <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Check style={{ width: '14px', height: '14px' }} /> Verified Answer
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.92rem', color: 'hsl(var(--text-secondary))', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {reply.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form id="reply-form" action={replyAction} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                <input type="hidden" name="postId" value={activePost.id} />
                <input type="hidden" name="channelId" value={channel.id} />
                <textarea
                  className="form-input"
                  name="body"
                  placeholder="Type your reply here..."
                  rows={2}
                  style={{ flex: 1, minHeight: '50px' }}
                  required
                />
                <button 
                  type="submit" 
                  className="btn-premium" 
                  disabled={replyPending}
                  style={{ height: '44px', width: '44px', padding: 0, borderRadius: '50%', flexShrink: 0 }}
                >
                  <Send style={{ width: '16px', height: '16px' }} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Topic header & Create button */}
            <div className="flex-between">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{channel.emoji}</span>
                  {channel.name}
                </h2>
                <p style={{ margin: 0, color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                  {channel.description || 'Welcome to the channel board.'}
                </p>
              </div>

              <button 
                onClick={() => setShowNewPostForm(!showNewPostForm)}
                className="btn-premium"
                style={{ gap: '0.5rem' }}
              >
                <PlusCircle style={{ width: '18px', height: '18px' }} />
                New Post
              </button>
            </div>

            {/* New Post Form */}
            {showNewPostForm && (
              <div className="glass-card">
                <h3 style={{ marginBottom: '1rem' }}>Create a New Post</h3>
                <form action={postAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="hidden" name="channelId" value={channel.id} />
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      name="title"
                      placeholder="Give your post a descriptive title..."
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Body</label>
                    <textarea
                      className="form-input"
                      name="body"
                      placeholder="Share details, ask questions, or announce details..."
                      rows={5}
                      required
                    />
                  </div>

                  {postState && !postState.success && (
                    <p style={{ color: '#f87171', fontSize: '0.875rem', margin: 0 }}>{postState.error}</p>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'end' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowNewPostForm(false)} 
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-premium" 
                      disabled={postPending}
                    >
                      {postPending ? 'Creating...' : 'Publish Post'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Posts feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {initialPosts.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-muted))' }}>
                  <Sparkles style={{ width: '40px', height: '40px', margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3>No posts yet</h3>
                  <p style={{ fontSize: '0.9rem' }}>Be the first to share something in this channel!</p>
                </div>
              ) : (
                initialPosts.map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => setSelectedPostId(post.id)}
                    className="glass-card" 
                    style={{ 
                      cursor: 'pointer', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.75rem',
                      borderLeft: post.pinned ? '4px solid #f59e0b' : '1px solid var(--glass-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{post.author_name}</span>
                        <span className="badge" style={{
                          fontSize: '0.55rem', padding: '0.1rem 0.3rem',
                          background: post.author_role === 'admin' ? 'rgba(217, 119, 6, 0.15)' : post.author_role === 'teacher' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: post.author_role === 'admin' ? '#f59e0b' : post.author_role === 'teacher' ? '#22d3ee' : 'hsl(var(--text-secondary))'
                        }}>
                          {post.author_role}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {post.pinned && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>
                          <Pin style={{ width: '12px', height: '12px', fill: '#f59e0b' }} /> Pinned
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {post.title}
                      <ChevronRight style={{ width: '18px', height: '18px', color: 'hsl(var(--text-muted))' }} />
                    </h3>

                    <p style={{ margin: 0, color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                      {post.body}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                        <MessageSquare style={{ width: '14px', height: '14px' }} />
                        {post.forum_replies?.length || 0} replies
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
