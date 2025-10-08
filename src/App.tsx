
import React, { useState, useMemo, useEffect, useRef } from 'react';
import BottomNav from './components/BottomNav';
import AdventuresScreen from './components/AdventuresScreen';
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
import EditAdventureScreen from './components/EditAdventureScreen';
import SavedAdventuresScreen from './components/settings/SavedAdventuresScreen';
import NotificationsScreen from './components/NotificationsScreen';
import JoinGroupChatConfirmationModal from './components/JoinGroupChatConfirmationModal';
import CompletedAdventuresByTypeScreen from './components/CompletedAdventuresByTypeScreen';
import GroupChatSettingsScreen from './components/GroupChatSettingsScreen';
import { useTranslation } from './contexts/LanguageContext';
import { useJsApiLoader } from '@react-google-maps/api';
// Fix: Import `ActivityLogEntry` to resolve type error in `handleConfirmAttendance`.
import { Screen, Adventure, User, Story, Notification, HydratedAdventure, HydratedStory, HydratedConversation, Conversation, HydratedComment, Comment, HydratedNotification, Media, ActivityStatus, ActivityLogEntry, AdventureType, ProfileTab, Message, AdventurePrivacy } from './types';
import {
  auth, db, storage,
  // Fix: Corrected import to use `FirebaseUser` directly, as exported from the firebase service.
  onAuthStateChanged, FirebaseUser,
  doc, getDoc, getDocs, signOut,
  collection, onSnapshot, query, orderBy, where,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, setDoc,
  sendPasswordResetEmail,
  ref, uploadBytes, getDownloadURL,
  updateDoc,
  addDoc, serverTimestamp, arrayUnion, arrayRemove,
  runTransaction, deleteDoc,
  GoogleAuthProvider, signInWithPopup, increment,
  writeBatch,
  deleteObject
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

/**
 * Safely converts a Firestore Timestamp or an ISO string to an ISO string.
 * This prevents crashes if a timestamp field is already a string.
 * @param timestamp The value to convert.
 * @returns An ISO date string.
 */
const safeTimestampToString = (timestamp: any): string => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        // It's a Firestore Timestamp, convert it
        return timestamp.toDate().toISOString();
    }
    if (typeof timestamp === 'string') {
        // It's already an ISO string
        return timestamp;
    }
    // Fallback for unexpected types or null/undefined
    return new Date().toISOString();
};


