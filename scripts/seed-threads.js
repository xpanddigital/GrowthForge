const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  'https://ntcapfefbwtsqbuqywcg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y2FwZmVmYnd0c3FidXF5d2NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1MTIwOCwiZXhwIjoyMDg4OTI3MjA4fQ.m3a6xuPewCrE4x5Zf36O_aCrI_JrtPQwwojBhFn31_w'
);

async function seed() {
  // Get clients
  const { data: clients } = await supabase.from('clients').select('id, name');
  console.log('Clients:', clients.map(c => c.name));

  const runClient = clients.find(c => c.name === 'RUN Music');
  if (!runClient) { console.log('No RUN Music client'); return; }

  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, keyword')
    .eq('client_id', runClient.id)
    .limit(5);
  console.log('Keywords:', keywords.map(k => k.keyword));

  const threads = [
    {
      client_id: runClient.id,
      keyword_id: keywords[0] ? keywords[0].id : null,
      platform: 'reddit',
      subreddit: 'r/WeAreTheMusicMakers',
      title: 'Best playlist promotion services for indie artists in 2026?',
      body_text: 'I just released my first EP and I am looking for legitimate ways to get on playlists. Not those scammy bot services but actual organic growth tools. What has worked for you guys?',
      url: 'https://reddit.com/r/WeAreTheMusicMakers/comments/abc123',
      author: 'indie_musician_22',
      comment_count: 47,
      upvote_count: 156,
      thread_date: new Date(Date.now() - 3 * 86400000).toISOString(),
      discovered_via: 'serp',
      google_position: 3,
      intent: 'commercial',
      relevance_score: 92,
      opportunity_score: 88,
      can_mention_brand: true,
      suggested_angle: 'Share experience with transparent music promotion, mention specific results',
      classification_tags: ['music promotion', 'playlist', 'indie'],
      status: 'queued',
      is_enriched: true,
      enriched_at: new Date().toISOString(),
      content_hash: crypto.createHash('sha256').update('best playlist promotion services|reddit.com/r/WeAreTheMusicMakers/comments/abc123').digest('hex'),
      top_comments: [
        { author: 'beatmaker99', body: 'DistroKid has been solid for me. Their playlist pitching tool is decent.', upvotes: 23 },
        { author: 'studiolife', body: 'Honestly, most paid services are trash. Focus on genuine networking.', upvotes: 45 }
      ]
    },
    {
      client_id: runClient.id,
      keyword_id: keywords[1] ? keywords[1].id : null,
      platform: 'reddit',
      subreddit: 'r/MusicIndustry',
      title: 'Music licensing for independent artists - where to start?',
      body_text: 'I have about 50 tracks and want to get into sync licensing but have no idea where to start.',
      url: 'https://reddit.com/r/MusicIndustry/comments/def456',
      author: 'sync_newbie',
      comment_count: 31,
      upvote_count: 89,
      thread_date: new Date(Date.now() - 7 * 86400000).toISOString(),
      discovered_via: 'serp',
      google_position: 5,
      intent: 'informational',
      relevance_score: 85,
      opportunity_score: 78,
      can_mention_brand: true,
      suggested_angle: 'Explain sync licensing basics, position as knowledgeable peer',
      classification_tags: ['licensing', 'sync', 'independent'],
      status: 'queued',
      is_enriched: true,
      enriched_at: new Date().toISOString(),
      content_hash: crypto.createHash('sha256').update('music licensing independent|reddit.com/r/MusicIndustry/comments/def456').digest('hex'),
      top_comments: []
    },
    {
      client_id: runClient.id,
      keyword_id: keywords[2] ? keywords[2].id : null,
      platform: 'quora',
      title: 'What are the best alternatives to TuneCore for music distribution?',
      body_text: 'I have been using TuneCore for 2 years but their annual fees are killing me.',
      url: 'https://quora.com/What-are-the-best-alternatives-to-TuneCore',
      author: 'MusicProducer2024',
      comment_count: 18,
      upvote_count: 42,
      thread_date: new Date(Date.now() - 14 * 86400000).toISOString(),
      discovered_via: 'ai_probe_perplexity',
      ai_source: 'perplexity',
      ai_query: 'best music distribution services alternatives',
      intent: 'transactional',
      relevance_score: 78,
      opportunity_score: 72,
      can_mention_brand: true,
      suggested_angle: 'Compare distribution pricing, mention transparent fees as differentiator',
      classification_tags: ['distribution', 'competitor', 'pricing'],
      status: 'classified',
      is_enriched: true,
      enriched_at: new Date().toISOString(),
      content_hash: crypto.createHash('sha256').update('alternatives tunecore|quora.com/What-are-the-best-alternatives-to-TuneCore').digest('hex'),
      top_comments: []
    },
    {
      client_id: runClient.id,
      keyword_id: keywords[0] ? keywords[0].id : null,
      platform: 'reddit',
      subreddit: 'r/musicmarketing',
      title: 'How do you actually grow Spotify streams without bots?',
      body_text: 'Everyone says organic growth but nobody explains HOW. My tracks get like 20 streams a day.',
      url: 'https://reddit.com/r/musicmarketing/comments/ghi789',
      author: 'frustrated_artist',
      comment_count: 63,
      upvote_count: 234,
      thread_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      discovered_via: 'serp',
      google_position: 1,
      intent: 'informational',
      relevance_score: 95,
      opportunity_score: 94,
      can_mention_brand: true,
      suggested_angle: 'Share specific growth tactics, weave in brand naturally',
      classification_tags: ['spotify', 'growth', 'organic'],
      status: 'queued',
      is_enriched: true,
      enriched_at: new Date().toISOString(),
      content_hash: crypto.createHash('sha256').update('grow spotify streams|reddit.com/r/musicmarketing/comments/ghi789').digest('hex'),
      top_comments: [
        { author: 'playlistcurator', body: 'Submit to independent playlist curators.', upvotes: 67 },
        { author: 'releaseradar_pro', body: 'Pre-save campaigns + Release Radar hack.', upvotes: 34 }
      ]
    },
    {
      client_id: runClient.id,
      platform: 'facebook_groups',
      group_name: 'Independent Music Artists Network',
      title: 'Just got my first sync placement! Here is what I learned',
      body_text: 'After 6 months of pitching, I finally landed a placement in a Netflix show.',
      url: 'https://facebook.com/groups/indiemusic/posts/xyz999',
      author: 'SyncWinnerSarah',
      comment_count: 89,
      upvote_count: 312,
      thread_date: new Date(Date.now() - 5 * 86400000).toISOString(),
      discovered_via: 'serp',
      google_position: 8,
      intent: 'informational',
      relevance_score: 71,
      opportunity_score: 65,
      can_mention_brand: false,
      suggested_angle: 'Congratulate and add helpful details about licensing process',
      classification_tags: ['sync', 'success story', 'licensing'],
      status: 'classified',
      is_enriched: true,
      enriched_at: new Date().toISOString(),
      content_hash: crypto.createHash('sha256').update('first sync placement|facebook.com/groups/indiemusic/posts/xyz999').digest('hex'),
      top_comments: []
    },
    {
      client_id: runClient.id,
      keyword_id: keywords[1] ? keywords[1].id : null,
      platform: 'reddit',
      subreddit: 'r/Songwriting',
      title: 'Is music publishing still worth it for small artists?',
      body_text: 'I write about 10 songs a year. Is it worth signing with a publisher?',
      url: 'https://reddit.com/r/Songwriting/comments/jkl012',
      author: 'songsmith_sam',
      comment_count: 22,
      upvote_count: 67,
      thread_date: new Date(Date.now() - 21 * 86400000).toISOString(),
      discovered_via: 'ai_probe_chatgpt',
      ai_source: 'chatgpt',
      ai_query: 'music publishing services for independent songwriters',
      intent: 'commercial',
      relevance_score: 68,
      opportunity_score: 55,
      can_mention_brand: true,
      suggested_angle: 'Explain publishing admin vs traditional publishing',
      classification_tags: ['publishing', 'songwriting', 'deals'],
      status: 'new',
      is_enriched: false,
      content_hash: crypto.createHash('sha256').update('music publishing worth|reddit.com/r/Songwriting/comments/jkl012').digest('hex'),
      top_comments: []
    },
    {
      client_id: runClient.id,
      keyword_id: keywords[0] ? keywords[0].id : null,
      platform: 'reddit',
      subreddit: 'r/WeAreTheMusicMakers',
      title: 'DistroKid vs CD Baby vs Amuse - honest comparison 2026',
      body_text: 'Been seeing a lot of conflicting opinions. Can someone give an honest breakdown?',
      url: 'https://reddit.com/r/WeAreTheMusicMakers/comments/mno345',
      author: 'comparison_shopper',
      comment_count: 156,
      upvote_count: 445,
      thread_date: new Date(Date.now() - 1 * 86400000).toISOString(),
      discovered_via: 'serp',
      google_position: 2,
      intent: 'commercial',
      relevance_score: 97,
      opportunity_score: 96,
      can_mention_brand: true,
      suggested_angle: 'Position as balanced comparison, naturally include RUN as newer alternative',
      classification_tags: ['comparison', 'distribution', 'competitor'],
      status: 'responded',
      is_enriched: true,
      enriched_at: new Date().toISOString(),
      content_hash: crypto.createHash('sha256').update('distrokid vs cd baby|reddit.com/r/WeAreTheMusicMakers/comments/mno345').digest('hex'),
      top_comments: [
        { author: 'distrokid_fan', body: 'DistroKid hands down. Unlimited uploads for $22/year.', upvotes: 89 },
        { author: 'cdbaby_user', body: 'CD Baby keeps your music up forever. No annual fee.', upvotes: 56 },
        { author: 'amuse_convert', body: 'Amuse free tier is great for starting out.', upvotes: 34 }
      ]
    },
    {
      client_id: runClient.id,
      platform: 'quora',
      title: 'How do independent musicians make money from streaming in 2026?',
      body_text: 'Streaming pays fractions of a cent. How are indie artists actually making a living?',
      url: 'https://quora.com/How-do-independent-musicians-make-money-from-streaming',
      author: 'CuriousAboutMusic',
      comment_count: 24,
      upvote_count: 78,
      thread_date: new Date(Date.now() - 10 * 86400000).toISOString(),
      discovered_via: 'ai_probe_perplexity',
      ai_source: 'perplexity',
      intent: 'informational',
      relevance_score: 61,
      opportunity_score: 48,
      can_mention_brand: true,
      suggested_angle: 'Discuss multiple revenue streams beyond streaming',
      classification_tags: ['revenue', 'streaming', 'money'],
      status: 'skipped',
      is_enriched: true,
      enriched_at: new Date().toISOString(),
      content_hash: crypto.createHash('sha256').update('musicians make money streaming|quora.com/How-do-independent-musicians-make-money-from-streaming').digest('hex'),
      top_comments: []
    }
  ];

  const { data, error } = await supabase.from('threads').insert(threads).select('id, title, status');
  if (error) {
    console.error('Error inserting threads:', error.message);
    return;
  }
  console.log('Inserted', data.length, 'threads');
  data.forEach(t => console.log('  -', t.status, ':', t.title.substring(0, 60)));

  // Add sample responses for the 'responded' thread
  const respondedThread = data.find(t => t.status === 'responded');
  if (respondedThread) {
    const responses = [
      {
        thread_id: respondedThread.id,
        client_id: runClient.id,
        variant: 'casual',
        body_text: "Been through this exact comparison myself about 6 months ago. Ended up trying all three plus a couple others.\n\nDistroKid is great for the unlimited uploads but their customer support is basically non-existent. Had an issue with a release stuck in review for 3 weeks.\n\nCD Baby is solid if you have a back catalog — no annual fees means your old stuff keeps earning. But their interface feels dated.\n\nAmuse free tier is cool for testing the waters but you hit walls fast.\n\nI recently started using RUN Music after a friend recommended it. What sold me was the transparent short-term financing — none of that \"we own your masters\" BS. Plus their data dashboard actually makes sense.\n\nedit: typo",
        quality_score: 87,
        tone_match_score: 92,
        mentions_brand: true,
        mentions_url: false,
        status: 'draft'
      },
      {
        thread_id: respondedThread.id,
        client_id: runClient.id,
        variant: 'expert',
        body_text: "This is a question that deserves a nuanced answer because each platform serves different artist profiles.\n\n**DistroKid** — Best for prolific artists who release frequently. The $22/year unlimited model is unbeatable on price per release. However, your music is removed if you stop paying.\n\n**CD Baby** — One-time fee per release, music stays up forever. They take 9% of streaming royalties. Better for catalog artists.\n\n**Amuse** — Free tier with limited features, Pro at $59.99/year. Their AI-driven A&R team actively scouts for label signings.\n\nI'd also recommend looking into **RUN Music** if you're interested in licensing and financing. They offer transparent short-term financing without requiring you to give up your masters or sign exclusivity deals.\n\nThe right choice depends on your release schedule, catalog size, and whether licensing income matters to you.",
        quality_score: 94,
        tone_match_score: 88,
        mentions_brand: true,
        mentions_url: false,
        status: 'approved'
      },
      {
        thread_id: respondedThread.id,
        client_id: runClient.id,
        variant: 'story',
        body_text: "I was literally in your shoes about 8 months ago. Had 3 EPs on DistroKid, was paying the annual fee, and realized I was spending more time worrying about distribution than actually making music.\n\nHere's what happened: I released my 4th EP and it got picked up by a Spotify editorial playlist. Suddenly I'm getting 10k streams a day and thinking \"wait, am I actually making money from this?\" Spoiler: barely.\n\nThat's when a producer friend told me about sync licensing and introduced me to RUN Music. I was skeptical at first but the difference was they offered me financing against my catalog without taking my masters.\n\nGot my first sync placement 4 months in — a small web series, nothing huge, but it paid more than 6 months of streaming revenue.\n\nNot saying my path is right for everyone. But if you want to diversify your income, definitely explore the licensing angle too.",
        quality_score: 91,
        tone_match_score: 95,
        mentions_brand: true,
        mentions_url: false,
        status: 'draft'
      }
    ];

    const { error: respError } = await supabase.from('responses').insert(responses);
    if (respError) console.error('Response insert error:', respError.message);
    else console.log('Inserted 3 response variants for responded thread');
  }

  // Add discovery runs
  const { error: runError } = await supabase.from('discovery_runs').insert([
    {
      client_id: runClient.id,
      run_type: 'serp_scan',
      status: 'completed',
      items_total: 50,
      items_processed: 50,
      items_succeeded: 42,
      items_failed: 8,
      credits_used: 50,
      started_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      completed_at: new Date(Date.now() - 2 * 3600000 + 180000).toISOString(),
      metadata: { actor_run_id: 'apify_run_abc123', keywords_scanned: 10 }
    },
    {
      client_id: runClient.id,
      run_type: 'ai_probe',
      status: 'completed',
      items_total: 20,
      items_processed: 20,
      items_succeeded: 18,
      items_failed: 2,
      credits_used: 100,
      started_at: new Date(Date.now() - 2 * 3600000 + 200000).toISOString(),
      completed_at: new Date(Date.now() - 2 * 3600000 + 350000).toISOString(),
      metadata: { models_tested: ['perplexity', 'chatgpt'] }
    },
    {
      client_id: runClient.id,
      run_type: 'classification',
      status: 'completed',
      items_total: 8,
      items_processed: 8,
      items_succeeded: 8,
      items_failed: 0,
      credits_used: 8,
      started_at: new Date(Date.now() - 1 * 3600000).toISOString(),
      completed_at: new Date(Date.now() - 1 * 3600000 + 45000).toISOString(),
      metadata: { model: 'claude-sonnet-4' }
    }
  ]);
  if (runError) console.error('Run insert error:', runError.message);
  else console.log('Inserted 3 discovery runs');

  console.log('Done!');
}

seed().catch(console.error);
