// Centralized blog data generation to ensure consistency across pages

const authors = [
  {
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Sarah Johnson", 
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b6d49b42?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "David Rodriguez",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Emily Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Michael Zhang",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Lisa Parker",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  },
];

const communities = [
  "Tech Hub", "Design Studio", "Business Talk", "AI Research", "Web Dev",
  "Mobile Dev", "Data Science", "UX/UI", "Startup Life", "Remote Work",
];

// MASTER BLOG DATA - Single source of truth
const masterBlogData = [
  {
    id: "blog_tech_react_scalable",
    title: "Building Scalable React Applications with Modern Architecture",
    description: "Learn how to architect React applications that can scale from startup to enterprise, with practical examples and proven patterns.",
    author: authors[0], // Alex Chen
    community: "Tech Hub",
    tags: ["React", "JavaScript", "Architecture"],
    content: `React has revolutionized the way we build web applications by providing a powerful framework that simplifies the development process. Combined with modern architectural patterns, it creates an excellent foundation for scalable applications.

## Modern React Architecture Principles

Building scalable React applications requires careful consideration of several architectural principles:

**Component Architecture**: Design your components with reusability and maintainability in mind. Use composition over inheritance and keep components focused on a single responsibility.

**State Management**: Choose the right state management solution for your application's complexity. For simple apps, React's built-in useState and useContext might suffice, while complex applications benefit from Redux or Zustand.

## Folder Structure and Organization

A well-organized project structure is crucial for scalability:

• \`src/components\` - Reusable UI components
• \`src/pages\` - Page-level components
• \`src/hooks\` - Custom React hooks
• \`src/services\` - API calls and business logic
• \`src/utils\` - Helper functions and utilities

## Performance Optimization Strategies

Optimize your React applications with these proven techniques:

• Use React.memo for expensive components
• Implement code splitting with React.lazy
• Optimize bundle size with tree shaking
• Use production builds for deployment`,
    simplified: `**Key Takeaways:**

• Modern React architecture focuses on scalability and maintainability
• Component composition and single responsibility principle are essential
• Choose state management solutions based on application complexity
• Organized folder structure improves developer experience
• Performance optimization should be considered from the start`
  },
  
  {
    id: "blog_design_color_psychology", 
    title: "The Psychology of Color in Modern UI Design",
    description: "Understanding how colors influence user behavior and emotions in digital interfaces, with practical examples and case studies.",
    author: authors[3], // Emily Davis
    community: "Design Studio",
    tags: ["Design", "Psychology", "UI"],
    content: `Color is one of the most powerful tools in a designer's arsenal. It can evoke emotions, guide attention, and significantly impact user experience and conversion rates.

## Color Psychology Fundamentals

Different colors trigger different psychological responses in users:

**Blue**: Trust, reliability, professionalism - Perfect for financial services and corporate websites
**Red**: Urgency, excitement, energy - Great for call-to-action buttons and sale notifications  
**Green**: Growth, nature, success - Ideal for environmental brands and success states
**Purple**: Luxury, creativity, wisdom - Excellent for premium products and creative services

## Cultural Considerations in Color Choice

Color perception varies significantly across cultures:

• Red symbolizes luck in China but danger in Western cultures
• White represents purity in the West but mourning in some Asian cultures
• Green is associated with nature globally but can represent inexperience in business contexts

## Practical Application in UI Design

When implementing color psychology in your designs:

• Use blue for trust-building elements like security badges
• Apply red sparingly for urgent actions or error states  
• Leverage green for positive feedback and success messages
• Consider your target audience's cultural background`,
    simplified: `**Color Psychology in Design:**

• Colors directly influence user emotions and behavior
• Blue builds trust, red creates urgency, green indicates success
• Cultural differences in color perception must be considered
• Test color choices with your specific target audience
• Use color strategically to guide user actions and improve UX`
  },

  {
    id: "blog_tech_react_performance",
    title: "Advanced React Patterns and Performance Optimization", 
    description: "Explore advanced React patterns, hooks optimization, and performance techniques to build lightning-fast applications.",
    author: authors[1], // Sarah Johnson
    community: "Tech Hub", 
    tags: ["React", "Performance", "Hooks"],
    content: `React's ecosystem has evolved significantly, offering developers powerful tools and patterns to build high-performance applications. This guide covers advanced techniques for optimizing your React applications.

## React.memo and Memoization Patterns

One of the most important optimization techniques is preventing unnecessary re-renders:

\`\`\`javascript
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => heavyProcessing(item));
  }, [data]);

  const handleClick = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);

  return <div>{processedData}</div>;
});
\`\`\`

## Custom Hooks for Logic Reuse

Custom hooks allow you to extract component logic into reusable functions:

• Separate concerns and improve testability
• Share stateful logic between components  
• Follow the single responsibility principle
• Create a library of reusable business logic

## Performance Profiling and Monitoring

Use React DevTools Profiler to identify performance bottlenecks:

• Monitor component render times
• Identify unnecessary re-renders
• Track props changes that trigger updates
• Measure the impact of optimizations`,
    simplified: `**React Performance Tips:**

• Use React.memo to prevent unnecessary re-renders
• Implement useMemo for expensive calculations
• Create custom hooks for reusable logic
• Use React DevTools Profiler to identify bottlenecks
• Optimize bundle size with code splitting and lazy loading`
  },

  {
    id: "blog_business_remote_teams",
    title: "Building Successful Remote Teams in 2024",
    description: "Strategies and tools for managing distributed teams effectively, fostering collaboration, and maintaining company culture.", 
    author: authors[2], // David Rodriguez
    community: "Business Talk",
    tags: ["Remote", "Management", "Team"],
    content: `Remote work has become the new normal, but building truly effective remote teams requires intentional strategies and the right tools.

## Communication Best Practices

Clear communication is the foundation of successful remote teams:

• Establish clear communication protocols and expectations
• Use asynchronous communication effectively to respect time zones
• Schedule regular check-ins and team meetings
• Document important decisions and processes for future reference

## Essential Tools for Remote Collaboration

The right tools can make or break remote team success:

**Communication**: Slack, Discord, Microsoft Teams for instant messaging
**Project Management**: Notion, Asana, Trello for task tracking  
**Development**: GitHub, GitLab, VS Code Live Share for code collaboration
**Video Conferencing**: Zoom, Google Meet, Microsoft Teams for face-to-face interaction

## Fostering Team Culture Remotely

Maintaining company culture in a distributed environment:

• Virtual coffee chats and informal hangouts
• Online team building activities and games
• Recognition and celebration of achievements
• Clear company values and regular reinforcement`,
    simplified: `**Remote Team Success:**

• Clear communication protocols are essential for distributed teams
• Use the right mix of synchronous and asynchronous communication
• Regular check-ins maintain team connection and alignment
• Document everything for transparency and knowledge sharing
• Foster company culture through intentional virtual activities`
  }
];

