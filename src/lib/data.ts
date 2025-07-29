

import type { User, Post, Notification, Call, Chat } from './types';

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
      unreadCount: 2,
      lastMessageTime: '10:40ص',
      messages: [
        { id: 1, user: 'أحمد محمد', avatar: '👨‍💻', text: 'أهلاً! كيف حالك؟', time: '10:30ص', status: 'seen', type: 'text', likes: 2, isLiked: true },
        { id: 2, user: 'أنت', avatar: '👤', text: 'بخير الحمد لله، ماذا عنك؟', time: '10:32ص', status: 'seen', type: 'text', likes: 0, isLiked: false },
        { id: 3, user: 'أحمد محمد', avatar: '👨‍💻', text: 'بخير أيضاً. هل يمكنك مراجعة هذا الكود؟\n```js\nconsole.log("Hello, World!");\n```', time: '10:35ص', status: 'seen', type: 'text', likes: 0, isLiked: false },
        { id: 4, user: 'أحمد محمد', avatar: '👨‍💻', text: 'وهذه صورة للتصميم الجديد.', time: '10:38ص', type: 'image', src: 'https://placehold.co/400x300', fileInfo: { name: 'design.png', size: 120 * 1024, type: 'image/png' }, status: 'delivered', likes: 1, isLiked: false },
        { id: 5, user: 'أحمد محمد', avatar: '👨‍💻', text: 'انتظر ردك.', time: '10:39ص', status: 'delivered', type: 'text', suggestions: ["بالتأكيد، سألقي نظرة", "يبدو جيداً!", "سأعود إليك قريباً"], likes: 0, isLiked: false },
      ],
    },
    {
      id: 2,
      name: 'سارة أحمد',
      avatar: '👩‍🎨',
      lastMessageTime: 'بالأمس',
      messages: [
        { id: 1, user: 'سارة أحمد', avatar: '👩‍🎨', text: 'شكراً على المساعدة اليوم!', time: '8:15م', status: 'seen', type: 'text', likes: 5, isLiked: true },
        { id: 2, user: 'أنت', avatar: '👤', text: 'العفو! في الخدمة دائماً.', time: '8:17م', status: 'seen', type: 'text', likes: 0, isLiked: false },
      ],
    },
     {
      id: 3,
      name: 'محمد العلي',
      avatar: '👨‍💼',
      lastMessageTime: '12:00م',
      isBlocked: true,
      messages: [
        { id: 1, user: 'محمد العلي', avatar: '👨‍💼', text: 'مرحباً', time: '11:50ص', status: 'seen', type: 'text', likes: 0, isLiked: false },
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
