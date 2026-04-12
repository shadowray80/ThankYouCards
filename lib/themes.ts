export interface Theme {
  id: string;
  name: string;
  emoji: string;
  color: string;
  imgs: string[];
  frontMsg: string; // default short front-of-card message
}

export interface CardMessage {
  name: string;
  msg: string;
  gift?: number;
  hw?: boolean;
  photoData?: string;
  timestamp?: string;
}

export const THEMES: Theme[] = [
  {
    id: "thankyou",
    name: "Thank you",
    emoji: "💛",
    color: "linear-gradient(160deg,#1a4a5a,#2d7d8f)",
    frontMsg: "Thank you so much!",
    imgs: [
      "/default-flowers.jpg",
      "https://images.unsplash.com/photo-1490750967868-88df5691cc89?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1487530811015-780e8e7b7f63?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1455582916367-25f75bfc6710?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "birthday",
    name: "Birthday",
    emoji: "🎂",
    color: "linear-gradient(135deg,#D94E7A,#F9A8D4)",
    frontMsg: "Happy Birthday!",
    imgs: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "cars",
    name: "Cars",
    emoji: "🚗",
    color: "linear-gradient(135deg,#1a1a2e,#e94560)",
    frontMsg: "You're a legend!",
    imgs: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "dad",
    name: "Dad",
    emoji: "👨",
    color: "linear-gradient(135deg,#1B4332,#52B788)",
    frontMsg: "Thanks Dad!",
    imgs: [
      "https://images.unsplash.com/photo-1591035897819-f4bdf739f446?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "grandad",
    name: "Grandad",
    emoji: "👴",
    color: "linear-gradient(135deg,#3A5A40,#A3B18A)",
    frontMsg: "Thanks Grandad!",
    imgs: [
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566004100631-35d015d6a491?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "mum",
    name: "Mum",
    emoji: "👩",
    color: "linear-gradient(135deg,#D94E7A,#FECDD3)",
    frontMsg: "Thanks Mum!",
    imgs: [
      "/default-flowers.jpg",
      "https://images.unsplash.com/photo-1490750967868-88df5691cc89?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1487530811015-780e8e7b7f63?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "grandmother",
    name: "Grandmother",
    emoji: "👵",
    color: "linear-gradient(135deg,#7C5CBF,#E9D5FF)",
    frontMsg: "Thanks Grandma!",
    imgs: [
      "https://images.unsplash.com/photo-1455582916367-25f75bfc6710?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "mates",
    name: "Mates",
    emoji: "🍺",
    color: "linear-gradient(135deg,#C9933A,#F59E0B)",
    frontMsg: "To the best mate!",
    imgs: [
      "/mates-fishing.jpg",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "baby",
    name: "New Baby",
    emoji: "👶",
    color: "linear-gradient(135deg,#93C5FD,#DDD6FE)",
    frontMsg: "Congratulations!",
    imgs: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "wedding",
    name: "Wedding",
    emoji: "💍",
    color: "linear-gradient(135deg,#B45309,#FDE68A)",
    frontMsg: "Congratulations!",
    imgs: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "retirement",
    name: "Retirement",
    emoji: "🌅",
    color: "linear-gradient(135deg,#0369A1,#38BDF8)",
    frontMsg: "Happy Retirement!",
    imgs: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "coach",
    name: "Coach",
    emoji: "🏅",
    color: "linear-gradient(135deg,#003087,#C8102E)",
    frontMsg: "Thank you Coach!",
    imgs: [
      "/hero-coach.jpg",
      "/afl-ball.jpg",
      "/afl-mark.jpg",
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

export const DEMO_MSGS: CardMessage[] = [
  { name: "Sarah (Liam's mum)", msg: "Thanks for believing in Liam this season! He's loved every game. 🏆", gift: 10, hw: false, timestamp: "5 mins ago" },
  { name: "Michael",            msg: "We couldn't have done it without you! ⭐",                              gift: 20, hw: false, timestamp: "2 hours ago" },
  { name: "James & Kate",       msg: "Best coach we've had — you make every training fun. The kids absolutely adore you and talk about practice all week long.", gift: 20, hw: false, timestamp: "3 hours ago" },
  { name: "The Nguyen family",  msg: "We're so grateful for your patience and dedication.",                   gift: 10, hw: false, timestamp: "Yesterday" },
  { name: "Marcus",             msg: "",                                                                      gift: 7,  hw: true,  timestamp: "Yesterday" },
  { name: "Priya (Asha's mum)", msg: "Asha talks about training every single day. Thank you!",               gift: 0,  hw: false, timestamp: "2 days ago" },
  { name: "Tom & Michelle",     msg: "It's been a privilege watching the kids learn from you.",               gift: 20, hw: false, timestamp: "2 days ago" },
  { name: "Lucy (Charlie's mum)", msg: "Charlie scored his first goal this season and you made it happen.",  gift: 0,  hw: false, timestamp: "3 days ago" },
];

export const PENDING: string[] = [
  "The Williams family",
  "Darren & Sue",
  "Unknown viewer",
  "Unknown viewer",
];
