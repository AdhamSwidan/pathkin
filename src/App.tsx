import React, { useState, useMemo, useEffect, useRef } from 'react';
import BottomNav from './components/BottomNav';
import FeedScreen from './components/FeedScreen';
import MapScreen from './components/MapScreen';
import CreateAdventureScreen from './components/CreateAdventureScreen';
import ChatScreen from './components/ChatScreen';
import ProfileScreen from './components/ProfileScreen';
import AdventureDetailModal from './components/AdventureDetailModal';
import ChatDetailScreen from './components/ChatDetailScreen';
import FindTwinsScreen from './components/FindTwinsScreen';
import StoryViewer from './components/StoryViewer';
import SearchScreen from './components/SearchScreen';
import UserProfileScreen from './components/UserProfileScreen';
import Toast from './components/Toast';
import RatingModal from './components/RatingModal';
import FollowListModal from './components/FollowListModal';
import SideNav from './components/SideNav';
import AuthScreen from './components/AuthScreen';
import SettingsScreen from './components/SettingsScreen';
import EditProfileScreen from './components/EditProfileScreen';
import GuestHeader from './components/GuestHeader';
import PrivacySecurityScreen from './components/settings/PrivacySecurityScreen';
import LanguageScreen from './components/settings/LanguageScreen';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import AddStoryModal from './components/AddStoryModal';
import EditAdventureModal from './components/EditAdventureModal';
import SavedAdventuresScreen from './components/settings/SavedAdventuresScreen';
import NotificationsScreen from './components/NotificationsScreen'; // Import the new screen
import { useTranslation } from './contexts/LanguageContext';
import { useJsApiLoader } from '@react-google-maps/api';


// Fix: Imported the 'Media' type to resolve 'Cannot find name 'Media'' errors.
// Fix: Removed unused enums 'AdventureType', 'AdventurePrivacy', and 'ActivityStatus' to resolve TS6133 errors.
import { Screen, Adventure, User, Story, Notification, HydratedAdventure, HydratedStory, NotificationType, HydratedConversation, Conversation, Message, HydratedComment, Comment, HydratedNotification, Media, ActivityStatus } from './types';
import {
  auth, db, storage,
  onAuthStateChanged,
  doc, getDoc, getDocs, signOut,
  collection, onSnapshot, query, orderBy, where,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, setDoc,
  sendPasswordResetEmail,
  ref, uploadBytes, getDownloadURL,
  updateDoc,
  addDoc, serverTimestamp, arrayUnion, arrayRemove, Timestamp,
  runTransaction, deleteDoc,
  GoogleAuthProvider, signInWithPopup, increment,
  writeBatch
} from './services/firebase';


const guestUser: User = {
    id: 'guest',
    name: 'Guest',
    username: 'guest',
    email: '',
    avatarUrl: `https://picsum.photos/seed/guest/200`,
    coverUrl: `https://picsum.photos/seed/guest-cover/800/200`,
    bio: 'A guest exploring Pathkin.',
    interests: [],
    followers: [],
    following: [],
    repostedAdventures: [],
    savedAdventures: [],
    activityLog: [],
    isPrivate: false,
    privacySettings: {
        showFollowLists: true,
        showStats: true,
        showCompletedActivities: true,
        allowTwinSearch: false,
    },
};