// In-memory cache to store generated blogs
const blogCache = new Map();

// Generate consistent blog data
export const generateBlogData = (postId) => {
  // Check cache first
  if (blogCache.has(postId)) {
    return blogCache.get(postId);
  }

  // Find in master data first
  let blogData = masterBlogData.find(blog => blog.id === postId);
  
  if (!blogData) {
    // If not found, generate from master data based on ID pattern
    const hash = postId ? postId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) : 0;
    
    const index = Math.abs(hash) % masterBlogData.length;
    blogData = { ...masterBlogData[index] };
    blogData.id = postId; // Use the requested ID
  }

  // Add dynamic properties
  const enhancedData = {
    ...blogData,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    }),
    readTime: `${Math.floor(Math.random() * 10) + 3} min`,
    upvotes: Math.floor(Math.random() * 200) + 50,
    downvotes: Math.floor(Math.random() * 20) + 1,
    comments: Math.floor(Math.random() * 50) + 5,
    views: Math.floor(Math.random() * 2000) + 500,
    image: `https://picsum.photos/seed/${postId}/600/300`,
    bookmarked: Math.random() > 0.8
  };

  // Cache the result
  blogCache.set(postId, enhancedData);
  return enhancedData;
};

// Generate sample blogs for listing page
export const generateSampleBlogs = (count = 12) => {
  const blogs = [];
  
  for (let i = 0; i < count; i++) {
    const masterIndex = i % masterBlogData.length;
    const masterBlog = masterBlogData[masterIndex];
    
    const blogId = `${masterBlog.id}_${i}`;
    const blogData = generateBlogData(blogId);
    
    blogs.push(blogData);
  }
  
  return blogs;
};

// Get specific blog by ID
export const getBlogById = (id) => {
  return generateBlogData(id);
};

export default {
  generateBlogData,
  generateSampleBlogs,
  getBlogById
};