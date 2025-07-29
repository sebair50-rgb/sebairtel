
import type { User, Post, Notification } from './types';

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
