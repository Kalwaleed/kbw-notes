-- ============================================================================
-- kbw Notes - Seed Data for Development/Testing
-- ============================================================================
-- Note: Run this AFTER the migration and AFTER creating a test user via OAuth
-- This creates sample blog posts for the main author (you)

-- First, ensure the author profile exists (replace with your actual user ID after signup)
-- The profile should be auto-created by the trigger, but we'll upsert sample data

-- Insert sample blog posts (assuming author_id will be set to your profile ID)
-- For now, we'll use a placeholder that you should replace with your actual user ID

DO $$
DECLARE
  author_uuid UUID;
BEGIN
  -- Get the first profile (should be the admin/author after OAuth signup)
  SELECT id INTO author_uuid FROM public.profiles LIMIT 1;

  -- If no profile exists yet, skip seeding
  IF author_uuid IS NULL THEN
    RAISE NOTICE 'No profiles found. Sign up via OAuth first, then re-run this seed.';
    RETURN;
  END IF;

  -- Insert sample blog posts
  INSERT INTO public.blog_posts (title, excerpt, body, author_id, published_at, tags)
  VALUES
    (
      'Building a Real-Time Collaborative Editor with CRDTs',
      'I spent the last month diving deep into Conflict-free Replicated Data Types. Here''s what I learned about building Google Docs-style collaboration from scratch.',
      E'# Building a Real-Time Collaborative Editor with CRDTs\n\nI spent the last month diving deep into Conflict-free Replicated Data Types (CRDTs). Here''s what I learned about building Google Docs-style collaboration from scratch.\n\n## What are CRDTs?\n\nCRDTs are data structures that can be replicated across multiple computers, where each replica can be independently and concurrently updated without coordination between the replicas.\n\n## Key Takeaways\n\n1. **Eventual consistency** is achievable without locks\n2. **Operational transforms** are an alternative but more complex\n3. **Yjs** is an excellent library to get started',
      author_uuid,
      NOW() - INTERVAL '1 day',
      ARRAY['distributed-systems', 'javascript', 'deep-dive']
    ),
    (
      'Why I Switched from REST to tRPC (And You Might Too)',
      'Type safety from database to frontend changed how I think about API design. No more guessing what shape your data will be.',
      E'# Why I Switched from REST to tRPC\n\nType safety from database to frontend changed how I think about API design.\n\n## The Problem with REST\n\nEvery time I made an API call, I had to:\n- Remember the endpoint URL\n- Remember the HTTP method\n- Hope the response shape hadn''t changed\n\n## Enter tRPC\n\ntRPC gives you end-to-end type safety with zero code generation.',
      author_uuid,
      NOW() - INTERVAL '4 days',
      ARRAY['typescript', 'api-design', 'trpc']
    ),
    (
      'Automating My Home Office with n8n and Raspberry Pi',
      'From turning on lights when I start working to automatically logging my focus time — here''s my over-engineered but surprisingly useful setup.',
      E'# Automating My Home Office\n\nFrom turning on lights when I start working to automatically logging my focus time — here''s my over-engineered but surprisingly useful setup.\n\n## The Setup\n\n- Raspberry Pi 4 running n8n\n- Philips Hue lights\n- Google Calendar integration\n- Notion for time tracking\n\n## Workflows\n\n1. When my calendar shows "Focus Time", lights turn on and notifications are silenced\n2. Time is logged to Notion automatically',
      author_uuid,
      NOW() - INTERVAL '12 days',
      ARRAY['automation', 'n8n', 'raspberry-pi', 'productivity']
    ),
    (
      'The Claude API Changed How I Prototype',
      'Using AI as a coding partner rather than a replacement. My workflow for rapid prototyping with Claude and why I stopped fighting the tools.',
      E'# The Claude API Changed How I Prototype\n\nUsing AI as a coding partner rather than a replacement.\n\n## My Workflow\n\n1. Start with a rough idea\n2. Describe it to Claude\n3. Iterate on the generated code\n4. Refine and own the final result\n\n## Key Insight\n\nAI tools are best used for exploration and scaffolding, not production code.',
      author_uuid,
      NOW() - INTERVAL '20 days',
      ARRAY['ai', 'claude', 'workflow', 'prototyping']
    ),
    (
      'Understanding V8''s Hidden Classes (With Benchmarks)',
      'JavaScript performance isn''t magic. I ran 50+ benchmarks to understand how V8 optimizes object shapes and what patterns to avoid.',
      E'# Understanding V8''s Hidden Classes\n\nJavaScript performance isn''t magic. I ran 50+ benchmarks to understand how V8 optimizes object shapes.\n\n## What are Hidden Classes?\n\nV8 creates internal "hidden classes" to optimize property access on objects.\n\n## The Benchmarks\n\nI tested various object creation patterns and measured performance differences.\n\n## Key Findings\n\n1. Consistent property order matters\n2. Delete is expensive\n3. Preallocating properties helps',
      author_uuid,
      NOW() - INTERVAL '25 days',
      ARRAY['javascript', 'performance', 'v8', 'deep-dive']
    ),
    (
      'A Minimal Docker Setup for Local Development',
      'You don''t need Kubernetes for your side project. Here''s my simple docker-compose setup that handles 90% of local dev needs.',
      E'# A Minimal Docker Setup for Local Development\n\nYou don''t need Kubernetes for your side project.\n\n## The Setup\n\n```yaml\nversion: "3.8"\nservices:\n  db:\n    image: postgres:15\n  redis:\n    image: redis:alpine\n  app:\n    build: .\n```\n\n## Why This Works\n\nMost projects need just a database and maybe a cache. Keep it simple.',
      author_uuid,
      NOW() - INTERVAL '30 days',
      ARRAY['docker', 'devops', 'tutorial']
    );

  RAISE NOTICE 'Seeded 6 blog posts for author %', author_uuid;
END $$;
