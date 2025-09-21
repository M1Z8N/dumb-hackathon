import { Profile, Hotspot, EditPrompt } from '../types';

// Image imports - must use require for local assets in React Native
const images: Record<string, any> = {
  'test-image.jpg': require('../assets/test-image.jpg'),
  'img.jpg': require('../assets/img.jpg'),
  'img2.jpg': require('../assets/img2.jpg'),
  'img3.jpg': require('../assets/img3.jpg'),
  'img4.jpg': require('../assets/img4.jpg'),
  'img5.jpg': require('../assets/img5.jpg'),
  'img6.jpg': require('../assets/img6.jpg'),
  'img7.jpg': require('../assets/img7.jpg'),
  'img8.jpg': require('../assets/img8.jpg'),
  'RYAN.png': require('../assets/RYAN.png'),
};

// Helper function to get images
const getImage = (imageName: string) => {
  return images[imageName] || images['test-image.jpg'];
};

export const seedProfiles: Profile[] = [
  {
    id: '1',
    name: 'Alex Chen',
    age: 28,
    preformanceScore: 92,
    tags: ['TechFounder', 'MatchaLover', 'SunsetChaser'],
    bio: 'Building the next big thing in SF. Coffee by day, code by night. Let\'s grab matcha and talk about your startup dreams.',
    photoUrl: getImage('img.jpg'),
    occupation: 'Tech Founder',
    location: 'Mission District, SF',
    interests: ['AI/ML', 'Coffee Culture', 'Hiking', 'Photography'],
    personality: {
      traits: ['Ambitious', 'Thoughtful', 'Adventurous'],
      vibe: 'Entrepreneurial go-getter with a creative side',
      communicationStyle: 'Direct and genuine, loves deep conversations'
    },
    contactLink: 'instagram://user?username=alextech',
    autoMatch: true,
  },
  {
    id: '2',
    name: 'Jordan Rivera',
    age: 26,
    preformanceScore: 88,
    tags: ['PatagoniaVested', 'ColdBrew', 'Minimalist'],
    bio: 'Product designer who believes less is more. Always down for a coffee walk in the fog or a weekend in the redwoods.',
    photoUrl: getImage('img2.jpg'),
    occupation: 'Product Designer',
    location: 'Hayes Valley, SF',
    interests: ['Design Systems', 'Nature', 'Coffee Roasting', 'Film Photography'],
    personality: {
      traits: ['Creative', 'Mindful', 'Authentic'],
      vibe: 'Calm and collected, appreciates the simple things',
      communicationStyle: 'Thoughtful and deliberate, asks great questions'
    },
    contactLink: 'https://linktr.ee/jordan_design',
  },
  {
    id: '3',
    name: 'Marcus Thompson',
    age: 32,
    preformanceScore: 85,
    tags: ['FilmPhotography', 'NaturalWine', 'Vintage'],
    bio: 'Software engineer by day, analog photography enthusiast by night. Love exploring hidden SF spots and finding the perfect natural wine pairing.',
    photoUrl: getImage('img3.jpg'),
    occupation: 'Software Engineer',
    location: 'Noe Valley, SF',
    interests: ['Film Photography', 'Wine Tasting', 'Cycling', 'Jazz'],
    personality: {
      traits: ['Artistic', 'Curious', 'Sophisticated'],
      vibe: 'Old soul in a young body, appreciates craftsmanship',
      communicationStyle: 'Engaging storyteller with a dry wit'
    },
    autoMatch: true,
  },
  {
    id: '4',
    name: 'Taylor Kim',
    age: 29,
    preformanceScore: 91,
    tags: ['PlantParent', 'Sourdough', 'Ceramics'],
    bio: 'Marketing strategist who turned their kitchen into a mini-farm. Let\'s talk about fermentation, pottery, and why SF weather is perfect for both.',
    photoUrl: getImage('img4.jpg'),
    occupation: 'Marketing Director',
    location: 'Castro, SF',
    interests: ['Urban Gardening', 'Baking', 'Pottery', 'Podcasts'],
    personality: {
      traits: ['Nurturing', 'Creative', 'Community-oriented'],
      vibe: 'Warm and welcoming, loves bringing people together',
      communicationStyle: 'Enthusiastic and genuine, great at making connections'
    },
    contactLink: 'tiktok://user?username=taylor_makes',
  },
  {
    id: '5',
    name: 'Riley Park',
    age: 27,
    preformanceScore: 87,
    tags: ['RunClub', 'OatMilk', 'Journaling'],
    bio: 'Data scientist who runs marathons and writes poetry. Looking for someone who appreciates both the analytical mind and the artistic heart.',
    photoUrl: getImage('img5.jpg'),
    occupation: 'Data Scientist',
    location: 'SOMA, SF',
    interests: ['Running', 'Poetry', 'Data Viz', 'Meditation'],
    personality: {
      traits: ['Analytical', 'Sensitive', 'Driven'],
      vibe: 'Deep thinker with an active lifestyle',
      communicationStyle: 'Reflective and honest, values meaningful dialogue'
    },
  },
  {
    id: '6',
    name: 'Casey Wu',
    age: 31,
    preformanceScore: 89,
    tags: ['ThriftFlip', 'Kombucha', 'Astrology'],
    bio: 'UX researcher who can talk about user behavior or Mercury retrograde with equal enthusiasm. Always up for a thrifting adventure.',
    photoUrl: getImage('img6.jpg'),
    occupation: 'UX Researcher',
    location: 'Richmond District, SF',
    interests: ['Thrift Shopping', 'Astrology', 'Board Games', 'Cooking'],
    personality: {
      traits: ['Intuitive', 'Playful', 'Insightful'],
      vibe: 'Curious about everything, especially people',
      communicationStyle: 'Warm and engaging, loves sharing insights'
    },
    autoMatch: true,
  },
  {
    id: '7',
    name: 'Morgan Lee',
    age: 25,
    preformanceScore: 83,
    tags: ['Climbing', 'Podcast', 'Sustainable'],
    bio: 'Environmental consultant who climbs rocks and fights climate change. Seeking someone who shares the passion for protecting our planet.',
    photoUrl: getImage('img7.jpg'),
    occupation: 'Environmental Consultant',
    location: 'Bernal Heights, SF',
    interests: ['Rock Climbing', 'Environmental Activism', 'Podcasts', 'Camping'],
    personality: {
      traits: ['Passionate', 'Adventurous', 'Principled'],
      vibe: 'Determined to make a difference',
      communicationStyle: 'Direct and passionate about causes'
    },
  },
  {
    id: '8',
    name: 'Sam Rodriguez',
    age: 30,
    preformanceScore: 94,
    tags: ['FramerBag', 'Aperol', 'GalleryOpening'],
    bio: 'Art director who lives for gallery openings and aperol spritz season. Let\'s discuss your favorite exhibitions over drinks.',
    photoUrl: getImage('img8.jpg'),
    occupation: 'Art Director',
    location: 'Dogpatch, SF',
    interests: ['Contemporary Art', 'Cocktails', 'Design', 'Fashion'],
    personality: {
      traits: ['Stylish', 'Cultured', 'Charismatic'],
      vibe: 'Always knows the coolest spots and trends',
      communicationStyle: 'Engaging and sophisticated, loves cultural discussions'
    },
    contactLink: 'instagram://user?username=sam_art',
  },
  {
    id: '9',
    name: 'Ryan Chen',
    age: 26,
    preformanceScore: 98,
    tags: ['MatchaObsessed', 'NYTransplant', 'FinTech'],
    bio: 'NYC → SF. Matcha sommelier who rates every café in the city. Building the next unicorn fintech, one latte at a time.',
    photoUrl: getImage('RYAN.png'),
    occupation: 'Fintech Founder',
    location: 'Pacific Heights, SF',
    interests: ['Matcha', 'New York Culture', 'Crypto', 'Specialty Coffee'],
    personality: {
      traits: ['Ambitious', 'Caffeinated', 'Fast-talking'],
      vibe: 'Manhattan energy meets SF tech optimism',
      communicationStyle: 'Quick wit with a New York edge'
    },
    contactLink: 'instagram://user?username=ryanmatcha',
    autoMatch: true,
  },
];

