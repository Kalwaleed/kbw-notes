import type { BlogPost, Comment } from './types'

export const sampleBlogPost: BlogPost = {
  id: 'post-001',
  headline: 'The Future of Venture Capital in the Age of AI',
  subheader: 'How artificial intelligence is reshaping deal flow, due diligence, and portfolio management for modern investors',
  body: `The venture capital landscape is undergoing a seismic shift. As someone who has spent over a decade in this industry, I've witnessed countless technological waves—but none quite like the current AI revolution.

## The New Deal Flow

Traditional deal sourcing relied heavily on personal networks and warm introductions. Today, AI-powered tools are surfacing opportunities that might have slipped through the cracks of conventional pipelines. Pattern recognition algorithms can identify promising startups based on founder backgrounds, market timing, and technical differentiation.

## Due Diligence Reimagined

The due diligence process, once a marathon of spreadsheets and reference calls, is being augmented by intelligent systems. These tools can analyze competitive landscapes, validate market size claims, and even assess team dynamics through natural language processing of communications.

## Portfolio Support at Scale

Perhaps the most exciting application is in portfolio support. AI assistants can now provide 24/7 guidance to portfolio companies on everything from hiring best practices to go-to-market strategies, democratizing access to expertise that was once reserved for the most connected founders.

## The Human Element Remains

Despite these advances, the fundamentally human aspects of venture capital—building trust, making judgment calls on founder character, and providing emotional support during difficult pivots—remain irreplaceable. The best investors will be those who leverage AI as a force multiplier while doubling down on uniquely human capabilities.

The future belongs to the augmented investor: one who combines deep industry expertise with intelligent tools to make better decisions, faster.`,
  author: {
    id: 'user-001',
    name: 'Kevin B. Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin'
  },
  publishedAt: '2024-12-15T09:00:00Z',
  readingTime: 4,
  tags: ['Venture Capital', 'Artificial Intelligence', 'Investment Strategy']
}

export const sampleComments: Comment[] = [
  {
    id: 'comment-001',
    content: "This really resonates with me. We've started using AI tools for initial screening at our fund and the time savings are remarkable. But you're right—nothing replaces sitting across from a founder and getting a read on their conviction.",
    commenter: {
      id: 'user-002',
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    },
    createdAt: '2024-12-15T14:32:00Z',
    reactions: 12,
    isModerated: true,
    replies: [
      {
        id: 'comment-002',
        content: "What tools are you using for screening? We've been evaluating a few options but haven't committed yet.",
        commenter: {
          id: 'user-003',
          name: 'Marcus Johnson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus'
        },
        createdAt: '2024-12-15T15:10:00Z',
        reactions: 3,
        isModerated: true,
        replies: [
          {
            id: 'comment-003',
            content: "We've been happy with Harmonic for sourcing and Pitchbook's AI features for market analysis. Happy to chat offline if you want more details.",
            commenter: {
              id: 'user-002',
              name: 'Sarah Chen',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
            },
            createdAt: '2024-12-15T15:45:00Z',
            reactions: 8,
            isModerated: true,
            replies: []
          }
        ]
      }
    ]
  },
  {
    id: 'comment-004',
    content: "I worry about the homogenization of investment theses if everyone is using similar AI tools. Won't we all end up chasing the same deals?",
    commenter: {
      id: 'user-004',
      name: 'Elena Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena'
    },
    createdAt: '2024-12-15T16:20:00Z',
    reactions: 24,
    isModerated: true,
    replies: [
      {
        id: 'comment-005',
        content: "Great point. I think the differentiation will come from how funds train their models and what unique data they feed them. Your proprietary insights become your moat.",
        commenter: {
          id: 'user-001',
          name: 'Kevin B. Williams',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin'
        },
        createdAt: '2024-12-15T17:05:00Z',
        reactions: 31,
        isModerated: true,
        replies: []
      }
    ]
  },
  {
    id: 'comment-006',
    content: 'As a founder who recently went through fundraising, I can say that the VCs who clearly did their AI-assisted homework stood out. They asked better questions and wasted less of everyone\'s time on basics.',
    commenter: {
      id: 'user-005',
      name: 'David Park',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david'
    },
    createdAt: '2024-12-16T08:15:00Z',
    reactions: 45,
    isModerated: true,
    replies: []
  },
  {
    id: 'comment-007',
    content: "The portfolio support angle is underrated. Our investors use AI to send us relevant market intel weekly. It's like having a research team we couldn't otherwise afford.",
    commenter: {
      id: 'user-006',
      name: 'Aisha Patel',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha'
    },
    createdAt: '2024-12-16T10:42:00Z',
    reactions: 18,
    isModerated: true,
    replies: [
      {
        id: 'comment-008',
        content: 'This is exactly the kind of value-add that separates great investors from check-writers. Thanks for sharing your perspective from the founder side.',
        commenter: {
          id: 'user-001',
          name: 'Kevin B. Williams',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin'
        },
        createdAt: '2024-12-16T11:30:00Z',
        reactions: 7,
        isModerated: true,
        replies: []
      }
    ]
  },
  {
    id: 'comment-009',
    content: "Thoughtful piece. Would love to see a follow-up on the ethical considerations—bias in AI screening, privacy of founder data, etc.",
    commenter: {
      id: 'user-007',
      name: "James O'Brien",
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james'
    },
    createdAt: '2024-12-16T14:00:00Z',
    reactions: 0,
    isModerated: false,
    replies: []
  }
]
