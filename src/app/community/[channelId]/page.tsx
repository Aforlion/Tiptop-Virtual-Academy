import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import ForumClient from '../components/ForumClient';
import { ForumChannel, ForumPostWithReplies } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ channelId: string }>;
}

export default async function ForumChannelPage({ params }: PageProps) {
  const { channelId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'parent';

  // Fetch target channel & all channels
  const [channelRes, channelsRes] = await Promise.all([
    supabase.from('forum_channels').select('*').eq('id', channelId).single(),
    supabase.from('forum_channels').select('*').order('name', { ascending: true })
  ]);

  if (channelRes.error || !channelRes.data) {
    notFound();
  }

  const activeChannel = channelRes.data as ForumChannel;
  const allChannels = (channelsRes.data as ForumChannel[]) || [];

  // Fetch posts with replies
  const { data: posts, error } = await supabase
    .from('forum_posts')
    .select(`
      *,
      forum_replies (
        *
      )
    `)
    .eq('channel_id', channelId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  // Map to enforce reply sorting inside each post
  const safePosts = ((posts as ForumPostWithReplies[]) || []).map(post => {
    const sortedReplies = [...(post.forum_replies || [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return {
      ...post,
      forum_replies: sortedReplies
    };
  });

  return (
    <>
      <PageHeader
        title={`Community Board — ${activeChannel.name}`}
        subtitle={activeChannel.description || 'Welcome to the classroom community channel.'}
      />

      <ForumClient
        channel={activeChannel}
        channels={allChannels}
        initialPosts={safePosts}
        currentUserId={user.id}
        currentUserRole={role}
      />
    </>
  );
}