const App: React.FC = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>('adventures');
  const [screenStack, setScreenStack] = useState<Screen[]>(['adventures']);

  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  const [selectedAdventure, setSelectedAdventure] = useState<HydratedAdventure | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<HydratedConversation | null>(null);
  const [viewingStories, setViewingStories] = useState<HydratedStory[] | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [mapAdventuresToShow, setMapAdventuresToShow] = useState<Adventure[] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ratingModalAdventure, setRatingModalAdventure] = useState<HydratedAdventure | null>(null);
  const [adventureToJoinChat, setAdventureToJoinChat] = useState<HydratedAdventure | null>(null);
  const [viewingCompleted, setViewingCompleted] = useState<{ user: User, type: AdventureType } | null>(null);
  const [viewingGroupSettings, setViewingGroupSettings] = useState<HydratedConversation | null>(null);
  const [followListModal, setFollowListModal] = useState<{
    isOpen: boolean;
    user: User | null;
    listType: 'followers' | 'following' | null;
  }>({ isOpen: false, user: null, listType: null });
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);
  const [editingAdventure, setEditingAdventure] = useState<HydratedAdventure | null>(null);
  const [viewedStoryTimestamps, setViewedStoryTimestamps] = useState<Record<string, string>>(() => 
    JSON.parse(localStorage.getItem('viewedStoryTimestamps') || '{}')
  );
  
  // State for profile tabs, lifted up to App component
  const [profileTab, setProfileTab] = useState<ProfileTab>('adventures');
  const [userProfileTab, setUserProfileTab] = useState<ProfileTab>('adventures');


  const mainContentRef = useRef<HTMLDivElement>(null);
  const commentListenerUnsub = useRef<(() => void) | null>(null);
  const { t } = useTranslation();

  const libraries = useMemo<any>(() => ['places'], []);
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });
  
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps script loading error:", loadError);
      setToastMessage(t('mapLoadError'));
    }
  }, [loadError, t]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
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
            setIsGuest(false);
        }
        setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);
  
  // Global Firestore Listeners (Users, Adventures, Stories)
  useEffect(() => {
    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
        const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(fetchedUsers);
    }, (error) => console.error("Error fetching users:", error));

    const adventuresQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubAdventures = onSnapshot(adventuresQuery, (snapshot) => {
        const fetchedAdventures = snapshot.docs.map(doc => {
            const data = doc.data();
            return { ...data, id: doc.id, createdAt: safeTimestampToString(data.createdAt) } as Adventure
        });
        setAdventures(fetchedAdventures);
    }, (error) => console.error("Error fetching adventures:", error));

    const storiesQuery = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubStories = onSnapshot(storiesQuery, (snapshot) => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const freshStories = snapshot.docs.map(doc => {
            const data = doc.data();
            return { ...data, id: doc.id, createdAt: safeTimestampToString(data.createdAt) } as Story
        }).filter(story => new Date(story.createdAt) > twentyFourHoursAgo);
        setStories(freshStories);
    }, (error) => console.error("Error fetching stories:", error));

    return () => { unsubUsers(); unsubAdventures(); unsubStories(); };
  }, []);

  // User-specific Firestore Listeners (User Doc, Notifications, Conversations)
  useEffect(() => {
    if (!currentUser?.id) { 
      setNotifications([]); 
      setConversations([]); 
      return; 
    }

    // Real-time listener for the current user's document.
    // This is crucial for reflecting updates made by other users (e.g., attendance confirmation)
    // without requiring a page refresh.
    const userDocRef = doc(db, 'users', currentUser.id);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentUser({ id: docSnap.id, ...docSnap.data() } as User);
      }
    });

    const notificationsQuery = query(collection(db, "notifications"), where("recipientId", "==", currentUser.id), orderBy("createdAt", "desc"));
    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => {
             const data = doc.data();
             return { ...data, id: doc.id, createdAt: safeTimestampToString(data.createdAt) } as Notification
        }));
    });

    const conversationsQuery = query(collection(db, "conversations"), where("participants", "array-contains", currentUser.id), orderBy("updatedAt", "desc"));
    const unsubConversations = onSnapshot(conversationsQuery, (snapshot) => {
        setConversations(snapshot.docs.map(doc => {
             const data = doc.data();
             return { 
                 ...data, 
                 id: doc.id, 
                 updatedAt: safeTimestampToString(data.updatedAt), 
                 lastMessage: data.lastMessage ? { 
                     ...data.lastMessage, 
                     createdAt: safeTimestampToString(data.lastMessage.createdAt) 
                 } : undefined, 
                 unreadCount: data.unreadCount || {}, 
             } as Conversation
        }));
    });

    return () => { 
      unsubUser();
      unsubNotifications(); 
      unsubConversations(); 
    };
    // Dependency is changed to currentUser.id to prevent infinite loops.
  }, [currentUser?.id]);

  // Comments listener
  useEffect(() => {
    if (commentListenerUnsub.current) { commentListenerUnsub.current(); }
    if (!selectedAdventure) { setComments([]); return; }

    const commentsQuery = query(collection(db, "posts", selectedAdventure.id, "comments"), orderBy("createdAt", "asc"));
    commentListenerUnsub.current = onSnapshot(commentsQuery, (snapshot) => {
        setComments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, createdAt: safeTimestampToString(doc.data().createdAt) } as Comment)));
    });
    return () => { if (commentListenerUnsub.current) { commentListenerUnsub.current(); } };
  }, [selectedAdventure]);

  // Auto-complete authored adventures
  useEffect(() => {
    const checkAndCompleteAuthoredAdventures = async () => {
        if (!currentUser || !adventures.length) return;

        const now = new Date();
        const loggedAdventureIds = new Set((currentUser.activityLog || []).map(entry => entry.adventureId));

        const adventuresToComplete = adventures.filter(adv => {
            if (adv.authorId !== currentUser.id) return false;
            if (loggedAdventureIds.has(adv.id)) return false;

            const adventureEndDate = adv.endDate ? new Date(adv.endDate) : new Date(adv.startDate);
            // Add one day to the end date to ensure the day is fully over before marking as complete
            adventureEndDate.setDate(adventureEndDate.getDate() + 1); 
            return now > adventureEndDate;
        });

        if (adventuresToComplete.length > 0) {
            try {
                const userRef = doc(db, 'users', currentUser.id);
                const newLogEntries = adventuresToComplete.map(adv => ({
                    adventureId: adv.id,
                    status: ActivityStatus.Confirmed
                }));
                
                // Use arrayUnion with spread to add multiple items idempotently
                await updateDoc(userRef, {
                    activityLog: arrayUnion(...newLogEntries)
                });
            } catch (error) {
                console.error("Error auto-completing adventures:", error);
            }
        }
    };

    checkAndCompleteAuthoredAdventures();
  }, [currentUser, adventures]);


  // Data Hydration
  const hydratedAdventures: HydratedAdventure[] = useMemo(() => adventures.map(adventure => ({ ...adventure, author: users.find(u => u.id === adventure.authorId) || guestUser })).filter((a): a is HydratedAdventure => !!a.author), [adventures, users]);
  
  const hydratedMapAdventures = useMemo(() => {
    const adventuresToHydrate = mapAdventuresToShow || adventures;
    return adventuresToHydrate.map(adventure => ({ ...adventure, author: users.find(u => u.id === adventure.authorId) || guestUser })).filter((a): a is HydratedAdventure => !!a.author);
  }, [mapAdventuresToShow, adventures, users]);

  const hydratedStories: HydratedStory[] = useMemo(() => {
    const allHydrated = stories
        .map(story => ({ ...story, author: users.find(u => u.id === story.authorId) }))
        .filter((s): s is HydratedStory => !!s.author);

    // Guests can only see public stories
    if (!currentUser || isGuest) {
        return allHydrated.filter(s => !s.privacy || s.privacy === AdventurePrivacy.Public);
    }
    
    return allHydrated.filter(story => {
        // Always show your own stories
        if (story.authorId === currentUser.id) {
            return true;
        }
        
        const privacy = story.privacy || AdventurePrivacy.Public; // Default old stories to public
        
        switch (privacy) {
            case AdventurePrivacy.Public:
                return true;
            case AdventurePrivacy.Followers:
                // Check if the current user is following the story author
                return (currentUser.following || []).includes(story.authorId);
            case AdventurePrivacy.Twins:
                // Check for birthday twin status
                const isTwin = currentUser.birthday && story.author.birthday && currentUser.birthday.substring(5) === story.author.birthday.substring(5);
                return isTwin;
            default:
                return false;
        }
    });
  }, [stories, users, currentUser, isGuest]);
  
  const hydratedConversations: HydratedConversation[] = useMemo(() => {
    if (!currentUser) return [];

    const mapped = conversations.map((convo): HydratedConversation | null => {
        // Determine the conversation type, using adventureId as a fallback for legacy data.
        const type = convo.type || (convo.adventureId ? 'group' : 'private');

        if (type === 'group') {
            // All data needed for group chats (name, imageUrl) is already in the convo object.
            return { ...convo, type: 'group' };
        }
        
        if (type === 'private') {
            const participantId = convo.participants.find(p => p !== currentUser.id);
            if (!participantId) return null; 

            const participant = users.find(u => u.id === participantId);
            // If the other user's data isn't loaded, we'll temporarily hide the conversation.
            // It will reappear when the `users` state updates.
            if (!participant) return null;

            return { ...convo, type: 'private', participant };
        }

        // Should not be reached if types are only 'group' and 'private'
        return null;
    });

    const filtered = mapped.filter((c): c is HydratedConversation => c !== null);

    return filtered; // Data is already sorted by Firestore

  }, [conversations, users, currentUser]);


  const hydratedNotifications: HydratedNotification[] = useMemo(() => notifications.map(notif => {
    const user = users.find(u => u.id === notif.userId);
    const adventure = hydratedAdventures.find(p => p.id === notif.adventureId);
    return { ...notif, user, adventure };
  }).filter(n => n.user) as HydratedNotification[], [notifications, users, hydratedAdventures]);
  const hydratedComments: HydratedComment[] = useMemo(() => comments.map(comment => ({ ...comment, author: users.find(u => u.id === comment.authorId)! })).filter(c => c.author), [comments, users]);

  const hasUnreadNotifications = useMemo(() => notifications.some(n => !n.read), [notifications]);

  // Navigation
  const pushScreen = (screen: Screen) => {
    if (activeScreen === screen) {
        mainContentRef.current?.scrollTo(0, 0);
    } else {
        setScreenStack(prev => [...prev, screen]);
        setActiveScreen(screen);
        mainContentRef.current?.scrollTo(0, 0);
    }
  };
  const popScreen = () => {
    if (screenStack.length <= 1) return;
    const newStack = screenStack.slice(0, -1);
    setActiveScreen(newStack[newStack.length - 1]);
    setScreenStack(newStack);
    mainContentRef.current?.scrollTo(0, 0);
  };
  const resetToScreen = (screen: Screen) => {
    // When navigating to a profile screen, reset its tab to the default
    if (screen === 'profile') setProfileTab('adventures');
    if (screen === 'userProfile') setUserProfileTab('adventures');

    if (activeScreen === screen) {
        mainContentRef.current?.scrollTo(0, 0);
    } else {
        setScreenStack([screen]);
        setActiveScreen(screen);
        mainContentRef.current?.scrollTo(0, 0);
    }
  };
  
  // Handlers
  const handleShowToast = (message: string) => { setToastMessage(message); };
  const handleGuestAction = () => { handleShowToast(t('guestToastMessage')); };

  // --- Auth Handlers ---
  const handleLogin = async (email: string, pass: string) => {
    try { await signInWithEmailAndPassword(auth, email, pass); resetToScreen('adventures'); } 
    catch (error) { console.error(error); handleShowToast(t('invalidCredentials')); }
  };
  const handleSignUp = async (name: string, username: string, email: string, pass: string, birthday: string, gender: string, country: string) => {
    try {
        const usernameQuery = query(collection(db, "users"), where("username", "==", username));
        const usernameSnap = await getDocs(usernameQuery);
        if (!usernameSnap.empty) { handleShowToast(t('usernameExistsError')); return; }

        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        // Fix: Cast `gender` to the correct type to resolve the TypeScript error.
        const newUser: User = { id: userCredential.user.uid, name, username, email, followers: [], following: [], repostedAdventures: [], savedAdventures: [], activityLog: [], bio: '', interests: [], avatarUrl: `https://picsum.photos/seed/${userCredential.user.uid}/200`, coverUrl: `https://picsum.photos/seed/${userCredential.user.uid}-cover/800/200`, birthday, gender: gender as User['gender'], country, isPrivate: false, privacySettings: { showFollowLists: true, showStats: true, showCompletedActivities: true, allowTwinSearch: true } };
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        resetToScreen('adventures');
    } catch (error: any) { console.error(error); if (error.code === 'auth/email-already-in-use') { handleShowToast(t('emailExistsError')); } }
  };
  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    if (providerName === 'google') {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            const newUser: User = { id: user.uid, name: user.displayName || 'New User', username: user.email?.split('@')[0] || `user${Date.now()}`, email: user.email || '', followers: [], following: [], repostedAdventures: [], savedAdventures: [], activityLog: [], bio: '', interests: [], avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200`, isPrivate: false, privacySettings: { showFollowLists: true, showStats: true, showCompletedActivities: true, allowTwinSearch: true } };
            await setDoc(userDocRef, newUser);
          }
          resetToScreen('adventures');
        } catch (error: any) { 
            console.error("Social login error:", error); 
            if (error.code === 'auth/popup-closed-by-user') {
                // This can happen if the user closes the popup, or if there's a configuration error
                // like redirect_uri_mismatch. We can't detect the exact cause here, but we can
                // provide a generic helpful message.
                handleShowToast("Login cancelled or failed. Please check your connection and try again.");
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                handleShowToast("An account with this email already exists using a different sign-in method.");
            } else {
                handleShowToast("An error occurred during Google sign-in.");
            }
        }
    }
  };
  const handleGuestLogin = () => { setIsGuest(true); resetToScreen('adventures'); };
  const handleLogout = async () => { await signOut(auth); resetToScreen('adventures'); };
  const handleForgotPassword = async (email: string) => { try { await sendPasswordResetEmail(auth, email); } catch (error) { console.error(error); } };

  // --- Adventure Handlers ---
  const handleCreateAdventure = async (adventureData: Omit<Adventure, 'id' | 'authorId' | 'interestedUsers' | 'commentCount' | 'createdAt'>, mediaFile: File | null) => {
    if (!currentUser) return;
    try {
        let media: Media | undefined = undefined;
        if (mediaFile) {
            const mediaRef = ref(storage, `posts/${currentUser.id}_${Date.now()}`);
            await uploadBytes(mediaRef, mediaFile);
            const url = await getDownloadURL(mediaRef);
            media = { url, type: mediaFile.type.startsWith('video') ? 'video' : 'image' };
        }
        const newAdventureDoc = await addDoc(collection(db, 'posts'), { ...adventureData, authorId: currentUser.id, interestedUsers: [], commentCount: 0, createdAt: serverTimestamp(), ...(media && { media: [media] }) });
        
        // Create a group conversation for the new adventure
        await addDoc(collection(db, 'conversations'), {
          type: 'group',
          adventureId: newAdventureDoc.id,
          name: adventureData.title,
          imageUrl: media?.url || `https://picsum.photos/seed/${newAdventureDoc.id}/200`,
          participants: [currentUser.id],
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });

        handleShowToast(t('adventurePublished'));
        resetToScreen('adventures');
    } catch (error) { console.error("Error creating adventure:", error); }
  };
   const handleUpdateAdventure = async (adventureId: string, updatedData: Partial<Adventure>) => {
    try {
        const adventureRef = doc(db, 'posts', adventureId);
        await updateDoc(adventureRef, updatedData);
        handleShowToast(t('adventureUpdatedSuccessfully'));
        popScreen();
    } catch (error) { console.error("Error updating adventure:", error); }
  };
  const handleDeleteAdventure = async (adventureId: string) => {
    try {
      // Find adventure to get media URL for deletion
      const adventureToDelete = adventures.find(p => p.id === adventureId);
      if(adventureToDelete?.media?.[0]?.url) {
        const mediaRef = ref(storage, adventureToDelete.media[0].url);
        await deleteObject(mediaRef).catch(e => console.error("Could not delete storage object:", e));
      }
      await deleteDoc(doc(db, 'posts', adventureId));
      handleShowToast(t('adventureDeletedSuccessfully'));
    } catch(e) { console.error("Error deleting adventure:", e); }
  };
  const handleStartEditAdventure = (adventure: HydratedAdventure) => {
    setEditingAdventure(adventure);
    pushScreen('editAdventure');
  };
  const handleToggleInterest = async (adventureId: string) => {
    if (!currentUser) return;
    const adventureRef = doc(db, 'posts', adventureId);
    const adventure = adventures.find(p => p.id === adventureId);
    if (!adventure) return;
    const isInterested = (adventure.interestedUsers || []).includes(currentUser.id);
    await updateDoc(adventureRef, { interestedUsers: isInterested ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id) });
    if (!isInterested && adventure.authorId !== currentUser.id) {
        await addDoc(collection(db, 'notifications'), { recipientId: adventure.authorId, userId: currentUser.id, adventureId, text: t('interestNotificationText', { title: adventure.title }), type: 'interest', read: false, createdAt: serverTimestamp() });
    }
  };
  const handleToggleRepost = async (adventureId: string) => {
    if (!currentUser) return;

    const originalReposts = currentUser.repostedAdventures || [];
    const isReposted = originalReposts.includes(adventureId);

    // Optimistic UI update
    const newReposts = isReposted
      ? originalReposts.filter(id => id !== adventureId)
      : [...originalReposts, adventureId];
    
    setCurrentUser(prevUser => prevUser ? { ...prevUser, repostedAdventures: newReposts } : null);

    // Firebase update
    const userRef = doc(db, 'users', currentUser.id);
    try {
      await updateDoc(userRef, { repostedAdventures: isReposted ? arrayRemove(adventureId) : arrayUnion(adventureId) });
    } catch (error) {
      console.error("Failed to update reposts, reverting UI", error);
      // Revert on error
      setCurrentUser(prevUser => prevUser ? { ...prevUser, repostedAdventures: originalReposts } : null);
      handleShowToast("Could not update repost. Please try again.");
    }
  };

  const handleToggleSave = async (adventureId: string) => {
    if (!currentUser) return;
    
    const originalSaves = currentUser.savedAdventures || [];
    const isSaved = originalSaves.includes(adventureId);

    // Optimistic UI update
    const newSaves = isSaved
      ? originalSaves.filter(id => id !== adventureId)
      : [...originalSaves, adventureId];
      
    setCurrentUser(prevUser => prevUser ? { ...prevUser, savedAdventures: newSaves } : null);

    // Firebase update
    const userRef = doc(db, 'users', currentUser.id);
    try {
      await updateDoc(userRef, { savedAdventures: isSaved ? arrayRemove(adventureId) : arrayUnion(adventureId) });
    } catch (error) {
      console.error("Failed to update saved adventures, reverting UI", error);
      // Revert on error
      setCurrentUser(prevUser => prevUser ? { ...prevUser, savedAdventures: originalSaves } : null);
      handleShowToast("Could not save adventure. Please try again.");
    }
  };
  const handleShareAdventure = async (adventure: HydratedAdventure) => {
    if (navigator.share) {
      await navigator.share({ title: adventure.title, text: t('shareAdventureText', { authorName: adventure.author.name }), url: window.location.href });
    } else { handleShowToast(t('sharingNotSupported')); }
  };
  const handleShareProfile = async (user: User) => {
     if (navigator.share) {
      await navigator.share({ title: user.name, text: t('shareProfileText', { name: user.name }), url: window.location.href });
    } else { handleShowToast(t('sharingNotSupported')); }
  };
  const handleToggleCompleted = async (adventureId: string) => {
      if (!currentUser) return;
      const adventure = adventures.find(p => p.id === adventureId);
      if (!adventure || new Date(adventure.startDate) > new Date()) { handleShowToast(t('adventureNotEnded')); return; }

      const originalActivityLog = currentUser.activityLog || [];
      const existingEntry = originalActivityLog.find(a => a.adventureId === adventureId);

      if (existingEntry) { 
        handleShowToast(t('alreadyMarkedDone')); 
        return; 
      }

      const newLogEntry: ActivityLogEntry = { adventureId, status: ActivityStatus.Pending };
      
      // Optimistic UI update: show the pending state immediately.
      setCurrentUser(prev => prev ? { ...prev, activityLog: [...originalActivityLog, newLogEntry] } : null);
      handleShowToast(t('confirmationRequested'));

      try {
        const userRef = doc(db, 'users', currentUser.id);
        // Use arrayUnion for a safer, idempotent update on the backend.
        await updateDoc(userRef, { activityLog: arrayUnion(newLogEntry) });
        
        // Notify the adventure author.
        await addDoc(collection(db, 'notifications'), { 
          recipientId: adventure.authorId, 
          userId: currentUser.id, 
          adventureId, 
          attendeeId: currentUser.id, 
          attendeeName: currentUser.name, 
          text: t('attendanceRequestNotification', { title: adventure.title }), 
          type: 'attendanceRequest', 
          read: false, 
          createdAt: serverTimestamp() 
        });
      } catch (error) {
        console.error("Error marking adventure as completed:", error);
        // If the backend update fails, revert the optimistic UI change.
        setCurrentUser(prev => prev ? { ...prev, activityLog: originalActivityLog } : null);
        handleShowToast("Failed to mark as completed. Please try again.");
      }
  };

  // --- Story Handlers ---
  const handleCreateStory = async (mediaFile: File, privacy: AdventurePrivacy) => {
    if (!currentUser) return;
    try {
      const mediaRef = ref(storage, `stories/${currentUser.id}_${Date.now()}`);
      await uploadBytes(mediaRef, mediaFile);
      const url = await getDownloadURL(mediaRef);
      const media: Media = { url, type: mediaFile.type.startsWith('video') ? 'video' : 'image' };
      await addDoc(collection(db, 'stories'), {
        authorId: currentUser.id,
        media,
        createdAt: serverTimestamp(),
        privacy: privacy
      });
    } catch (error) { console.error("Error creating story:", error); }
  };
  const handleDeleteStory = async (story: HydratedStory) => {
    try {
        const storyRef = doc(db, 'stories', story.id);
        const mediaRef = ref(storage, story.media.url);
        await deleteObject(mediaRef);
        await deleteDoc(storyRef);
    } catch (e) { console.error("Error deleting story:", e) }
  };
  const handleUpdateStoryPrivacy = async (storyId: string, privacy: AdventurePrivacy) => {
    try {
        const storyRef = doc(db, 'stories', storyId);
        await updateDoc(storyRef, { privacy });
        handleShowToast("Story privacy updated!");
    } catch (error) {
        console.error("Error updating story privacy:", error);
        handleShowToast("Failed to update privacy.");
    }
  };

  // --- Social Handlers ---
  const handleFollowToggle = async (userId: string) => {
    if (!currentUser) return;
    const myRef = doc(db, 'users', currentUser.id);
    const theirRef = doc(db, 'users', userId);
    const isFollowing = (currentUser.following || []).includes(userId);
    const batch = writeBatch(db);
    batch.update(myRef, { following: isFollowing ? arrayRemove(userId) : arrayUnion(userId) });
    batch.update(theirRef, { followers: isFollowing ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id) });
    await batch.commit();
  };
  const handleRemoveFollower = async (followerId: string) => {
     if (!currentUser) return;
     const myRef = doc(db, 'users', currentUser.id);
     const theirRef = doc(db, 'users', followerId);
     const batch = writeBatch(db);
     batch.update(myRef, { followers: arrayRemove(followerId) });
     batch.update(theirRef, { following: arrayRemove(currentUser.id) });
     await batch.commit();
     handleShowToast(t('followerRemoved'));
  };

  // --- Messaging Handlers ---
  const handleSendMessage = async (conversation: HydratedConversation, content: Message['content'], mediaFile?: File) => {
    if (!currentUser) return;

    try {
        const convoRef = doc(db, 'conversations', conversation.id);
        
        // Handle media upload if present
        if (mediaFile) {
            const storageRef = ref(storage, `chats/${conversation.id}/${Date.now()}_${mediaFile.name}`);
            await uploadBytes(storageRef, mediaFile);
            const url = await getDownloadURL(storageRef);
            if (mediaFile.type.startsWith('audio')) {
                // Duration would ideally be calculated on the client before upload
                content.audio = { url, duration: content.audio?.duration || 0 };
            } else {
                content.media = { url, type: mediaFile.type.startsWith('video') ? 'video' : 'image' };
            }
        }
        
        const messageData = {
            senderId: currentUser.id,
            type: 'user',
            content,
            createdAt: serverTimestamp(),
            isDeletedFor: []
        };
        
        const unreadUpdates = conversation.participants
            .filter(pId => pId !== currentUser.id)
            .reduce((acc, pId) => {
                acc[`unreadCount.${pId}`] = increment(1);
                return acc;
            }, {} as { [key: string]: any });
            
        await updateDoc(convoRef, { ...unreadUpdates, updatedAt: serverTimestamp(), lastMessage: messageData });
        await addDoc(collection(convoRef, 'messages'), messageData);

    } catch (error) {
        console.error("Error sending message:", error);
        handleShowToast("Failed to send message.");
    }
  };

  const handleStartPrivateConversation = async (user: User) => {
    if (!currentUser) return;
    const convoId = [currentUser.id, user.id].sort().join('_');
    const convoRef = doc(db, 'conversations', convoId);
    
    const docSnap = await getDoc(convoRef);
    if (!docSnap.exists()) {
        const newConvoData: Conversation = {
            id: convoId,
            type: 'private',
            participants: [currentUser.id, user.id],
            updatedAt: new Date().toISOString(),
        };
        await setDoc(convoRef, newConvoData);
        setSelectedConversation({ ...newConvoData, participant: user });
    } else {
        setSelectedConversation({ id: docSnap.id, ...docSnap.data(), participant: user } as HydratedConversation);
    }
    pushScreen('chatDetail');
  };
  const handleAttemptJoinGroupChat = (adventure: HydratedAdventure) => {
    if (isGuest) {
      handleGuestAction();
      return;
    }
    setAdventureToJoinChat(adventure);
  };
  const handleConfirmJoinGroupChat = async (adventure: HydratedAdventure) => {
    if (!currentUser) return;

    setAdventureToJoinChat(null); // Close modal
    const q = query(collection(db, "conversations"), where("adventureId", "==", adventure.id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        const convoDoc = querySnapshot.docs[0];
        const convoRef = doc(db, 'conversations', convoDoc.id);
        
        // Add user to participants if not already in
        await updateDoc(convoRef, { participants: arrayUnion(currentUser.id) });
        
        setSelectedConversation({ id: convoDoc.id, ...convoDoc.data() } as HydratedConversation);
        pushScreen('chatDetail');
    } else {
        console.error("No group chat found for this adventure.");
    }
  };
  const handleLeaveGroup = async (conversation: HydratedConversation) => {
      if (!currentUser) return;
      const convoRef = doc(db, 'conversations', conversation.id);
      try {
          // Add system message
          const systemMessage = {
              senderId: 'system',
              type: 'system',
              content: { text: `${currentUser.name} has left the group.` },
              createdAt: serverTimestamp(),
              isDeletedFor: []
          };
          await addDoc(collection(convoRef, 'messages'), systemMessage);

          // Remove participant and update last message
          await updateDoc(convoRef, {
              participants: arrayRemove(currentUser.id),
              updatedAt: serverTimestamp(),
              lastMessage: systemMessage
          });
          
          popScreen(); // Go back from settings
          popScreen(); // Go back from chat detail
          handleShowToast("You have left the group.");

      } catch (error) {
          console.error("Error leaving group:", error);
      }
  };
  const handleUnsendMessage = async (conversationId: string, messageId: string) => {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await deleteDoc(messageRef);
    // Note: Handling `lastMessage` update would require more complex logic, omitted for now.
  };
  const handleDeleteMessageForMe = async (conversationId: string, messageId: string) => {
    if (!currentUser) return;
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, { isDeletedFor: arrayUnion(currentUser.id) });
  };
  
  // --- Comment Handler ---
  const handleAddComment = async (adventureId: string, text: string) => {
    if (!currentUser) return;
    const commentData = { authorId: currentUser.id, text, createdAt: serverTimestamp() };
    await addDoc(collection(db, 'posts', adventureId, 'comments'), commentData);
    await updateDoc(doc(db, 'posts', adventureId), { commentCount: increment(1) });
    const adventure = adventures.find(p => p.id === adventureId);
    if (adventure && adventure.authorId !== currentUser.id) {
        await addDoc(collection(db, 'notifications'), { recipientId: adventure.authorId, userId: currentUser.id, adventureId, text: t('commentNotificationText', { title: adventure.title }), type: 'comment', read: false, createdAt: serverTimestamp() });
    }
  };
  
  // --- Notification Handlers ---
  const handleConfirmAttendance = async (notificationId: string, adventureId: string, attendeeId: string, didAttend: boolean) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    const adventure = adventures.find(p => p.id === adventureId);
    if (didAttend && adventure) {
        const attendeeRef = doc(db, 'users', attendeeId);
        await runTransaction(db, async (transaction) => {
            const attendeeDoc = await transaction.get(attendeeRef);
            if (!attendeeDoc.exists()) throw "Attendee not found!";
            const activityLog = attendeeDoc.data().activityLog || [];
            const newLog = activityLog.map((entry: ActivityLogEntry) => entry.adventureId === adventureId ? { ...entry, status: ActivityStatus.Confirmed } : entry);
            transaction.update(attendeeRef, { activityLog: newLog });
        });
        await addDoc(collection(db, 'notifications'), { recipientId: attendeeId, userId: currentUser!.id, adventureId, text: t('attendanceConfirmedNotification', { title: adventure.title }), type: 'attendanceConfirmed', read: false, createdAt: serverTimestamp() });
        await addDoc(collection(db, 'notifications'), { recipientId: attendeeId, userId: currentUser!.id, adventureId, text: t('rateExperienceNotification', { title: adventure.title }), type: 'rateExperience', read: false, createdAt: serverTimestamp() });
    }
    await deleteDoc(notificationRef);
  };
  const handleMarkAllNotificationsAsRead = async () => {
    if (!currentUser) return;
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };
  const handleNotificationClick = (notification: HydratedNotification) => {
      if(notification.type === 'rateExperience' && notification.adventure) {
          setRatingModalAdventure(notification.adventure);
      } else if (notification.adventureId) {
          const adventure = hydratedAdventures.find(p => p.id === notification.adventureId);
          if (adventure) setSelectedAdventure(adventure);
      }
  };

  // --- Rating Handler ---
  const handleSubmitRating = async (adventureId: string, rating: number) => {
    const adventure = adventures.find(p => p.id === adventureId);
    if (!adventure) return;
    const hostRef = doc(db, 'users', adventure.authorId);
    await runTransaction(db, async (transaction) => {
        const hostDoc = await transaction.get(hostRef);
        if (!hostDoc.exists()) throw "Host not found!";
        const currentTotal = hostDoc.data().totalRatings || 0;
        const currentAvg = hostDoc.data().averageRating || 0;
        const newTotal = currentTotal + 1;
        const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;
        transaction.update(hostRef, { totalRatings: newTotal, averageRating: newAvg });
    });
    setRatingModalAdventure(null);
    handleShowToast(t('feedbackThanks'));
  };

  // --- Profile Handler ---
  const handleUpdateProfile = async (updatedData: Partial<User>, avatarFile?: File, coverFile?: File) => {
    if (!currentUser) return;
    try {
        let avatarUrl = currentUser.avatarUrl;
        let coverUrl = currentUser.coverUrl;
        if (avatarFile) {
            const avatarRef = ref(storage, `avatars/${currentUser.id}`);
            await uploadBytes(avatarRef, avatarFile);
            avatarUrl = await getDownloadURL(avatarRef);
        }
        if (coverFile) {
            const coverRef = ref(storage, `covers/${currentUser.id}`);
            await uploadBytes(coverRef, coverFile);
            coverUrl = await getDownloadURL(coverRef);
        }
        await updateDoc(doc(db, 'users', currentUser.id), { ...updatedData, avatarUrl, coverUrl });
        handleShowToast(t('settingsSaved'));
        popScreen();
    } catch (error) { console.error("Error updating profile:", error); }
  };
  
  // Fix: Create a new handler for SideNav clicks to use `pushScreen` for secondary pages,
  // fixing the broken back button behavior for Chat and Notifications.
  const handleSideNavClick = (screen: Screen) => {
    const mainScreens: Screen[] = ['adventures', 'map', 'search', 'create', 'profile'];
    if (mainScreens.includes(screen)) {
      resetToScreen(screen);
    } else {
      // For secondary screens like chat and notifications, push them onto the stack.
      pushScreen(screen);
    }
  };

  // Centralized handler for viewing user profiles.
  const handleViewProfile = (userToView: User) => {
    if (currentUser && userToView.id === currentUser.id) {
      // If it's the current user, navigate to their main profile screen.
      resetToScreen('profile');
    } else {
      // For any other user, push their profile onto the navigation stack.
      // Reset the tab for the user profile being viewed
      setUserProfileTab('adventures');
      setViewingUser(userToView);
      pushScreen('userProfile');
    }
  };

  // Special handler for viewing profiles from the FollowListModal, which also needs to close the modal.
  const handleViewProfileFromModal = (user: User) => {
    setFollowListModal({ isOpen: false, user: null, listType: null });
    handleViewProfile(user); // Use the centralized logic
  };

  const handleViewCompletedByType = (user: User, type: AdventureType) => {
    setViewingCompleted({ user, type });
    pushScreen('completedAdventuresByType');
  };
  
  const handleSelectStories = (stories: HydratedStory[]) => {
      setViewingStories(stories); 
      const firstStory = stories[0]; 
      if(firstStory){ 
          const newTimestamps = {...viewedStoryTimestamps, [firstStory.author.id]: new Date().toISOString()}; 
          setViewedStoryTimestamps(newTimestamps); 
          localStorage.setItem('viewedStoryTimestamps', JSON.stringify(newTimestamps)); 
      }
  }

  // Render Logic
  const renderScreen = () => {
    
    switch (activeScreen) {
      case 'adventures': return <AdventuresScreen adventures={hydratedAdventures.filter(p => !p.author.isPrivate || (currentUser?.following?.includes(p.author.id)) || p.author.id === currentUser?.id)} stories={hydratedStories} currentUser={currentUser || guestUser} onSelectAdventure={setSelectedAdventure} onSendMessage={handleStartPrivateConversation} onToggleInterest={handleToggleInterest} onSelectStories={handleSelectStories} onNavigateToNotifications={() => pushScreen('notifications')} hasUnreadNotifications={hasUnreadNotifications} onNavigateToChat={() => pushScreen('chat')} onViewProfile={handleViewProfile} onRepostToggle={handleToggleRepost} onSaveToggle={handleToggleSave} onShareAdventure={handleShareAdventure} onToggleCompleted={handleToggleCompleted} isGuest={isGuest} onGuestAction={handleGuestAction} onNavigateToSearch={() => resetToScreen('search')} onNavigateToProfile={() => resetToScreen('profile')} onViewLocationOnMap={(adv: HydratedAdventure | null) => { setMapAdventuresToShow(adv ? [adv] : null); resetToScreen('map'); }} onDeleteAdventure={handleDeleteAdventure} onEditAdventure={handleStartEditAdventure} viewedStoryTimestamps={viewedStoryTimestamps} onJoinGroupChat={handleAttemptJoinGroupChat} />;
      case 'map': return <MapScreen adventuresToShow={hydratedMapAdventures} isLoaded={isLoaded} onShowToast={handleShowToast} onSelectAdventure={setSelectedAdventure} />;
      case 'create': return <CreateAdventureScreen currentUser={currentUser!} onCreateAdventure={handleCreateAdventure} isLoaded={isLoaded} />;
      case 'search': return <SearchScreen adventures={hydratedAdventures} stories={hydratedStories} allUsers={users} currentUser={currentUser || guestUser} isGuest={isGuest} isLoaded={isLoaded} onSelectAdventure={setSelectedAdventure} onSendMessage={handleStartPrivateConversation} onToggleInterest={handleToggleInterest} onNavigateToFindTwins={() => pushScreen('findTwins')} onViewProfile={handleViewProfile} onShowResultsOnMap={(advs) => { setMapAdventuresToShow(advs); resetToScreen('map'); }} onRepostToggle={handleToggleRepost} onSaveToggle={handleToggleSave} onShareAdventure={handleShareAdventure} onToggleCompleted={handleToggleCompleted} onViewLocationOnMap={(adv: HydratedAdventure | null) => { setMapAdventuresToShow(adv ? [adv] : null); resetToScreen('map'); }} onDeleteAdventure={handleDeleteAdventure} onEditAdventure={handleStartEditAdventure} onFollowToggle={handleFollowToggle} onJoinGroupChat={handleAttemptJoinGroupChat} viewedStoryTimestamps={viewedStoryTimestamps} onSelectStories={handleSelectStories} />;
      case 'chat': return <ChatScreen conversations={hydratedConversations} onSelectConversation={(convo) => { setSelectedConversation(convo); pushScreen('chatDetail'); }} onBack={popScreen} currentUser={currentUser!} onViewProfile={handleViewProfile} />;
      case 'profile': return <ProfileScreen user={currentUser || guestUser} allAdventures={hydratedAdventures} onSelectAdventure={setSelectedAdventure} onSendMessage={handleStartPrivateConversation} onToggleInterest={handleToggleInterest} onViewProfile={handleViewProfile} onRepostToggle={handleToggleRepost} onSaveToggle={handleToggleSave} onShareProfile={handleShareProfile} onShareAdventure={handleShareAdventure} onToggleCompleted={handleToggleCompleted} onOpenFollowList={(user, listType) => setFollowListModal({ isOpen: true, user, listType })} onNavigateToSettings={() => pushScreen('settings')} onViewLocationOnMap={(adv: HydratedAdventure | null) => { setMapAdventuresToShow(adv ? [adv] : null); resetToScreen('map'); }} onDeleteAdventure={handleDeleteAdventure} onEditAdventure={handleStartEditAdventure} onJoinGroupChat={handleAttemptJoinGroupChat} onViewCompletedByType={handleViewCompletedByType} activeTab={profileTab} setActiveTab={setProfileTab} stories={hydratedStories} onSelectStories={handleSelectStories} onAddStory={() => setIsAddStoryModalOpen(true)} viewedStoryTimestamps={viewedStoryTimestamps} />;
      case 'chatDetail': return <ChatDetailScreen conversation={selectedConversation!} currentUser={currentUser!} allUsers={users} onBack={popScreen} onSendMessage={handleSendMessage} onViewProfile={handleViewProfile} onOpenSettings={(convo) => { setViewingGroupSettings(convo); pushScreen('groupChatSettings');}} onUnsendMessage={handleUnsendMessage} onDeleteMessageForMe={handleDeleteMessageForMe} />;
      case 'findTwins': return <FindTwinsScreen currentUser={currentUser!} allUsers={users} onSendMessage={handleStartPrivateConversation} onBack={popScreen} onFollowToggle={handleFollowToggle} onViewProfile={handleViewProfile} />;
      case 'userProfile': return <UserProfileScreen user={viewingUser!} currentUser={currentUser || guestUser} allAdventures={hydratedAdventures} onBack={popScreen} onSelectAdventure={setSelectedAdventure} onSendMessage={handleStartPrivateConversation} onToggleInterest={handleToggleInterest} onFollowToggle={handleFollowToggle} onViewProfile={handleViewProfile} onRepostToggle={handleToggleRepost} onSaveToggle={handleToggleSave} onShareProfile={handleShareProfile} onShareAdventure={handleShareAdventure} onToggleCompleted={handleToggleCompleted} onOpenFollowList={(user, listType) => setFollowListModal({ isOpen: true, user, listType })} isGuest={isGuest} onViewLocationOnMap={(adv: HydratedAdventure | null) => { setMapAdventuresToShow(adv ? [adv] : null); resetToScreen('map'); }} onDeleteAdventure={handleDeleteAdventure} onEditAdventure={handleStartEditAdventure} onJoinGroupChat={handleAttemptJoinGroupChat} onViewCompletedByType={handleViewCompletedByType} activeTab={userProfileTab} setActiveTab={setUserProfileTab} stories={hydratedStories} onSelectStories={handleSelectStories} viewedStoryTimestamps={viewedStoryTimestamps} />;
      case 'settings': return <SettingsScreen onBack={popScreen} onNavigate={pushScreen} onLogout={handleLogout} />;
      case 'editProfile': return <EditProfileScreen onBack={popScreen} currentUser={currentUser!} onUpdateProfile={handleUpdateProfile} />;
      case 'privacySecurity': return <PrivacySecurityScreen onBack={popScreen} currentUser={currentUser!} onUpdateProfile={handleUpdateProfile} />;
      case 'language': return <LanguageScreen onBack={popScreen} />;
      case 'savedAdventures': return <SavedAdventuresScreen onBack={popScreen} adventures={hydratedAdventures.filter(p => currentUser?.savedAdventures?.includes(p.id))} currentUser={currentUser!} onSelectAdventure={setSelectedAdventure} onSendMessage={handleStartPrivateConversation} onToggleInterest={handleToggleInterest} onViewProfile={handleViewProfile} onRepostToggle={handleToggleRepost} onSaveToggle={handleToggleSave} onShareAdventure={handleShareAdventure} onToggleCompleted={handleToggleCompleted} onViewLocationOnMap={(adv: HydratedAdventure | null) => { setMapAdventuresToShow(adv ? [adv] : null); resetToScreen('map'); }} onDeleteAdventure={handleDeleteAdventure} onEditAdventure={handleStartEditAdventure} onJoinGroupChat={handleAttemptJoinGroupChat} stories={hydratedStories} onSelectStories={handleSelectStories} viewedStoryTimestamps={viewedStoryTimestamps} />;
      case 'notifications': return <NotificationsScreen notifications={hydratedNotifications} onBack={popScreen} onConfirmAttendance={handleConfirmAttendance} onNotificationClick={handleNotificationClick} onMarkAllAsRead={handleMarkAllNotificationsAsRead} />;
      case 'editAdventure': return <EditAdventureScreen adventure={editingAdventure!} onBack={popScreen} onUpdateAdventure={handleUpdateAdventure} isLoaded={isLoaded} />;
      case 'completedAdventuresByType': return <CompletedAdventuresByTypeScreen user={viewingCompleted!.user} type={viewingCompleted!.type} onBack={popScreen} allAdventures={hydratedAdventures} currentUser={currentUser || guestUser} onSelectAdventure={setSelectedAdventure} onSendMessage={handleStartPrivateConversation} onToggleInterest={handleToggleInterest} onViewProfile={handleViewProfile} onRepostToggle={handleToggleRepost} onSaveToggle={handleToggleSave} onShareAdventure={handleShareAdventure} onToggleCompleted={handleToggleCompleted} onViewLocationOnMap={(adv: HydratedAdventure | null) => { setMapAdventuresToShow(adv ? [adv] : null); resetToScreen('map'); }} onDeleteAdventure={handleDeleteAdventure} onEditAdventure={handleStartEditAdventure} onJoinGroupChat={handleAttemptJoinGroupChat} isGuest={isGuest} stories={hydratedStories} onSelectStories={handleSelectStories} viewedStoryTimestamps={viewedStoryTimestamps} />;
      case 'groupChatSettings': return <GroupChatSettingsScreen conversation={viewingGroupSettings!} currentUser={currentUser!} allUsers={users} onBack={popScreen} onLeaveGroup={handleLeaveGroup} onViewProfile={handleViewProfile} />;
      default: return <div>Not implemented</div>;
    }
  };

  if (!authChecked) {
    return (
      <div className="h-screen w-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  if (!currentUser && !isGuest) {
    return <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} onSocialLogin={handleSocialLogin} onGuestLogin={handleGuestLogin} onForgotPassword={() => setIsForgotPasswordModalOpen(true)} />;
  }

  return (
    <div className="w-screen h-screen flex bg-transparent text-gray-800 dark:text-gray-200">
      <SideNav activeScreen={activeScreen} setActiveScreen={isGuest ? handleGuestAction : handleSideNavClick} hasUnreadNotifications={hasUnreadNotifications} isGuest={isGuest} onGuestAction={handleGuestAction} />
      
      <main ref={mainContentRef} className="flex-1 max-w-2xl mx-auto xl:ms-0 xl:me-auto w-full flex flex-col overflow-y-auto pb-16 xl:pb-0">
        {isGuest && <GuestHeader onLoginClick={handleLogout} />}
        {renderScreen()}
      </main>
      
      <BottomNav activeScreen={activeScreen} setActiveScreen={(screen) => resetToScreen(screen)} isGuest={isGuest} onGuestAction={handleGuestAction} />
      
      {/* --- Modals --- */}
      {selectedAdventure && <AdventureDetailModal adventure={selectedAdventure} comments={hydratedComments} currentUser={currentUser} onClose={() => setSelectedAdventure(null)} onAddComment={handleAddComment} />}
      {viewingStories && <StoryViewer stories={viewingStories} onClose={() => setViewingStories(null)} currentUser={currentUser} onDeleteStory={handleDeleteStory} onUpdateStoryPrivacy={handleUpdateStoryPrivacy} />}
      {ratingModalAdventure && <RatingModal adventure={ratingModalAdventure} onClose={() => setRatingModalAdventure(null)} onSubmit={handleSubmitRating} />}
      {adventureToJoinChat && <JoinGroupChatConfirmationModal adventure={adventureToJoinChat} onClose={() => setAdventureToJoinChat(null)} onConfirm={handleConfirmJoinGroupChat} />}
      {followListModal.isOpen && <FollowListModal title={t(followListModal.listType!)} listOwner={followListModal.user!} currentUser={currentUser} users={users.filter(u => followListModal.user?.[followListModal.listType!]?.includes(u.id))} listType={followListModal.listType!} onClose={() => setFollowListModal({ isOpen: false, user: null, listType: null })} onViewProfile={handleViewProfileFromModal} onFollowToggle={handleFollowToggle} onRemoveFollower={handleRemoveFollower} />}
      {isForgotPasswordModalOpen && <ForgotPasswordModal isOpen={isForgotPasswordModalOpen} onClose={() => setIsForgotPasswordModalOpen(false)} onSubmit={handleForgotPassword} />}
      {isAddStoryModalOpen && !isGuest && <AddStoryModal isOpen={isAddStoryModalOpen} onClose={() => setIsAddStoryModalOpen(false)} onStoryCreate={handleCreateStory} />}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default App;
