export interface VolunteerEvent {
  id: string;
  title: string;
  organization: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  spotsAvailable: number;
  totalSpots: number;
  image: string;
  isSignedUp?: boolean;
  registrationStatus?: 'pending' | 'confirmed' | 'cancelled';
  contributionConfirmed?: boolean;
}

export interface Post {
  id: string;
  eventId: string;
  eventTitle: string;
  author: string;
  authorAvatar: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export interface Notification {
  id: string;
  type: 'signup' | 'reminder' | 'update' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  hoursVolunteered: number;
  eventsAttended: number;
  joinedDate: string;
}

export const volunteerEvents: VolunteerEvent[] = [
  {
    id: '1',
    title: 'Beach Cleanup Day',
    organization: 'Ocean Conservation Society',
    date: '2025-11-15',
    time: '9:00 AM - 12:00 PM',
    location: 'Santa Monica Beach, CA',
    description: 'Join us for a morning of beach cleanup! Help protect marine life by removing trash and plastic from our beautiful coastline.',
    category: 'Environment',
    spotsAvailable: 12,
    totalSpots: 30,
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGNsZWFudXAlMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkxNDY1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: false
  },
  {
    id: '2',
    title: 'Food Bank Distribution',
    organization: 'Community Food Bank',
    date: '2025-11-08',
    time: '2:00 PM - 6:00 PM',
    location: 'Downtown Community Center',
    description: 'Help sort, pack, and distribute food to families in need. Make a direct impact on fighting hunger in our community.',
    category: 'Community',
    spotsAvailable: 8,
    totalSpots: 20,
    image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwYmFuayUyMHZvbHVudGVlcnN8ZW58MXx8fHwxNzYxOTM1MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: true,
    contributionConfirmed: true
  },
  {
    id: '3',
    title: 'After School Tutoring',
    organization: 'Youth Education Alliance',
    date: '2025-11-10',
    time: '3:30 PM - 5:30 PM',
    location: 'Lincoln Elementary School',
    description: 'Mentor and tutor elementary students in math and reading. Help build confidence and academic skills in young learners.',
    category: 'Education',
    spotsAvailable: 5,
    totalSpots: 15,
    image: 'https://images.unsplash.com/photo-1632932693914-89b90ae3d16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGluZyUyMGNoaWxkcmVuJTIwdm9sdW50ZWVyc3xlbnwxfHx8fDE3NjE5ODU3MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: true,
    contributionConfirmed: false
  },
  {
    id: '4',
    title: 'Tree Planting Initiative',
    organization: 'Green Future Foundation',
    date: '2025-11-22',
    time: '8:00 AM - 1:00 PM',
    location: 'Riverside Park',
    description: 'Plant native trees to restore local habitats and combat climate change. All tools and training provided.',
    category: 'Environment',
    spotsAvailable: 20,
    totalSpots: 50,
    image: 'https://images.unsplash.com/photo-1633975531445-94aa5f8d5a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkzMzYxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: false
  },
  {
    id: '5',
    title: 'Animal Shelter Support',
    organization: 'Happy Paws Rescue',
    date: '2025-11-12',
    time: '10:00 AM - 3:00 PM',
    location: 'Happy Paws Animal Shelter',
    description: 'Spend time with shelter animals, help with feeding, cleaning, and socializing pets waiting for their forever homes.',
    category: 'Animals',
    spotsAvailable: 6,
    totalSpots: 12,
    image: 'https://images.unsplash.com/photo-1700665537604-412e89a285c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltYWwlMjBzaGVsdGVyJTIwdm9sdW50ZWVyc3xlbnwxfHx8fDE3NjE5ODU3MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: false
  },
  {
    id: '6',
    title: 'Senior Center Activities',
    organization: 'ElderCare Community',
    date: '2025-11-18',
    time: '1:00 PM - 4:00 PM',
    location: 'Sunset Senior Center',
    description: 'Lead activities, play games, and provide companionship to seniors. Bring joy and reduce isolation in our elderly community.',
    category: 'Community',
    spotsAvailable: 10,
    totalSpots: 15,
    image: 'https://images.unsplash.com/photo-1751666526244-40239a251eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXJzJTIwY29tbXVuaXR5JTIwc2VydmljZXxlbnwxfHx8fDE3NjE4OTQ3NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: true,
    contributionConfirmed: true
  },
  {
    id: '7',
    title: 'Homeless Outreach Program',
    organization: 'Streets to Home',
    date: '2025-11-20',
    time: '6:00 PM - 9:00 PM',
    location: 'Downtown District',
    description: 'Distribute meals, clothing, and care packages to individuals experiencing homelessness. Training provided.',
    category: 'Community',
    spotsAvailable: 15,
    totalSpots: 25,
    image: 'https://images.unsplash.com/photo-1751666526244-40239a251eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXJzJTIwY29tbXVuaXR5JTIwc2VydmljZXxlbnwxfHx8fDE3NjE4OTQ3NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: false
  },
  {
    id: '8',
    title: 'Community Garden Day',
    organization: 'Urban Harvest Collective',
    date: '2025-11-25',
    time: '9:00 AM - 2:00 PM',
    location: 'Maple Street Community Garden',
    description: 'Help maintain our community garden! Activities include planting, weeding, and harvesting fresh produce for local families.',
    category: 'Environment',
    spotsAvailable: 18,
    totalSpots: 30,
    image: 'https://images.unsplash.com/photo-1633975531445-94aa5f8d5a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkzMzYxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: false
  },
  {
    id: '9',
    title: 'Hospital Visit Volunteers',
    organization: 'Health & Wellness Foundation',
    date: '2025-10-25',
    time: '2:00 PM - 5:00 PM',
    location: 'City General Hospital',
    description: 'Bring joy to patients by visiting, reading, and providing companionship. Background check required.',
    category: 'Community',
    spotsAvailable: 0,
    totalSpots: 10,
    image: 'https://images.unsplash.com/photo-1751666526244-40239a251eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXJzJTIwY29tbXVuaXR5JTIwc2VydmljZXxlbnwxfHx8fDE3NjE4OTQ3NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: true,
    contributionConfirmed: true
  },
  {
    id: '10',
    title: 'Park Beautification',
    organization: 'City Parks Department',
    date: '2025-10-15',
    time: '8:00 AM - 12:00 PM',
    location: 'Riverside Park',
    description: 'Help beautify our local park by planting flowers, painting benches, and cleaning walkways.',
    category: 'Environment',
    spotsAvailable: 0,
    totalSpots: 25,
    image: 'https://images.unsplash.com/photo-1633975531445-94aa5f8d5a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkzMzYxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: true,
    contributionConfirmed: true
  },
  {
    id: '11',
    title: 'Youth Sports Coaching',
    organization: 'Community Sports League',
    date: '2025-10-30',
    time: '4:00 PM - 6:00 PM',
    location: 'Central Community Center',
    description: 'Coach young athletes in soccer and basketball fundamentals. Previous experience helpful but not required.',
    category: 'Education',
    spotsAvailable: 0,
    totalSpots: 8,
    image: 'https://images.unsplash.com/photo-1632932693914-89b90ae3d16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGluZyUyMGNoaWxkcmVuJTIwdm9sdW50ZWVyc3xlbnwxfHx8fDE3NjE5ODU3MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: false
  },
  {
    id: '12',
    title: 'Library Book Drive',
    organization: 'Public Library Foundation',
    date: '2025-11-01',
    time: '10:00 AM - 3:00 PM',
    location: 'Main Public Library',
    description: 'Sort and organize donated books for distribution to underfunded schools and community centers.',
    category: 'Education',
    spotsAvailable: 0,
    totalSpots: 15,
    image: 'https://images.unsplash.com/photo-1632932693914-89b90ae3d16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGluZyUyMGNoaWxkcmVuJTIwdm9sdW50ZWVyc3xlbnwxfHx8fDE3NjE5ODU3MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isSignedUp: false
  }
];

export const posts: Post[] = [
  {
    id: 'p1',
    eventId: '2',
    eventTitle: 'Food Bank Distribution',
    author: 'Sarah Johnson',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Had an amazing time volunteering at the Food Bank today! We helped distribute food to over 200 families. The gratitude in people\'s eyes was truly heartwarming. Can\'t wait for the next event! 💚',
    image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwYmFuayUyMHZvbHVudGVlcnN8ZW58MXx8fHwxNzYxOTM1MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: '2 hours ago',
    likes: 42,
    comments: 8
  },
  {
    id: 'p2',
    eventId: '3',
    eventTitle: 'After School Tutoring',
    author: 'Michael Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    content: 'Just finished my first tutoring session with the kids! It\'s incredible to see their faces light up when they finally understand a concept. This is what volunteering is all about! 📚✨',
    timestamp: '5 hours ago',
    likes: 38,
    comments: 12
  },
  {
    id: 'p3',
    eventId: '6',
    eventTitle: 'Senior Center Activities',
    author: 'Emma Rodriguez',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    content: 'The stories I heard today at the Senior Center were absolutely inspiring! We played bingo, shared laughs, and created beautiful memories. These seniors have so much wisdom to share. 💛',
    image: 'https://images.unsplash.com/photo-1751666526244-40239a251eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXJzJTIwY29tbXVuaXR5JTIwc2VydmljZXxlbnwxfHx8fDE3NjE4OTQ3NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: '1 day ago',
    likes: 56,
    comments: 15
  },
  {
    id: 'p4',
    eventId: '3',
    eventTitle: 'After School Tutoring',
    author: 'David Kim',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    content: 'Week 3 of tutoring and I\'m seeing real progress! Little Timmy went from struggling with multiplication to solving problems confidently. This is why I volunteer! 🎯',
    timestamp: '2 days ago',
    likes: 29,
    comments: 6
  },
  {
    id: 'p5',
    eventId: '1',
    eventTitle: 'Beach Cleanup Day',
    author: 'Lisa Anderson',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    content: 'What an incredible morning at the beach! Our team collected over 150 pounds of plastic and trash. The ocean is looking cleaner already! 🌊',
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGNsZWFudXAlMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkxNDY1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: '3 days ago',
    likes: 67,
    comments: 18
  },
  {
    id: 'p6',
    eventId: '1',
    eventTitle: 'Beach Cleanup Day',
    author: 'Tom Rodriguez',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
    content: 'First time joining a beach cleanup and it was amazing! Met so many passionate people. Already signed up for the next one! 💚',
    timestamp: '4 days ago',
    likes: 45,
    comments: 9
  },
  {
    id: 'p7',
    eventId: '4',
    eventTitle: 'Tree Planting Initiative',
    author: 'Rachel Green',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
    content: 'We planted 200 trees today! My arms are tired but my heart is full. Can\'t wait to see these grow into a beautiful forest. 🌳',
    image: 'https://images.unsplash.com/photo-1633975531445-94aa5f8d5a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkzMzYxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: '5 days ago',
    likes: 82,
    comments: 21
  },
  {
    id: 'p8',
    eventId: '2',
    eventTitle: 'Food Bank Distribution',
    author: 'James Wilson',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    content: 'Another successful day at the food bank. The smiles on people\'s faces when they receive help is priceless. Grateful to be part of this! ❤️',
    timestamp: '1 week ago',
    likes: 51,
    comments: 11
  }
];

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'reminder',
    title: 'Event Reminder',
    message: 'Food Bank Distribution starts tomorrow at 2:00 PM. Don\'t forget to bring your volunteer ID!',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: 'n2',
    type: 'signup',
    title: 'Registration Confirmed',
    message: 'You\'ve successfully signed up for "After School Tutoring" on November 10.',
    timestamp: '3 hours ago',
    read: false
  },
  {
    id: 'n3',
    type: 'update',
    title: 'Event Update',
    message: 'The location for "Senior Center Activities" has been updated. Please check the event details.',
    timestamp: '1 day ago',
    read: true
  },
  {
    id: 'n4',
    type: 'message',
    title: 'New Message',
    message: 'Ocean Conservation Society sent you a message about upcoming beach cleanups.',
    timestamp: '1 day ago',
    read: true
  },
  {
    id: 'n5',
    type: 'reminder',
    title: 'Hours Milestone',
    message: 'Congratulations! You\'ve completed 50 volunteer hours this year! 🎉',
    timestamp: '2 days ago',
    read: true
  },
  {
    id: 'n6',
    type: 'signup',
    title: 'New Event Available',
    message: 'Tree Planting Initiative has opened registration. Spots are filling fast!',
    timestamp: '3 days ago',
    read: true
  }
];

