import { getAllUsers, saveUserProfile, generateUserId, generateBadges } from "./storage"

// Helper to randomize coordinates for privacy
const randomizeLocation = (lat: number, lng: number) => {
  const radiusInDegrees = 0.05 // ~5km
  const u = Math.random()
  const v = Math.random()
  const w = radiusInDegrees * Math.sqrt(u)
  const t = 2 * Math.PI * v
  const x = w * Math.cos(t)
  const y = w * Math.sin(t)
  return { lat: lat + x, lng: lng + y }
}

// Remove all mock data arrays to ensure no placeholder profiles are created
/*
const mockNames = [
  { display: "Alex Chen", username: "alexchen" },
  { display: "Jordan Smith", username: "jordansmith" },
  { display: "Taylor Johnson", username: "taylorj" },
  { display: "Morgan Lee", username: "morganlee" },
  { display: "Casey Williams", username: "caseyw" },
  { display: "Riley Brown", username: "rileybrown" },
  { display: "Avery Davis", username: "averydavis" },
  { display: "Quinn Martinez", username: "quinnm" },
  { display: "Sage Anderson", username: "sageand" },
  { display: "River Taylor", username: "rivertaylor" },
  { display: "Phoenix White", username: "phoenixw" },
  { display: "Dakota Green", username: "dakotag" },
  { display: "Skylar Harris", username: "skylarh" },
  { display: "Cameron Clark", username: "cameronc" },
  { display: "Blake Robinson", username: "blaker" },
]

const mockLocations = [
  { lat: 40.7128, lng: -74.0060, city: "New York", country: "USA" },
  { lat: 51.5074, lng: -0.1278, city: "London", country: "UK" },
  { lat: 19.0760, lng: 72.8777, city: "Mumbai", country: "India" },
  { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan" },
  { lat: 52.5200, lng: 13.4050, city: "Berlin", country: "Germany" },
  { lat: 37.7749, lng: -122.4194, city: "San Francisco", country: "USA" },
  { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia" },
  { lat: 1.3521, lng: 103.8198, city: "Singapore", country: "Singapore" },
  { lat: 48.8566, lng: 2.3522, city: "Paris", country: "France" },
  { lat: 43.6532, lng: -79.3832, city: "Toronto", country: "Canada" },
  { lat: -23.5505, lng: -46.6333, city: "São Paulo", country: "Brazil" },
  { lat: 55.7558, lng: 37.6173, city: "Moscow", country: "Russia" },
  { lat: 25.2048, lng: 55.2708, city: "Dubai", country: "UAE" },
  { lat: 13.7563, lng: 100.5018, city: "Bangkok", country: "Thailand" },
  { lat: -1.2921, lng: 36.8219, city: "Nairobi", country: "Kenya" },
]

const bios = [
  "Building the future, one line of code at a time",
  "Designer, developer, and dreamer",
  "Passionate about creating beautiful digital experiences",
  "Tech enthusiast and startup founder",
  "Open source contributor and community builder",
  "AI researcher exploring new possibilities",
  "Full-stack developer with a design mindset",
  "Helping startups scale with technology",
  "Creative technologist and innovator",
  "Building tools that matter",
]

const quotes = [
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Innovation distinguishes between a leader and a follower.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future belongs to those who believe in the beauty of their dreams.",
]

const interests = [
  ["Design", "Web3", "Startups"],
  ["AI", "Machine Learning", "Data Science"],
  ["React", "Next.js", "TypeScript"],
  ["Product", "UX", "Design Systems"],
  ["DevOps", "Cloud", "Infrastructure"],
  ["Mobile", "iOS", "Flutter"],
  ["Backend", "Databases", "APIs"],
  ["Security", "Privacy", "Blockchain"],
  ["Marketing", "Growth", "Analytics"],
  ["Leadership", "Mentoring", "Community"],
]

const projectTitles = [
  "AI Chat Assistant",
  "Design System",
  "Mobile App",
  "Analytics Dashboard",
  "Open Source Library",
  "SaaS Platform",
  "Browser Extension",
  "CLI Tool",
  "API Gateway",
  "Data Visualization",
]

const projectDescriptions = [
  "A powerful tool for modern developers",
  "Streamline your workflow with automation",
  "Beautiful and intuitive user experience",
  "Built with performance in mind",
  "Open source and community-driven",
  "Enterprise-grade solution",
  "Lightweight and fast",
  "Easy to integrate and use",
  "Scalable architecture",
  "Production-ready",
]

const goalTitles = [
  "Launch SaaS Product",
  "Build Open Source Community",
  "Reach 10k Users",
  "Ship AI Features",
  "Expand to 3 Countries",
  "Raise Series A",
  "Hit 1M Downloads",
  "Build Design System",
  "Create Course",
  "Mentor 10 Developers",
]

const links = [
  { title: "GitHub", url: "https://github.com" },
  { title: "Twitter", url: "https://twitter.com" },
  { title: "Portfolio", url: "https://example.com" },
  { title: "LinkedIn", url: "https://linkedin.com" },
]
*/

export function initializeMockData() {
  // This function is intentionally left empty to prevent mock data initialization
  // The application will start with 0 users as requested
  return
}
