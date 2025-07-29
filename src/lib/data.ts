
import type { User, Post, Notification, Call, Chat, Message } from './types';

export const CURRENT_USER: User = { id: 100, name: 'أنت', avatar: '👤' };

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

export const initialChats: Chat[] = [
  {
    id: 1,
    name: 'أحمد محمد',
    avatar: '👨‍💻',
    lastMessageTime: '11:30 ص',
    unreadCount: 2,
    messages: [
      { id: 1, user: 'أحمد محمد', avatar: '👨‍💻', text: 'أهلاً! كيف حالك؟', time: '11:28 ص', status: 'seen', type: 'text' },
      { id: 2, user: 'أنت', avatar: '👤', text: 'بخير، شكراً لك! ماذا عنك؟', time: '11:29 ص', status: 'seen', type: 'text' },
      { id: 3, user: 'أحمد محمد', avatar: '👨‍💻', text: 'أنا بخير أيضاً. هل رأيت التحديث الجديد في التطبيق؟', time: '11:30 ص', status: 'seen', type: 'text' },
      { id: 4, user: 'أحمد محمد', avatar: '👨‍💻', text: 'أعتقد أنه رائع!', time: '11:30 ص', status: 'delivered', type: 'text', suggestions: ['نعم، رائع!', 'لم أره بعد', 'ما هو؟'] },
      { id: 5, user: 'أنت', avatar: '👤', type: 'image', src: 'https://placehold.co/400x300.png', fileInfo: {name: 'screenshot.png', size: 120400, type:'image/png'}, text: 'نعم، هذا الجزء مذهل!', time: '11:32 ص', status: 'sent', likes: 1, isLiked: true },
      { id: 6, user: 'أحمد محمد', avatar: '👨‍💻', type: 'text', text: 'بالفعل! انظر لهذا الكود:', time: '11:35 ص', status: 'delivered' },
      { id: 7, user: 'أحمد محمد', avatar: '👨‍💻', type: 'code', text: "```javascript\nconsole.log('Hello, World!');\n```", time: '11:35 ص', status: 'delivered' },
      { id: 8, user: 'أنت', avatar: '👤', text: 'شكراً لمشاركته!', time: '11:36 ص', status: 'sent', replyTo: 7 },
    ],
  },
  {
    id: 2,
    name: 'سارة أحمد',
    avatar: '👩‍🎨',
    lastMessageTime: '10:45 ص',
    messages: [
      { id: 1, user: 'سارة أحمد', avatar: '👩‍🎨', text: 'صباح الخير، هل أنت متفرغ اليوم؟', time: '10:45 ص', status: 'delivered', type: 'text' }
    ]
  },
  {
    id: 3,
    name: 'محمد العلي',
    avatar: '👨‍💼',
    lastMessageTime: 'أمس',
    unreadCount: 5,
    messages: [
      { id: 1, user: 'محمد العلي', avatar: '👨‍💼', text: 'لدينا اجتماع غداً لمناقشة المشروع.', time: 'أمس', status: 'delivered', type: 'text' },
    ],
    isMuted: true,
  },
   {
    id: 4,
    name: 'علياء',
    avatar: '🧕',
    lastMessageTime: 'أمس',
    isBlocked: true,
    messages: [
      { id: 1, user: 'علياء', avatar: '🧕', text: 'مرحباً', time: 'أمس', status: 'delivered', type: 'text' },
    ],
  },
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
    { id: 1, user: 'سارة أحمد', avatar: '👩‍🎨', type: 'missed', time: '10:30 صباحًا' },
    { id: 2, user: 'أحمد محمد', avatar: '👨‍💻', type: 'outgoing', time: '9:15 صباحًا', duration: '5:23' },
    { id: 3, user: 'محمد العلي', avatar: '👨‍💼', type: 'incoming', time: 'بالأمس', duration: '12:45' },
    { id: 4, user: 'فاطمة سالم', avatar: '👩‍🔬', type: 'missed', time: 'بالأمس' },
];