const App: React.FC = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>('feed');
  const [screenStack, setScreenStack] = useState<Screen[]>(['feed']);

  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  const [selectedAdventure, setSelectedAdventure] = useState<HydratedAdventure | null>(null);
  const [selectedConversationUser, setSelectedConversationUser] = useState<User | null>(null);
  const [viewingStories, setViewingStories] = useState<HydratedStory[] | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [mapAdventuresToShow, setMapAdventuresToShow] = useState<Adventure[] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ratingModalAdventure, setRatingModalAdventure] = useState<HydratedAdventure | null>(null);
  const [followListModal, setFollowListModal] = useState<{
    isOpen: boolean;
    user: User | null;
    listType: 'followers' | 'following' | null;
  }>({ isOpen: false, user: null, listType: null });
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);
  const [editingAdventure, setEditingAdventure] = useState<HydratedAdventure | null>(null);
  
  const mainContentRef = useRef<HTMLDivElement>(null);
  // Fix: Add a ref to hold the comment listener unsubscribe function.
  const commentListenerUnsub = useRef<(() => void) | null>(null);
  const { t } = useTranslation();

  const libraries = useMemo<("places")[]>(() => ['places'], []);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                setCurrentUser({ id: docSnap.id, ...docSnap.data() } as User);
                 setIsGuest(false);
            } else {
                console.error("User document not found in Firestore for UID:", user.uid);
                await signOut(auth); // Log out if profile is missing
            }
        } else {
            setCurrentUser(null);
        }
        setAuthChecked(true); // Mark auth check as complete
    });
    return () => unsubscribe();
  }, []);
  
  // Global Firestore Listeners (Users, Adventures, Stories)
  useEffect(() => {
    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
        const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(fetchedUsers);
    }, (error) => {
        console.error("Error fetching users:", error);
    });

    const adventuresQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubAdventures = onSnapshot(adventuresQuery, (snapshot) => {
        const fetchedAdventures = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
            } as Adventure
        });
        setAdventures(fetchedAdventures);
    }, (error) => {
        console.error("Error fetching adventures:", error);
    });

    const storiesQuery = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubStories = onSnapshot(storiesQuery, (snapshot) => {
        setStories(snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
            } as Story
        }));
    }, (error) => {
        console.error("Error fetching stories:", error);
    });

    return () => {
        unsubUsers();
        unsubAdventures();
        unsubStories();
    };
  }, []);

  // User-specific Firestore Listeners (Notifications, Conversations)
  useEffect(() => {
    if (!currentUser) {
        setNotifications([]);
        setConversations([]);
        return;
    }

    const notificationsQuery = query(collection(db, "notifications"), where("recipientId", "==", currentUser.id), orderBy("createdAt", "desc"));
    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => {
             const data = doc.data();
             return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
            } as Notification
        }));
    });

    const conversationsQuery = query(collection(db, "conversations"), where("participants", "array-contains", currentUser.id));
    const unsubConversations = onSnapshot(conversationsQuery, (snapshot) => {
        setConversations(snapshot.docs.map(doc => {
             const data = doc.data();
             return {
                ...data,
                id: doc.id,
                updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
                lastMessage: data.lastMessage ? {
                    ...data.lastMessage,
                    createdAt: (data.lastMessage.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString()
                } : undefined,
                unreadCount: data.unreadCount || {}, // Fetch unreadCount
            } as Conversation
        }));
    });

    return () => {
        unsubNotifications();
        unsubConversations();
    };
  }, [currentUser]);


  // Data Hydration
  const hydratedAdventures: HydratedAdventure[] = useMemo(() => {
      return adventures.map(adventure => {
        const author = users.find(u => u.id === adventure.authorId) || guestUser;
        return { ...adventure, author };
      }).filter(Boolean);
  }, [adventures, users]);

  const hydratedStories: HydratedStory[] = useMemo(() => {
    return stories
      .map(story => {
        const author = users.find(u => u.id === story.authorId);
        if (!author) return null;
        return { ...story, author };
      })
      .filter((s): s is HydratedStory => s !== null);
  }, [stories, users]);

  const hydratedConversations: HydratedConversation[] = useMemo(() => {
    if (!currentUser) return [];
    return conversations
        .map(convo => {
            const participantId = convo.participants.find(p => p !== currentUser.id);
            const participant = users.find(u => u.id === participantId);
            if (!participant) return null;
            return { ...convo, participant };
        })
        .filter((c): c is HydratedConversation => c !== null)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [conversations, users, currentUser]);
  
  // Fix: Rewrote hydration logic to avoid complex type predicate errors (TS2322, TS2677).
  const hydratedNotifications: HydratedNotification[] = useMemo(() => {
    const result: HydratedNotification[] = [];
    for (const notif of notifications) {
        const user = users.find(u => u.id === notif.userId);
        if (user) {
            const adventure = hydratedAdventures.find(p => p.id === notif.adventureId);
            result.push({ ...notif, user, adventure });
        }
    }
    return result;
  }, [notifications, users, hydratedAdventures]);

  const hydratedComments: HydratedComment[] = useMemo(() => {
    return comments
        .map(comment => {
            const author = users.find(u => u.id === comment.authorId);
            if (!author) return null; // Or use guest user
            return { ...comment, author };
        })
        .filter((c): c is HydratedComment => c !== null);
  }, [comments, users]);


  const hasUnreadNotifications = useMemo(() => notifications.some(n => !n.read), [notifications]);

  // Screen Navigation
  const pushScreen = (screen: Screen) => {
    setScreenStack(prev => [...prev, screen]);
    setActiveScreen(screen);
    mainContentRef.current?.scrollTo(0, 0);
  };

  // Fix: Modified popScreen to read from 'screenStack', resolving the "never read" error.
  const popScreen = () => {
    if (screenStack.length <= 1) return; // Prevent popping the last screen.
    const newStack = screenStack.slice(0, -1);
    setActiveScreen(newStack[newStack.length - 1]);
    setScreenStack(newStack);
    mainContentRef.current?.scrollTo(0, 0);
  };
  
  const resetToScreen = (screen: Screen) => {
    setScreenStack([screen]);
    setActiveScreen(screen);
    mainContentRef.current?.scrollTo(0, 0);
  };

  const handleGuestAction = () => {
    setToastMessage(t('guestToastMessage'));
  };

  // Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      resetToScreen('feed');
    } catch (error) {
      console.error(error);
      setToastMessage(t('invalidCredentials'));
    }
  };
  
  const handleSignUp = async (name: string, username: string, email: string, pass: string, birthday: string, gender: string, country: string) => {
    try {
        const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
        const usernameSnap = await getDocs(usernameQuery);
        if (!usernameSnap.empty) {
            setToastMessage(t('usernameExistsError'));
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser: Omit<User, 'id'> = {
            name,
            username,
            email,
            avatarUrl: `https://picsum.photos/seed/${userCredential.user.uid}/200`,
            coverUrl: `https://picsum.photos/seed/${userCredential.user.uid}-cover/800/200`,
            bio: `Hello! I'm new to Pathkin, excited to explore.`,
            interests: [],
            birthday,
            gender: gender as User['gender'],
            country,
            followers: [],
            following: [],
            repostedAdventures: [],
            savedAdventures: [],
            activityLog: [],
            isPrivate: false,
            privacySettings: {
                showFollowLists: true,
                showStats: true,
                showCompletedActivities: true,
                allowTwinSearch: true,
            },
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        resetToScreen('feed');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setToastMessage(t('emailExistsError'));
      }
    }
  };
  
  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    const provider = new GoogleAuthProvider(); // Only Google is implemented
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
            // New user, create profile
            const newUser: Omit<User, 'id'> = {
                name: user.displayName || 'New Adventurer',
                username: user.email?.split('@')[0] || `user${Date.now()}`,
                email: user.email || '',
                avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200`,
                coverUrl: `https://picsum.photos/seed/${user.uid}-cover/800/200`,
                bio: 'Joined Pathkin through Google!',
                interests: [],
                followers: [],
                following: [],
                repostedAdventures: [],
                savedAdventures: [],
                activityLog: [],
                isPrivate: false,
                privacySettings: {
                    showFollowLists: true,
                    showStats: true,
                    showCompletedActivities: true,
                    allowTwinSearch: true,
                },
            };
            await setDoc(userDocRef, newUser);
        }
        resetToScreen('feed');
    } catch (error) {
        console.error("Social login error:", error);
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setCurrentUser(guestUser);
    resetToScreen('feed');
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    setIsGuest(false);
    setCurrentUser(null);
    resetToScreen('feed'); // This will redirect to AuthScreen internally
  };
  
  const handleForgotPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Password reset error:", error);
    }
  }

  // User Actions
  const handleUpdateProfile = async (updatedData: Partial<User>, avatarFile?: File, coverFile?: File) => {
    if (!currentUser || isGuest) return;

    const userRef = doc(db, "users", currentUser.id);
    let finalData = { ...updatedData };

    try {
        if (avatarFile) {
            const avatarRef = ref(storage, `avatars/${currentUser.id}`);
            await uploadBytes(avatarRef, avatarFile);
            finalData.avatarUrl = await getDownloadURL(avatarRef);
        }
        if (coverFile) {
            const coverRef = ref(storage, `covers/${currentUser.id}`);
            await uploadBytes(coverRef, coverFile);
            finalData.coverUrl = await getDownloadURL(coverRef);
        }
        
        await updateDoc(userRef, finalData);
        
        // Update local state immediately for better UX
        setCurrentUser(prev => prev ? { ...prev, ...finalData } : null);

        setToastMessage(t('settingsSaved'));
        popScreen();
    } catch (error) {
        console.error("Error updating profile:", error);
    }
  };
  
  const handleFollowToggle = async (userIdToFollow: string) => {
    if (!currentUser || isGuest) { handleGuestAction(); return; }
    
    const currentUserId = currentUser.id;
    const userToFollowRef = doc(db, 'users', userIdToFollow);
    const currentUserRef = doc(db, 'users', currentUserId);
    
    // Fix: Add fallback for following array to prevent crash.
    const isFollowing = (currentUser.following || []).includes(userIdToFollow);
    
    try {
        if (isFollowing) {
            await updateDoc(currentUserRef, { following: arrayRemove(userIdToFollow) });
            await updateDoc(userToFollowRef, { followers: arrayRemove(currentUserId) });
        } else {
            await updateDoc(currentUserRef, { following: arrayUnion(userIdToFollow) });
            await updateDoc(userToFollowRef, { followers: arrayUnion(currentUserId) });
            setToastMessage(t('nowConnected'));
        }
    } catch (error) {
        console.error("Error toggling follow:", error);
    }
  };

  const handleRemoveFollower = async (followerId: string) => {
    if (!currentUser || isGuest) return;
    
    const currentUserId = currentUser.id;
    const followerRef = doc(db, 'users', followerId);
    const currentUserRef = doc(db, 'users', currentUserId);

    try {
        await updateDoc(currentUserRef, { followers: arrayRemove(followerId) });
        await updateDoc(followerRef, { following: arrayRemove(currentUserId) });
        setToastMessage(t('followerRemoved'));
    } catch (error) {
        console.error("Error removing follower:", error);
    }
  };

  // Adventure/Post Actions
  const handleCreateAdventure = async (adventureData: Omit<Adventure, 'id' | 'authorId' | 'interestedUsers' | 'commentCount' | 'createdAt'>, mediaFile: File | null) => {
    if (!currentUser || isGuest) { handleGuestAction(); return; }
    
    let media: Media | undefined;
    if (mediaFile) {
        const mediaRef = ref(storage, `adventures/${currentUser.id}_${Date.now()}`);
        await uploadBytes(mediaRef, mediaFile);
        const url = await getDownloadURL(mediaRef);
        media = { url, type: mediaFile.type.startsWith('video') ? 'video' : 'image' };
    }

    const newAdventure = {
        ...adventureData,
        authorId: currentUser.id,
        interestedUsers: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
        ...(media && { media: [media] }), // Add media array if it exists
    };

    try {
        await addDoc(collection(db, "posts"), newAdventure);
        setToastMessage(t('adventurePublished'));
        resetToScreen('feed');
    } catch (error) {
        console.error("Error creating adventure:", error);
    }
  };
  
  const handleToggleInterest = async (adventureId: string) => {
    if (!currentUser || isGuest) { handleGuestAction(); return; }
    
    const adventure = adventures.find(p => p.id === adventureId);
    if (!adventure) return;
    
    const isInterested = adventure.interestedUsers.includes(currentUser.id);
    const adventureRef = doc(db, 'posts', adventureId);
    
    try {
      if (isInterested) {
        await updateDoc(adventureRef, { interestedUsers: arrayRemove(currentUser.id) });
      } else {
        await updateDoc(adventureRef, { interestedUsers: arrayUnion(currentUser.id) });
        if (adventure.authorId !== currentUser.id) {
          await addDoc(collection(db, 'notifications'), {
            type: NotificationType.Interest,
            recipientId: adventure.authorId,
            userId: currentUser.id,
            adventureId: adventure.id,
            text: t('interestNotificationText', { title: adventure.title }),
            createdAt: serverTimestamp(),
            read: false,
          });
        }
      }
    } catch (error) {
      console.error("Error toggling interest:", error);
    }
  };
  
  const handleToggleRepost = async (adventureId: string) => {
    if (!currentUser || isGuest) { handleGuestAction(); return; }
    const userRef = doc(db, 'users', currentUser.id);
    const currentReposts = currentUser.repostedAdventures || [];
    const isReposted = currentReposts.includes(adventureId);
    const updatedReposts = isReposted
        ? currentReposts.filter(id => id !== adventureId)
        : [...currentReposts, adventureId];

    // Optimistic UI update for instant feedback
    setCurrentUser(prev => prev ? { ...prev, repostedAdventures: updatedReposts } : null);

    try {
        await updateDoc(userRef, { 
            repostedAdventures: isReposted ? arrayRemove(adventureId) : arrayUnion(adventureId) 
        });
    } catch (error) {
        console.error("Error toggling repost:", error);
        // Revert UI on error
        setCurrentUser(prev => prev ? { ...prev, repostedAdventures: currentReposts } : null);
    }
  };

  const handleToggleSave = async (adventureId: string) => {
    if (!currentUser || isGuest) { handleGuestAction(); return; }
    const userRef = doc(db, 'users', currentUser.id);
    const currentSaves = currentUser.savedAdventures || [];
    const isSaved = currentSaves.includes(adventureId);
    const updatedSaves = isSaved
        ? currentSaves.filter(id => id !== adventureId)
        : [...currentSaves, adventureId];
    
    // Optimistic UI update for instant feedback
    setCurrentUser(prev => prev ? { ...prev, savedAdventures: updatedSaves } : null);
    
    try {
        await updateDoc(userRef, { 
            savedAdventures: isSaved ? arrayRemove(adventureId) : arrayUnion(adventureId)
        });
    } catch (error) {
        console.error("Error toggling save:", error);
        // Revert UI on error
        setCurrentUser(prev => prev ? { ...prev, savedAdventures: currentSaves } : null);
    }
  };

  const handleToggleCompleted = async (adventureId: string) => {
    if (!currentUser || isGuest) { handleGuestAction(); return; }
    
    const currentLog = currentUser.activityLog || [];
    const existingEntryIndex = currentLog.findIndex(a => a.adventureId === adventureId);
    let newLog;
    
    if (existingEntryIndex > -1) {
      // Entry exists, remove it (toggle off)
      newLog = currentLog.filter((_, index) => index !== existingEntryIndex);
    } else {
      // Entry doesn't exist, add it as pending (toggle on)
      newLog = [...currentLog, { adventureId, status: ActivityStatus.Pending }];
    }

    // Optimistic UI update
    setCurrentUser(prev => prev ? { ...prev, activityLog: newLog } : null);

    // Update Firestore
    const userRef = doc(db, 'users', currentUser.id);
    try {
      await updateDoc(userRef, { activityLog: newLog });
      if (existingEntryIndex === -1) {
          setToastMessage(t('confirmationRequested'));
      }
    } catch (error) {
      console.error("Error toggling completed status:", error);
      // Revert UI on error
      setCurrentUser(prev => prev ? { ...prev, activityLog: currentLog } : null);
    }
  };
  
  const handleShareAdventure = (adventure: HydratedAdventure) => {
    if (navigator.share) {
      navigator.share({
        title: adventure.title,
        text: t('shareAdventureText', { authorName: adventure.author.name }),
        url: window.location.href,
      }).catch(console.error);
    } else {
      setToastMessage(t('sharingNotSupported'));
    }
  };
  
  const handleShareProfile = (user: User) => {
    if (navigator.share) {
      navigator.share({
        title: user.name,
        text: t('shareProfileText', { name: user.name }),
        url: window.location.href,
      }).catch(console.error);
    } else {
      setToastMessage(t('sharingNotSupported'));
    }
  };
  
  const handleAddComment = async (adventureId: string, text: string) => {
    if (!currentUser || isGuest) { handleGuestAction(); return; }
    const adventure = adventures.find(p => p.id === adventureId);
    if (!adventure) return;
    
    const newComment = {
      authorId: currentUser.id,
      text,
      createdAt: serverTimestamp(),
    };
    
    const commentsColRef = collection(db, 'posts', adventureId, 'comments');
    const adventureRef = doc(db, 'posts', adventureId);
    
    try {
      await addDoc(commentsColRef, newComment);
      await runTransaction(db, async (transaction) => {
        const adventureDoc = await transaction.get(adventureRef);
        if (!adventureDoc.exists()) throw "Document does not exist!";
        const newCount = (adventureDoc.data().commentCount || 0) + 1;
        transaction.update(adventureRef, { commentCount: newCount });
      });
      if (adventure.authorId !== currentUser.id) {
          await addDoc(collection(db, 'notifications'), {
              type: NotificationType.Comment,
              recipientId: adventure.authorId,
              userId: currentUser.id,
              adventureId: adventure.id,
              text: t('commentNotificationText', { title: adventure.title }),
              createdAt: serverTimestamp(),
              read: false,
          });
      }
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };
  
  const handleSendMessage = async (receiverId: string, text: string) => {
    if (!currentUser || isGuest) { handleGuestAction(); return; }

    const convoId = [currentUser.id, receiverId].sort().join('_');
    const convoRef = doc(db, 'conversations', convoId);
    const messagesColRef = collection(db, 'conversations', convoId, 'messages');

    const newMessage: Omit<Message, 'id'> = {
        senderId: currentUser.id,
        text,
        createdAt: new Date().toISOString(), // Temp value, replaced by server
    };
    
    const serverTimestampMessage = { ...newMessage, createdAt: serverTimestamp() };

    try {
        await addDoc(messagesColRef, serverTimestampMessage);

        await setDoc(convoRef, {
            participants: [currentUser.id, receiverId],
            lastMessage: serverTimestampMessage,
            updatedAt: serverTimestamp(),
            [`unreadCount.${receiverId}`]: increment(1)
        }, { merge: true });

    } catch (error) {
        console.error("Error sending message:", error);
    }
  };
  
  const handleCreateStory = async (mediaFile: File) => {
    if (!currentUser || isGuest) { handleGuestAction(); return; }

    try {
        const mediaRef = ref(storage, `stories/${currentUser.id}_${Date.now()}`);
        await uploadBytes(mediaRef, mediaFile);
        const url = await getDownloadURL(mediaRef);
        const media: Media = { url, type: mediaFile.type.startsWith('video') ? 'video' : 'image' };
        
        const newStory = {
            authorId: currentUser.id,
            media,
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "stories"), newStory);
    } catch (error) {
        console.error("Error creating story:", error);
    }
  };
  
  const handleDeleteAdventure = async (adventureId: string) => {
    if (!currentUser || isGuest) return;
    const adventure = adventures.find(p => p.id === adventureId);
    if (!adventure || adventure.authorId !== currentUser.id) return;
    
    try {
      await deleteDoc(doc(db, "posts", adventureId));
      setToastMessage(t('adventureDeletedSuccessfully'));
    } catch (error) {
      console.error("Error deleting adventure:", error);
    }
  };

  const handleUpdateAdventure = async (adventureId: string, updatedData: Partial<Adventure>) => {
    if (!currentUser || isGuest) return;
    const adventure = adventures.find(p => p.id === adventureId);
    if (!adventure || adventure.authorId !== currentUser.id) return;

    try {
        await updateDoc(doc(db, "posts", adventureId), updatedData);
        setToastMessage(t('adventureUpdatedSuccessfully'));
    } catch (error) {
        console.error("Error updating adventure:", error);
    }
  };
  
  const handleMarkAllNotificationsAsRead = async () => {
    if (!currentUser || isGuest) return;
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach(notif => {
        const notifRef = doc(db, "notifications", notif.id);
        batch.update(notifRef, { read: true });
    });
    await batch.commit();
  };

  // UI State Handlers
  const handleSelectAdventure = async (adventure: HydratedAdventure) => {
    setSelectedAdventure(adventure);
    
    // Fix: Implement robust unsubscribe logic for the comment listener.
    const commentsQuery = query(collection(db, 'posts', adventure.id, 'comments'), orderBy('createdAt', 'asc'));
    
    if (commentListenerUnsub.current) {
        commentListenerUnsub.current();
    }

    commentListenerUnsub.current = onSnapshot(commentsQuery, (snapshot) => {
        setComments(snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
            } as Comment;
        }));
    });
  };

  const handleSelectConversationUser = (user: User) => {
    if (!currentUser) return;
    setSelectedConversationUser(user);

    // Reset unread count for the current user in this conversation
    const convoId = [currentUser.id, user.id].sort().join('_');
    const convoRef = doc(db, 'conversations', convoId);
    setDoc(convoRef, {
        [`unreadCount.${currentUser.id}`]: 0
    }, { merge: true });

    pushScreen('chatDetail');
  };
  
  // Fix: Unsubscribe from the comment listener when the modal is closed.
  const handleCloseAdventureDetail = () => {
    setSelectedAdventure(null);
    setComments([]); // Clear comments
    if (commentListenerUnsub.current) {
        commentListenerUnsub.current();
        commentListenerUnsub.current = null;
    }
  };

  const handleViewProfile = (user: User) => {
    if (currentUser?.id === user.id) {
        resetToScreen('profile');
    } else {
        setViewingUser(user);
        pushScreen('userProfile');
    }
  };
  
  const handleShowOnMap = (adventures: HydratedAdventure[]) => {
    if (adventures.some(p => p.coordinates)) {
        setMapAdventuresToShow(adventures);
        resetToScreen('map');
    } else {
        setToastMessage(t('noCoordinatesOnMap'))
    }
  };
  
  const handleViewLocationOnMap = (adventure: HydratedAdventure) => {
     if (adventure.coordinates) {
        setMapAdventuresToShow([adventure]);
        resetToScreen('map');
    } else {
        setToastMessage(t('noCoordinatesOnMap'))
    }
  };


  // Main render logic
  if (!authChecked) {
    return (
        <div className="h-screen w-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );
  }

  const currentUserForProfile = isGuest ? guestUser : currentUser;
  const currentProfileUser = activeScreen === 'profile' ? currentUserForProfile : viewingUser;
  
  const renderScreen = () => {
    switch(activeScreen) {
      case 'feed':
        return <FeedScreen 
                    adventures={hydratedAdventures} 
                    stories={hydratedStories}
                    currentUser={currentUserForProfile!}
                    isGuest={isGuest}
                    onSelectAdventure={handleSelectAdventure} 
                    onSendMessage={handleSelectConversationUser}
                    onToggleInterest={handleToggleInterest}
                    onSelectStories={setViewingStories}
                    onAddStory={() => setIsAddStoryModalOpen(true)}
                    onNavigateToNotifications={() => resetToScreen('notifications')}
                    hasUnreadNotifications={hasUnreadNotifications}
                    onNavigateToChat={() => resetToScreen('chat')}
                    onViewProfile={handleViewProfile}
                    onRepostToggle={handleToggleRepost}
                    onSaveToggle={handleToggleSave}
                    onShareAdventure={handleShareAdventure}
                    onToggleCompleted={handleToggleCompleted}
                    onViewLocationOnMap={handleViewLocationOnMap}
                    onDeleteAdventure={handleDeleteAdventure}
                    onEditAdventure={setEditingAdventure}
                />;
      case 'map':
        return <MapScreen adventuresToShow={mapAdventuresToShow || adventures} isLoaded={isLoaded} />;
      case 'create':
        return <CreateAdventureScreen onCreateAdventure={handleCreateAdventure} currentUser={currentUser!} isLoaded={isLoaded} />;
      case 'search':
        return <SearchScreen 
                    adventures={hydratedAdventures}
                    allUsers={users}
                    currentUser={currentUserForProfile!}
                    isGuest={isGuest}
                    isLoaded={isLoaded}
                    onSelectAdventure={handleSelectAdventure}
                    onSendMessage={handleSelectConversationUser}
                    onToggleInterest={handleToggleInterest}
                    onNavigateToFindTwins={() => pushScreen('findTwins')}
                    onViewProfile={handleViewProfile}
                    onShowResultsOnMap={handleShowOnMap}
                    onRepostToggle={handleToggleRepost}
                    onSaveToggle={handleToggleSave}
                    onShareAdventure={handleShareAdventure}
                    onToggleCompleted={handleToggleCompleted}
                    onViewLocationOnMap={handleViewLocationOnMap}
                    onDeleteAdventure={handleDeleteAdventure}
                    onEditAdventure={setEditingAdventure}
                    onFollowToggle={handleFollowToggle}
                />;
      case 'chat':
        return <ChatScreen conversations={hydratedConversations} onSelectConversation={handleSelectConversationUser} onBack={() => resetToScreen('feed')} currentUser={currentUser!} />;
      case 'notifications':
        return <NotificationsScreen 
                    notifications={hydratedNotifications} 
                    onBack={() => resetToScreen('feed')} 
                    onConfirmAttendance={() => {}} // Placeholder
                    onNotificationClick={(notif) => {
                      if (notif.adventure) {
                        handleSelectAdventure(notif.adventure);
                      }
                    }}
                    onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                />;
      case 'profile':
        if (!currentProfileUser) return null; // Should not happen
        return <ProfileScreen 
                    user={currentProfileUser} 
                    allAdventures={hydratedAdventures}
                    onSelectAdventure={handleSelectAdventure}
                    onSendMessage={handleSelectConversationUser}
                    onToggleInterest={handleToggleInterest}
                    onViewProfile={handleViewProfile}
                    onRepostToggle={handleToggleRepost}
                    onSaveToggle={handleToggleSave}
                    onShareProfile={handleShareProfile}
                    onShareAdventure={handleShareAdventure}
                    onToggleCompleted={handleToggleCompleted}
                    onOpenFollowList={(user, listType) => setFollowListModal({isOpen: true, user, listType})}
                    onNavigateToSettings={() => pushScreen('settings')}
                    onViewLocationOnMap={handleViewLocationOnMap}
                    onDeleteAdventure={handleDeleteAdventure}
                    onEditAdventure={setEditingAdventure}
                />;
      case 'userProfile':
        if (!currentProfileUser) return null;
        return <UserProfileScreen 
                  user={currentProfileUser}
                  currentUser={currentUserForProfile!}
                  allAdventures={hydratedAdventures}
                  onBack={popScreen}
                  onSelectAdventure={handleSelectAdventure}
                  onSendMessage={handleSelectConversationUser}
                  onToggleInterest={handleToggleInterest}
                  onFollowToggle={handleFollowToggle}
                  onViewProfile={handleViewProfile}
                  onRepostToggle={handleToggleRepost}
                  onSaveToggle={handleToggleSave}
                  onShareProfile={handleShareProfile}
                  onShareAdventure={handleShareAdventure}
                  onToggleCompleted={handleToggleCompleted}
                  onOpenFollowList={(user, listType) => setFollowListModal({isOpen: true, user, listType})}
                  isGuest={isGuest}
                  onViewLocationOnMap={handleViewLocationOnMap}
                  onDeleteAdventure={handleDeleteAdventure}
                  onEditAdventure={setEditingAdventure}
                />;
      case 'chatDetail':
        if (!selectedConversationUser) return null;
        return <ChatDetailScreen participant={selectedConversationUser} currentUser={currentUser!} onBack={popScreen} onSendMessage={handleSendMessage} />;
      case 'findTwins':
        return <FindTwinsScreen allUsers={users} currentUser={currentUser!} onSendMessage={handleSelectConversationUser} onBack={popScreen} onFollowToggle={handleFollowToggle} onViewProfile={handleViewProfile}/>;
      case 'settings':
        return <SettingsScreen onBack={popScreen} onNavigate={pushScreen} onLogout={handleLogout} />;
      case 'editProfile':
        return <EditProfileScreen onBack={popScreen} currentUser={currentUser!} onUpdateProfile={handleUpdateProfile} />;
      case 'privacySecurity':
        return <PrivacySecurityScreen onBack={popScreen} currentUser={currentUser!} onUpdateProfile={handleUpdateProfile} />;
      case 'language':
        return <LanguageScreen onBack={popScreen} />;
      case 'savedAdventures': {
        const saved = hydratedAdventures.filter(p => (currentUser?.savedAdventures || []).includes(p.id));
        return <SavedAdventuresScreen 
                    onBack={popScreen} 
                    adventures={saved}
                    currentUser={currentUser!}
                    onSelectAdventure={handleSelectAdventure}
                    onSendMessage={handleSelectConversationUser}
                    onToggleInterest={handleToggleInterest}
                    onViewProfile={handleViewProfile}
                    onRepostToggle={handleToggleRepost}
                    onSaveToggle={handleToggleSave}
                    onShareAdventure={handleShareAdventure}
                    onToggleCompleted={handleToggleCompleted}
                    onViewLocationOnMap={handleViewLocationOnMap}
                    onDeleteAdventure={handleDeleteAdventure}
                    onEditAdventure={setEditingAdventure}
                />;
      }
      default:
        return <div>Not Found</div>;
    }
  }
  
  if (!currentUser && !isGuest) {
    return <AuthScreen 
            onLogin={handleLogin} 
            onSignUp={handleSignUp} 
            onSocialLogin={handleSocialLogin} 
            onGuestLogin={handleGuestLogin}
            onForgotPassword={() => setIsForgotPasswordModalOpen(true)}
        />
  }

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row text-gray-800 dark:text-gray-200 border-x border-gray-200 dark:border-neutral-800">
        <SideNav activeScreen={activeScreen} setActiveScreen={resetToScreen} hasUnreadNotifications={hasUnreadNotifications} isGuest={isGuest} onGuestAction={handleGuestAction} />
        <main ref={mainContentRef} className="flex-1 overflow-y-auto pb-16 xl:pb-0">
            {isGuest && <GuestHeader onLoginClick={handleLogout} />}
            {renderScreen()}
        </main>
        <BottomNav activeScreen={activeScreen} setActiveScreen={resetToScreen} isGuest={isGuest} onGuestAction={handleGuestAction} />
        
        {/* Modals and Overlays */}
        {selectedAdventure && <AdventureDetailModal adventure={selectedAdventure} comments={hydratedComments} currentUser={currentUser} onClose={handleCloseAdventureDetail} onAddComment={handleAddComment} />}
        {viewingStories && <StoryViewer stories={viewingStories} onClose={() => setViewingStories(null)} />}
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        {ratingModalAdventure && <RatingModal adventure={ratingModalAdventure} onClose={() => setRatingModalAdventure(null)} onSubmit={() => {}} />}
        {followListModal.isOpen && followListModal.user && (
          <FollowListModal 
              title={t(followListModal.listType!)}
              listOwner={followListModal.user}
              currentUser={currentUser}
              // Fix: Add fallback for user arrays to prevent crash.
              users={users.filter(u => (followListModal.listType === 'followers' ? (followListModal.user?.followers || []) : (followListModal.user?.following || [])).includes(u.id))}
              listType={followListModal.listType!}
              onClose={() => setFollowListModal({isOpen: false, user: null, listType: null})}
              onViewProfile={(user) => {
                  setFollowListModal({isOpen: false, user: null, listType: null});
                  handleViewProfile(user);
              }}
              onFollowToggle={handleFollowToggle}
              onRemoveFollower={handleRemoveFollower}
          />
        )}
        <ForgotPasswordModal 
          isOpen={isForgotPasswordModalOpen}
          onClose={() => setIsForgotPasswordModalOpen(false)}
          onSubmit={(email) => {
              handleForgotPassword(email);
          }}
        />
        <AddStoryModal 
          isOpen={isAddStoryModalOpen}
          onClose={() => setIsAddStoryModalOpen(false)}
          onStoryCreate={handleCreateStory}
        />
        {editingAdventure && (
            <EditAdventureModal 
              adventure={editingAdventure}
              onClose={() => setEditingAdventure(null)}
              onUpdateAdventure={handleUpdateAdventure}
              isLoaded={isLoaded}
            />
        )}
      </div>
    </div>
  );
};

export default App;