export const seedHotspots: Hotspot[] = [
  {
    id: 'spot1',
    name: 'Blue Bottle Coffee',
    latitude: 37.7749,
    longitude: -122.4194,
    averageScore: 89,
    topProfiles: [seedProfiles[0], seedProfiles[1]],
    matchaLoverProbability: 67,
  },
  {
    id: 'spot2',
    name: 'Whole Foods Market',
    latitude: 37.7739,
    longitude: -122.4189,
    averageScore: 86,
    topProfiles: [seedProfiles[3], seedProfiles[4]],
    matchaLoverProbability: 45,
  },
  {
    id: 'spot3',
    name: 'Equinox Gym',
    latitude: 37.7759,
    longitude: -122.4184,
    averageScore: 91,
    topProfiles: [seedProfiles[4], seedProfiles[6]],
    matchaLoverProbability: 32,
  },
  {
    id: 'spot4',
    name: 'The Interval at Long Now',
    latitude: 37.7769,
    longitude: -122.4179,
    averageScore: 94,
    topProfiles: [seedProfiles[7], seedProfiles[2]],
    matchaLoverProbability: 78,
  },
  {
    id: 'spot5',
    name: 'Farmers Market',
    latitude: 37.7729,
    longitude: -122.4199,
    averageScore: 88,
    topProfiles: [seedProfiles[3], seedProfiles[5]],
    matchaLoverProbability: 71,
  },
];

export const editPrompts: EditPrompt[] = [
  { id: 'p1', text: 'Add sunglasses', scoreBonus: 8 },
  { id: 'p2', text: 'Add iced matcha', scoreBonus: 12 },
  { id: 'p3', text: 'Add tote bag', scoreBonus: 10 },
  { id: 'p4', text: 'Change to Patagonia vest', scoreBonus: 15 },
  { id: 'p5', text: 'Add AirPods', scoreBonus: 7 },
  { id: 'p6', text: 'Make more performative', scoreBonus: 20 },
];

export const sampleEditedImages = {
  sunglasses: 'https://picsum.photos/seed/edited1/400/600',
  matcha: 'https://picsum.photos/seed/edited2/400/600',
  tote: 'https://picsum.photos/seed/edited3/400/600',
  vest: 'https://picsum.photos/seed/edited4/400/600',
};