export const userProfile: UserProfile = {
  name: 'Alex Thompson',
  email: 'alex.thompson@email.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  bio: 'Passionate about giving back to the community and making a positive impact. Love working with kids and environmental causes.',
  hoursVolunteered: 127,
  eventsAttended: 18,
  joinedDate: 'January 2024'
};

// Manager-specific data
export interface ManagedEvent {
  id: string;
  title: string;
  organization: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  totalSpots: number;
  image: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface EventVolunteer {
  id: string;
  eventId: string;
  name: string;
  email: string;
  avatar: string;
  hoursVolunteered: number;
  eventsAttended: number;
  status: 'pending' | 'confirmed' | 'rejected';
  appliedDate: string;
  contributionConfirmed: boolean;
}

export const managedEvents: ManagedEvent[] = [
  {
    id: 'm1',
    title: 'Beach Cleanup Day',
    organization: 'Ocean Conservation Society',
    date: '2025-11-15',
    time: '9:00 AM - 12:00 PM',
    location: 'Santa Monica Beach, CA',
    description: 'Join us for a morning of beach cleanup! Help protect marine life by removing trash and plastic from our beautiful coastline.',
    category: 'Environment',
    totalSpots: 30,
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGNsZWFudXAlMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkxNDY1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active'
  },
  {
    id: 'm2',
    title: 'Community Garden Day',
    organization: 'Urban Harvest Collective',
    date: '2025-11-25',
    time: '9:00 AM - 2:00 PM',
    location: 'Maple Street Community Garden',
    description: 'Help maintain our community garden! Activities include planting, weeding, and harvesting fresh produce for local families.',
    category: 'Environment',
    totalSpots: 30,
    image: 'https://images.unsplash.com/photo-1633975531445-94aa5f8d5a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkzMzYxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active'
  },
  {
    id: 'm3',
    title: 'Food Bank Distribution',
    organization: 'Community Food Bank',
    date: '2025-11-08',
    time: '2:00 PM - 6:00 PM',
    location: 'Downtown Community Center',
    description: 'Help sort, pack, and distribute food to families in need. Make a direct impact on fighting hunger in our community.',
    category: 'Community',
    totalSpots: 20,
    image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwYmFuayUyMHZvbHVudGVlcnN8ZW58MXx8fHwxNzYxOTM1MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active'
  },
  {
    id: 'm4',
    title: 'Senior Tech Workshop',
    organization: 'ElderCare Community',
    date: '2025-10-28',
    time: '2:00 PM - 5:00 PM',
    location: 'Sunset Senior Center',
    description: 'Completed workshop teaching seniors how to use smartphones and tablets.',
    category: 'Education',
    totalSpots: 15,
    image: 'https://images.unsplash.com/photo-1751666526244-40239a251eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXJzJTIwY29tbXVuaXR5JTIwc2VydmljZXxlbnwxfHx8fDE3NjE4OTQ3NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'completed'
  }
];

// Admin-specific data
export interface PendingManagerRequest {
  id: string;
  name: string;
  email: string;
  avatar: string;
  organization: string;
  reason: string;
  requestDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  accountType: 'user' | 'manager';
  hoursVolunteered: number;
  eventsAttended: number;
  joinedDate: string;
  bio: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  organization: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  totalSpots: number;
  image: string;
  status: 'active' | 'completed' | 'cancelled';
  createdBy: string;
}

export const pendingManagerRequests: PendingManagerRequest[] = [
  {
    id: 'pmr1',
    name: 'Jennifer Martinez',
    email: 'jennifer.m@oceanguardians.org',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
    organization: 'Ocean Guardians',
    reason: 'I lead the Ocean Guardians environmental organization and would like to create beach cleanup and ocean conservation events on the platform.',
    requestDate: '2 days ago'
  },
  {
    id: 'pmr2',
    name: 'Robert Chen',
    email: 'robert.chen@youthmentors.org',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    organization: 'Youth Mentors Alliance',
    reason: 'I coordinate tutoring programs for underprivileged children and want to recruit volunteers through VolunteerHub.',
    requestDate: '5 days ago'
  },
  {
    id: 'pmr3',
    name: 'Maria Garcia',
    email: 'maria.g@communitykitchen.org',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    organization: 'Community Kitchen Network',
    reason: 'Our organization runs multiple food distribution centers and needs to manage volunteer schedules efficiently.',
    requestDate: '1 week ago'
  }
];

export const allUsers: User[] = [
  {
    id: 'u1',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    accountType: 'user',
    hoursVolunteered: 127,
    eventsAttended: 18,
    joinedDate: 'January 2024',
    bio: 'Passionate about giving back to the community and making a positive impact.'
  },
  {
    id: 'u2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    accountType: 'user',
    hoursVolunteered: 45,
    eventsAttended: 8,
    joinedDate: 'March 2024',
    bio: 'Love volunteering at food banks and community events.'
  },
  {
    id: 'u3',
    name: 'Michael Chen',
    email: 'michael.c@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    accountType: 'user',
    hoursVolunteered: 62,
    eventsAttended: 12,
    joinedDate: 'February 2024',
    bio: 'Education advocate and tutoring volunteer.'
  },
  {
    id: 'u4',
    name: 'Manager Account',
    email: 'manager@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager',
    accountType: 'manager',
    hoursVolunteered: 0,
    eventsAttended: 0,
    joinedDate: 'January 2024',
    bio: 'Event organizer and community leader.'
  },
  {
    id: 'u5',
    name: 'Emma Rodriguez',
    email: 'emma.r@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    accountType: 'user',
    hoursVolunteered: 38,
    eventsAttended: 6,
    joinedDate: 'April 2024',
    bio: 'Senior care volunteer and community supporter.'
  },
  {
    id: 'u6',
    name: 'David Kim',
    email: 'david.k@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    accountType: 'user',
    hoursVolunteered: 89,
    eventsAttended: 15,
    joinedDate: 'December 2023',
    bio: 'Environmental activist and tree planting enthusiast.'
  },
  {
    id: 'u7',
    name: 'Lisa Anderson',
    email: 'lisa.a@greenorganization.org',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    accountType: 'manager',
    hoursVolunteered: 0,
    eventsAttended: 0,
    joinedDate: 'February 2024',
    bio: 'Environmental organization coordinator.'
  }
];

export const pendingEvents: AdminEvent[] = [
  {
    id: 'pe1',
    title: 'City Park Restoration',
    organization: 'Green Spaces Initiative',
    date: '2025-11-30',
    time: '8:00 AM - 2:00 PM',
    location: 'Central City Park',
    description: 'Help restore our city park by planting flowers, cleaning paths, and painting benches. All materials and lunch provided.',
    category: 'Environment',
    totalSpots: 40,
    image: 'https://images.unsplash.com/photo-1633975531445-94aa5f8d5a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkzMzYxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    createdBy: 'manager@gmail.com'
  },
  {
    id: 'pe2',
    title: 'Holiday Meal Distribution',
    organization: 'Community Food Network',
    date: '2025-12-15',
    time: '10:00 AM - 4:00 PM',
    location: 'Community Center Hall',
    description: 'Prepare and distribute holiday meals to families in need. Cooking and serving experience welcome but not required.',
    category: 'Community',
    totalSpots: 25,
    image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwYmFuayUyMHZvbHVudGVlcnN8ZW58MXx8fHwxNzYxOTM1MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    createdBy: 'lisa.a@greenorganization.org'
  }
];

export const allEvents: AdminEvent[] = [
  {
    id: 'ae1',
    title: 'Beach Cleanup Day',
    organization: 'Ocean Conservation Society',
    date: '2025-11-15',
    time: '9:00 AM - 12:00 PM',
    location: 'Santa Monica Beach, CA',
    description: 'Join us for a morning of beach cleanup! Help protect marine life by removing trash and plastic from our beautiful coastline.',
    category: 'Environment',
    totalSpots: 30,
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGNsZWFudXAlMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkxNDY1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    createdBy: 'manager@gmail.com'
  },
  {
    id: 'ae2',
    title: 'Food Bank Distribution',
    organization: 'Community Food Bank',
    date: '2025-11-08',
    time: '2:00 PM - 6:00 PM',
    location: 'Downtown Community Center',
    description: 'Help sort, pack, and distribute food to families in need. Make a direct impact on fighting hunger in our community.',
    category: 'Community',
    totalSpots: 20,
    image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwYmFuayUyMHZvbHVudGVlcnN8ZW58MXx8fHwxNzYxOTM1MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    createdBy: 'manager@gmail.com'
  },
  {
    id: 'ae3',
    title: 'After School Tutoring',
    organization: 'Youth Education Alliance',
    date: '2025-11-10',
    time: '3:30 PM - 5:30 PM',
    location: 'Lincoln Elementary School',
    description: 'Mentor and tutor elementary students in math and reading. Help build confidence and academic skills in young learners.',
    category: 'Education',
    totalSpots: 15,
    image: 'https://images.unsplash.com/photo-1632932693914-89b90ae3d16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGluZyUyMGNoaWxkcmVuJTIwdm9sdW50ZWVyc3xlbnwxfHx8fDE3NjE5ODU3MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    createdBy: 'lisa.a@greenorganization.org'
  },
  {
    id: 'ae4',
    title: 'Tree Planting Initiative',
    organization: 'Green Future Foundation',
    date: '2025-11-22',
    time: '8:00 AM - 1:00 PM',
    location: 'Riverside Park',
    description: 'Plant native trees to restore local habitats and combat climate change. All tools and training provided.',
    category: 'Environment',
    totalSpots: 50,
    image: 'https://images.unsplash.com/photo-1633975531445-94aa5f8d5a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkzMzYxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    createdBy: 'manager@gmail.com'
  },
  {
    id: 'ae5',
    title: 'Senior Tech Workshop',
    organization: 'ElderCare Community',
    date: '2025-10-28',
    time: '2:00 PM - 5:00 PM',
    location: 'Sunset Senior Center',
    description: 'Completed workshop teaching seniors how to use smartphones and tablets.',
    category: 'Education',
    totalSpots: 15,
    image: 'https://images.unsplash.com/photo-1751666526244-40239a251eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXJzJTIwY29tbXVuaXR5JTIwc2VydmljZXxlbnwxfHx8fDE3NjE4OTQ3NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'completed',
    createdBy: 'lisa.a@greenorganization.org'
  },
  {
    id: 'ae6',
    title: 'Community Garden Day',
    organization: 'Urban Harvest Collective',
    date: '2025-11-25',
    time: '9:00 AM - 2:00 PM',
    location: 'Maple Street Community Garden',
    description: 'Help maintain our community garden! Activities include planting, weeding, and harvesting fresh produce for local families.',
    category: 'Environment',
    totalSpots: 30,
    image: 'https://images.unsplash.com/photo-1633975531445-94aa5f8d5a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MTkzMzYxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    createdBy: 'manager@gmail.com'
  }
];

export const eventVolunteers: EventVolunteer[] = [
  // Beach Cleanup Day volunteers
  {
    id: 'v1',
    eventId: 'm1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    hoursVolunteered: 45,
    eventsAttended: 8,
    status: 'pending',
    appliedDate: '2 days ago',
    contributionConfirmed: false
  },
  {
    id: 'v2',
    eventId: 'm1',
    name: 'Michael Chen',
    email: 'michael.c@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    hoursVolunteered: 62,
    eventsAttended: 12,
    status: 'pending',
    appliedDate: '1 day ago',
    contributionConfirmed: false
  },
  {
    id: 'v3',
    eventId: 'm1',
    name: 'Emma Rodriguez',
    email: 'emma.r@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    hoursVolunteered: 38,
    eventsAttended: 6,
    status: 'confirmed',
    appliedDate: '5 days ago',
    contributionConfirmed: false
  },
  {
    id: 'v4',
    eventId: 'm1',
    name: 'David Kim',
    email: 'david.k@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    hoursVolunteered: 89,
    eventsAttended: 15,
    status: 'confirmed',
    appliedDate: '1 week ago',
    contributionConfirmed: true
  },
  // Community Garden volunteers
  {
    id: 'v5',
    eventId: 'm2',
    name: 'Jessica Martinez',
    email: 'jessica.m@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    hoursVolunteered: 23,
    eventsAttended: 4,
    status: 'pending',
    appliedDate: '3 hours ago',
    contributionConfirmed: false
  },
  {
    id: 'v6',
    eventId: 'm2',
    name: 'Ryan Thomas',
    email: 'ryan.t@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan',
    hoursVolunteered: 71,
    eventsAttended: 11,
    status: 'confirmed',
    appliedDate: '4 days ago',
    contributionConfirmed: false
  },
  // Food Bank volunteers
  {
    id: 'v7',
    eventId: 'm3',
    name: 'Amanda Lee',
    email: 'amanda.l@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
    hoursVolunteered: 54,
    eventsAttended: 9,
    status: 'pending',
    appliedDate: '1 day ago',
    contributionConfirmed: false
  },
  {
    id: 'v8',
    eventId: 'm3',
    name: 'Christopher White',
    email: 'chris.w@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christopher',
    hoursVolunteered: 102,
    eventsAttended: 18,
    status: 'confirmed',
    appliedDate: '3 days ago',
    contributionConfirmed: true
  },
  {
    id: 'v9',
    eventId: 'm3',
    name: 'Nicole Brown',
    email: 'nicole.b@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nicole',
    hoursVolunteered: 34,
    eventsAttended: 5,
    status: 'confirmed',
    appliedDate: '5 days ago',
    contributionConfirmed: false
  },
  // Senior Tech Workshop volunteers (completed event)
  {
    id: 'v10',
    eventId: 'm4',
    name: 'Brandon Scott',
    email: 'brandon.s@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Brandon',
    hoursVolunteered: 67,
    eventsAttended: 10,
    status: 'confirmed',
    appliedDate: '2 weeks ago',
    contributionConfirmed: true
  }
];
