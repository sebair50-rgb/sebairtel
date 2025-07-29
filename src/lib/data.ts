import type { Chat, User, Post, Notification, Call } from './types';

export const CURRENT_USER: User = { id: 100, name: 'أنت', avatar: '👤' };

export const initialChats: Chat[] = [
  {
    id: 1,
    name: 'أحمد محمد',
    avatar: '👨‍💻',
    unreadCount: 0,
    lastMessageTime: '10:50',
    messages: [
      { id: 1, user: 'أحمد محمد', type: 'text', text: 'مرحباً! كيف حالك اليوم؟', time: '10:30', avatar: '👨‍💻', status: 'seen' },
      { id: 4, user: 'أحمد محمد', type: 'text', text: 'هذا رائع. هل يمكنك مراجعة هذا الكود؟\n```js\nfunction greet(name) {\n  return `Hello, ${name}! Welcome to interactive chat.`;\n}\nconsole.log(greet("Developer"));\n```', time: '10:50', avatar: '👨‍💻', status: 'seen' },
    ],
  },
  {
    id: 2,
    name: 'سارة أحمد',
    avatar: '👩‍🎨',
    unreadCount: 1,
    lastMessageTime: '10:46',
    messages: [
      { id: 2, user: 'سارة أحمد', type: 'text', text: 'أعمل على مشروع جديد، هل يمكنك مساعدتي؟ https://example.com', time: '10:45', avatar: '👩‍🎨', status: 'seen', suggestions: ['بالتأكيد!', 'متى نبدأ؟', 'أنا مشغول الآن'] },
      { id: 3, user: 'أنت', type: 'text', text: 'أهلاً سارة، بالطبع يمكنني المساعدة.', time: '10:46', avatar: '👤', status: 'seen', replyTo: 2 },
    ],
  },
  {
    id: 3,
    name: 'فريق العمل',
    avatar: '💼',
    unreadCount: 5,
    lastMessageTime: 'أمس',
    messages: [
      { id: 5, user: 'محمد العلي', type: 'text', text: 'يا جماعة، لا تنسوا اجتماع الغد الساعة 10 صباحًا.', time: 'أمس', avatar: '👨‍💼', status: 'seen' },
    ],
  },
  {
    id: 4,
    name: 'مجموعة الأصدقاء',
    avatar: '🎉',
    unreadCount: 0,
    lastMessageTime: '11:15',
    messages: [
       { id: 6, user: 'علياء', type: 'image', src: 'https://placehold.co/600x400/a3e635/172554', fileInfo: {name: 'fun-time.jpg', type: 'image/jpeg'}, text: 'انظروا إلى هذه الصورة المضحكة!', time: '11:15', avatar: '🧕', status: 'seen' },
    ]
  }
];

export const initialUsers: User[] = [
    { id: 1, name: 'أحمد محمد', avatar: '👨‍💻', isFriend: true },
    { id: 2, name: 'سارة أحمد', avatar: '👩‍🎨', isFriend: true },
    { id: 3, name: 'محمد العلي', avatar: '👨‍💼', isFriend: true },
    { id: 4, name: 'فاطمة سالم', avatar: '👩‍🔬', isFriend: false, requestSent: false },
    { id: 5, name: 'علياء', avatar: '🧕', isFriend: false, requestSent: true },
    { id: 6, name: 'خالد', avatar: '🧑‍🚀', isFriend: false, requestSent: false },
    { id: 7, name: 'يوسف', avatar: '🧑‍🔧', isFriend: false, requestSent: false },
];

export const initialFriendRequests: User[] = [
    { id: 8, name: 'نورة', avatar: '👩‍🏫' }
];

export const initialPosts: Post[] = [
    { 
      id: 1, 
      user: 'محمد العلي', 
      avatar: '👨‍💼',
      content: 'تم إطلاق ميزة جديدة في SebairTel! استمتعوا بالترجمة الفورية والذكاء الاصطناعي المتطور 🚀',
      media: null,
      time: 'منذ ساعتين',
      likes: 24,
      isLiked: false,
      isSaved: false,
      comments: [
        {user: 'علياء', text: 'عمل رائع!'},
        {user: 'خالد', text: 'متحمس لتجربتها'}
      ]
    },
    {
      id: 2,
      user: 'فاطمة سالم',
      avatar: '👩‍🔬',
      content: 'شكراً لكم على SebairTel! أصبح التواصل والعمل أسهل بكثير مع الميزات الذكية 💙',
      media: {type: 'image', src: 'https://placehold.co/600x400'},
      time: 'منذ 4 ساعات',
      likes: 42,
      isLiked: true,
      isSaved: true,
      comments: []
    }
];

export const initialNotifications: Notification[] = [
    {id: 1, type: 'like', user: 'فاطمة سالم', message: 'أعجبها منشورك.', time: 'منذ 5 دقائق', isRead: false},
    {id: 2, type: 'comment', user: 'علياء', message: 'علقت على منشورك: "عمل رائع!"', time: 'منذ 15 دقيقة', isRead: false},
    {id: 3, type: 'request', user: 'خالد', message: 'أرسل لك طلب صداقة.', time: 'منذ ساعة', isRead: true},
];

export const initialCalls: Call[] = [
    { id: 1, user: 'أحمد محمد', avatar: '👨‍💻', type: 'outgoing', time: 'اليوم، 11:30 صباحًا', duration: '5:21' },
    { id: 2, user: 'سارة أحمد', avatar: '👩‍🎨', type: 'missed', time: 'اليوم، 9:15 صباحًا', duration: '' },
    { id: 3, user: 'فريق العمل', avatar: '💼', type: 'incoming', time: 'أمس، 4:00 مساءً', duration: '30:45' },
    { id: 4, user: 'خالد', avatar: '🧑‍🚀', type: 'outgoing', time: 'أمس، 10:00 صباحًا', duration: '12:03' },
];
