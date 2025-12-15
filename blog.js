// Blog functionality
const blogPosts = [
  {
    id: 1,
    title: 'India Stack 2.0: The Next Evolution of Digital Public Infrastructure',
    excerpt: 'India Stack continues to evolve with new layers including ONDC, OCEN, and Account Aggregator frameworks. These modular rails are inspiring global policy makers.',
    content: 'India Stack 2.0 represents a significant evolution in digital public infrastructure. Building on the success of Aadhaar, UPI, and DigiLocker, the new layers include Open Network for Digital Commerce (ONDC), Open Credit Enablement Network (OCEN), and Account Aggregator frameworks. These innovations are creating new possibilities for financial inclusion and digital commerce.',
    date: '2024-01-15',
    category: 'present',
    tags: ['DPI', 'Fintech', 'Policy'],
    author: 'Tech Atlas Team'
  },
  {
    id: 2,
    title: 'Remembering TIFR: The Birthplace of Indian Computing',
    excerpt: 'Tata Institute of Fundamental Research played a crucial role in India\'s early computing journey, building analog computers for cosmic-ray research in the 1950s.',
    content: 'The Tata Institute of Fundamental Research (TIFR) holds a special place in India\'s computing history. In the 1950s, scientists at TIFR built early analog computers to solve differential equations for cosmic-ray studies. This pioneering work laid the foundation for India\'s computing capabilities and demonstrated the country\'s potential in scientific computing.',
    date: '2024-01-10',
    category: 'past',
    tags: ['History', 'Research', 'Computing'],
    author: 'Tech Atlas Team'
  },
  {
    id: 3,
    title: 'Quantum Computing in India: National Quantum Mission Progress',
    excerpt: 'India\'s National Quantum Mission aims to develop quantum technologies including computing, communication, and sensing. Early progress shows promise.',
    content: 'The National Quantum Mission represents India\'s ambitious push into quantum technologies. With investments in quantum computing, quantum communication, and quantum sensing, India aims to become a leader in this emerging field. The mission focuses on developing indigenous capabilities while collaborating with global partners.',
    date: '2024-01-05',
    category: 'future',
    tags: ['Quantum', 'Research', 'Future Tech'],
    author: 'Tech Atlas Team'
  },
  {
    id: 4,
    title: 'Indian Unicorns: Crossing the 100 Mark',
    excerpt: 'India now hosts over 100 unicorn startups, with sectors like fintech, edtech, and SaaS leading the way. The ecosystem continues to mature.',
    content: 'India\'s startup ecosystem has reached a significant milestone with over 100 unicorn companies. Fintech, edtech, and SaaS sectors have been particularly strong, with companies like Razorpay, Byju\'s, and Zoho leading the way. The ecosystem continues to mature with increasing investor confidence and government support.',
    date: '2023-12-20',
    category: 'present',
    tags: ['Startups', 'Unicorns', 'Ecosystem'],
    author: 'Tech Atlas Team'
  },
  {
    id: 5,
    title: 'ISRO\'s Chandrayaan-3: Lessons for Indian Tech',
    excerpt: 'The successful Chandrayaan-3 mission demonstrates India\'s capability in frugal engineering and space technology, inspiring the broader tech ecosystem.',
    content: 'Chandrayaan-3\'s successful soft landing on the Moon\'s south pole showcased India\'s engineering excellence and cost-effective approach to space exploration. The mission, completed at a fraction of the cost of similar international missions, demonstrates the "frugal engineering" philosophy that has become a hallmark of Indian innovation.',
    date: '2023-12-15',
    category: 'present',
    tags: ['Space', 'Innovation', 'Engineering'],
    author: 'Tech Atlas Team'
  },
  {
    id: 6,
    title: 'The Future of Indian Semiconductor Industry',
    excerpt: 'With DLI incentives and new fab investments, India is building a comprehensive semiconductor ecosystem from design to manufacturing.',
    content: 'India\'s semiconductor ambitions are taking shape with the Design-Linked Incentive (DLI) scheme and investments in fabrication facilities. Companies like Micron are setting up assembly plants, while homegrown design companies are gaining recognition. The focus is on 28nm and specialty nodes, creating opportunities across the value chain.',
    date: '2023-12-10',
    category: 'future',
    tags: ['Semiconductors', 'Manufacturing', 'Policy'],
    author: 'Tech Atlas Team'
  },
  {
    id: 7,
    title: 'Digital Education: Transforming Learning in India',
    excerpt: 'Edtech platforms and digital learning tools are making quality education accessible across India, bridging urban-rural divides.',
    content: 'Digital education is transforming how students learn in India. Platforms like SWAYAM, NPTEL, and various edtech startups are making quality education accessible to millions. The COVID-19 pandemic accelerated adoption, and the trend continues with innovative learning models and AI-powered personalization.',
    date: '2023-12-05',
    category: 'education',
    tags: ['Education', 'Edtech', 'Digital'],
    author: 'Tech Atlas Team'
  },
  {
    id: 8,
    title: 'AgriTech Revolution: Technology Meets Agriculture',
    excerpt: 'Startups are using AI, IoT, and data analytics to help Indian farmers increase yields, reduce costs, and access markets more effectively.',
    content: 'AgriTech is revolutionizing Indian agriculture with innovative solutions. From AI-powered crop monitoring to IoT-based irrigation systems, startups are helping farmers make data-driven decisions. Market linkage platforms are connecting farmers directly with buyers, improving price realization and reducing middlemen.',
    date: '2023-11-28',
    category: 'startups',
    tags: ['AgriTech', 'Startups', 'Agriculture'],
    author: 'Tech Atlas Team'
  }
];

let currentFilter = 'all';

function renderBlogPosts() {
  const container = document.getElementById('blog-posts');
  if (!container) return;

  const filtered = currentFilter === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === currentFilter);

  if (filtered.length === 0) {
    container.innerHTML = '<p>No posts found in this category.</p>';
    return;
  }

  container.innerHTML = filtered.map(post => `
    <article class="blog-post" data-category="${post.category}">
      <h3>${post.title}</h3>
      <div class="blog-meta">
        <span>📅 ${formatDate(post.date)}</span>
        <span>✍️ ${post.author}</span>
        <span>🏷️ ${post.category}</span>
      </div>
      <p>${post.excerpt}</p>
      <div class="blog-tags">
        ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function initBlog() {
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderBlogPosts();
    });
  });

  // Initial render
  renderBlogPosts();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlog);
} else {
  initBlog();
}

