-- ============================================
-- SEED: Monitor Prompt Templates
-- Pre-populate monitor_prompt_templates with
-- system templates across verticals.
-- Requires: Xpand Digital agency already seeded.
-- ============================================

-- General Templates (12)
INSERT INTO monitor_prompt_templates (agency_id, name, template_text, vertical, prompt_type, is_system_template)
SELECT a.id,
  unnest(ARRAY[
    'General Recommendation', 'General Alternative', 'General Comparison',
    'General vs Competitor', 'General How-To', 'General Guide',
    'General Cost', 'General Budget', 'General Review',
    'General Experience', 'General Top Pick', 'General Deep Dive'
  ]),
  unnest(ARRAY[
    'What are the best {keyword} services available right now?',
    'Can you recommend good alternatives for {keyword}?',
    'Compare the top {keyword} providers — which one is best?',
    'How does {keyword} compare to the leading competitors?',
    'How do I get started with {keyword}? What should I look for?',
    'What is the best way to approach {keyword} as a beginner?',
    'How much does {keyword} typically cost? What affects the price?',
    'What is the most cost-effective option for {keyword}?',
    'What do people say about {keyword}? Is it worth it?',
    'Has anyone used {keyword}? What was your experience like?',
    'If you could only choose one {keyword} service, which would you pick?',
    'What are the pros and cons of different {keyword} options?'
  ]),
  'general',
  unnest(ARRAY[
    'recommendation', 'recommendation', 'comparison',
    'comparison', 'how_to', 'how_to',
    'cost', 'cost', 'review',
    'review', 'recommendation', 'comparison'
  ]),
  true
FROM agencies a WHERE a.slug = 'xpand-digital';

-- Music Industry Templates (8)
INSERT INTO monitor_prompt_templates (agency_id, name, template_text, vertical, prompt_type, is_system_template)
SELECT a.id,
  unnest(ARRAY[
    'Music Recommendation', 'Music Comparison', 'Music How-To', 'Music Cost',
    'Music Review', 'Music Distribution', 'Music Licensing', 'Music Alternative'
  ]),
  unnest(ARRAY[
    'What are the best {keyword} platforms for independent musicians?',
    'Compare {keyword} services — which is best for indie artists?',
    'How do independent artists get started with {keyword}?',
    'How much do {keyword} services cost for independent musicians?',
    'What do independent musicians think about {keyword} services?',
    'What is the best way to handle {keyword} as an unsigned artist?',
    'How do I find the right {keyword} deal without getting locked in?',
    'What are the alternatives to the big labels for {keyword}?'
  ]),
  'music',
  unnest(ARRAY[
    'recommendation', 'comparison', 'how_to', 'cost',
    'review', 'recommendation', 'how_to', 'comparison'
  ]),
  true
FROM agencies a WHERE a.slug = 'xpand-digital';

-- Legal Services Templates (6)
INSERT INTO monitor_prompt_templates (agency_id, name, template_text, vertical, prompt_type, is_system_template)
SELECT a.id,
  unnest(ARRAY[
    'Legal Recommendation', 'Legal Comparison', 'Legal How-To',
    'Legal Cost', 'Legal Review', 'Legal Guide'
  ]),
  unnest(ARRAY[
    'What are the best {keyword} law firms in my area?',
    'How do I compare different {keyword} attorneys?',
    'What should I look for when hiring a {keyword} lawyer?',
    'How much does a {keyword} attorney typically charge?',
    'What do clients say about {keyword} legal services?',
    'I need help with {keyword} — where do I start?'
  ]),
  'legal',
  unnest(ARRAY[
    'recommendation', 'comparison', 'how_to',
    'cost', 'review', 'how_to'
  ]),
  true
FROM agencies a WHERE a.slug = 'xpand-digital';

-- Home Services Templates (5)
INSERT INTO monitor_prompt_templates (agency_id, name, template_text, vertical, prompt_type, is_system_template)
SELECT a.id,
  unnest(ARRAY[
    'Home Service Recommendation', 'Home Service Comparison', 'Home Service How-To',
    'Home Service Cost', 'Home Service Review'
  ]),
  unnest(ARRAY[
    'Who are the best {keyword} companies near me?',
    'How do I compare {keyword} service providers?',
    'What should I know before hiring a {keyword} company?',
    'How much does {keyword} service typically cost?',
    'What are the most reliable {keyword} companies people recommend?'
  ]),
  'home_services',
  unnest(ARRAY[
    'recommendation', 'comparison', 'how_to',
    'cost', 'review'
  ]),
  true
FROM agencies a WHERE a.slug = 'xpand-digital';
