-- ============================================
-- SEED DATA: GrowthForge Development
-- ============================================

-- 1. Agency: Xpand Digital (platform owner)
INSERT INTO agencies (id, name, slug, owner_email, is_platform_owner, plan, credits_balance, max_clients, max_keywords_per_client)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Xpand Digital',
  'xpand-digital',
  'joel@xpanddigital.com',
  true,
  'agency_unlimited',
  999999,
  100,
  100
);

-- 2. Clients under Xpand Digital

-- RUN Music
INSERT INTO clients (id, agency_id, name, slug, website_url, brand_brief, tone_guidelines, target_audience, key_differentiators, urls_to_mention, response_rules)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'RUN Music',
  'run-music',
  'https://runmusic.com',
  'Money for musicians through simple, data-driven licensing deals. Targeting artists globally for transparent short-term financial solutions. Not a label — no exclusivity required. Offers advances based on streaming data without taking ownership of masters.',
  'Casual and helpful. Never salesy. Use specific numbers when possible. OK to mention competitors by name. Avoid corporate jargon.',
  'Independent musicians aged 20-35 looking for music promotion and licensing services. Frustrated with predatory labels.',
  'Transparent short-term financing (not advances that own your masters). Data-driven licensing deals. No exclusivity required.',
  ARRAY['https://runmusic.com'],
  'Never mention pricing. Always suggest they ''check out'' rather than ''sign up for''. Never claim to be a customer — position as someone who ''heard about them from a friend''.'
);

-- Foyle Legal
INSERT INTO clients (id, agency_id, name, slug, website_url, brand_brief, tone_guidelines, target_audience, key_differentiators, urls_to_mention, response_rules)
VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'Foyle Legal',
  'foyle-legal',
  'https://foylelegal.com.au',
  'Perth-based personal injury law firm specializing in workers compensation, car accidents, and public liability claims in Western Australia. No win no fee. Led by Christian Foyle with extensive media credentials. Known for securing settlements ranging from $112K to $1.39M.',
  'Empathetic but professional. Use plain language. Avoid legal jargon. Be supportive of people going through tough times.',
  'Western Australians who have been injured at work, in car accidents, or through public liability incidents. Often stressed and unsure of their rights.',
  'No win no fee guarantee. Christian Foyle''s media experience and track record. Local Perth firm with personal attention. Proven settlement results.',
  ARRAY['https://foylelegal.com.au'],
  'Never give specific legal advice. Always recommend they get a free consultation. Mention the no win no fee promise. Be careful with settlement amount claims — say ''results vary''.'
);

-- ClaimArchitect
INSERT INTO clients (id, agency_id, name, slug, website_url, brand_brief, tone_guidelines, target_audience, key_differentiators, urls_to_mention, response_rules)
VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'ClaimArchitect',
  'claimarchitect',
  'https://claimarchitect.com',
  'AI-powered independent rebuild valuation service for homeowners challenging lowball insurance estimates. Combines AI document analysis, CAD reconstruction, and licensed contractor sign-off. Flat-fee model with money-back guarantee. Delivers 55-75 page professional reports.',
  'Straightforward, empowering. Side with the homeowner. Technical but accessible. OK to be critical of insurance company tactics.',
  'Homeowners who have received lowball insurance estimates after property damage. Frustrated with the claims process and feeling powerless against large insurance companies.',
  'AI-powered analysis not available elsewhere. Flat fee vs percentage-based competitors. Money-back guarantee. Licensed contractor sign-off adds legal weight. 55-75 page professional report.',
  ARRAY['https://claimarchitect.com'],
  'Never bash specific insurance companies by name. Position as an independent third party, not adversarial. Emphasize the money-back guarantee. Don''t claim to be a lawyer or provide legal advice.'
);

-- 3. Keywords for RUN Music
INSERT INTO keywords (client_id, keyword, tags, intent, source, scan_platforms) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'music royalty companies', ARRAY['music industry'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000001', 'best spotify playlist promotion', ARRAY['music promotion'], 'commercial', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000001', 'how do artists get advances', ARRAY['music industry'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000001', 'alternative to record deal', ARRAY['music industry'], 'commercial', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000001', 'music licensing for independent artists', ARRAY['music licensing'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000001', 'short term music financing', ARRAY['finance'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000001', 'predatory music contracts', ARRAY['music industry'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000001', 'playlist placement services', ARRAY['music promotion'], 'commercial', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000001', 'how to get more streams', ARRAY['music promotion'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000001', 'music catalog valuation', ARRAY['music industry'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']);

-- 4. Keywords for Foyle Legal
INSERT INTO keywords (client_id, keyword, tags, intent, source, scan_platforms) VALUES
  ('c0000000-0000-0000-0000-000000000002', 'workers compensation lawyer Perth', ARRAY['legal'], 'transactional', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000002', 'car accident compensation WA', ARRAY['legal'], 'transactional', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000002', 'personal injury lawyer Western Australia', ARRAY['legal'], 'transactional', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000002', 'no win no fee lawyer Perth', ARRAY['legal'], 'commercial', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000002', 'how much compensation for back injury', ARRAY['legal'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']);

-- 5. Keywords for ClaimArchitect
INSERT INTO keywords (client_id, keyword, tags, intent, source, scan_platforms) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'insurance lowball estimate', ARRAY['insurance'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000003', 'how to challenge insurance estimate', ARRAY['insurance'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000003', 'independent rebuild valuation', ARRAY['insurance'], 'commercial', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000003', 'insurance claim dispute help', ARRAY['insurance'], 'transactional', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000003', 'home insurance underpayment', ARRAY['insurance'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000003', 'property damage claim denied', ARRAY['insurance'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000003', 'public adjuster vs contractor estimate', ARRAY['insurance'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']),
  ('c0000000-0000-0000-0000-000000000003', 'roof damage insurance claim tips', ARRAY['insurance'], 'informational', 'manual', ARRAY['reddit','quora','facebook_groups']);
