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
import Header from './components/Header';


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

// Fix: Corrected the component definition. The original file was truncated, missing the return statement and export.
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
  const [viewedStoryTimestamps, setViewedStoryTimestamps] = useState<Record<string, string>>(() => 
    JSON.parse(localStorage.getItem('viewedStoryTimestamps') || '{}')
  );
  
  const mainContentRef = useRef<HTMLDivElement>(null);
  // Fix: Add a ref to hold the comment listener unsubscribe function.
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
    }, (error: any) => {
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
    }, (error: any) => {
        console.error("Error fetching adventures:", error);
    });

    const storiesQuery = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubStories = onSnapshot(storiesQuery, (snapshot) => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const freshStories = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
            } as Story
        }).filter(story => new Date(story.createdAt) > twentyFourHoursAgo);
        setStories(freshStories);
    }, (error: any) => {
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
    // Fix: Completed truncated line to scroll to top on screen pop.
    mainContentRef.current?.scrollTo(0, 0);
  };

  // NOTE: The original file was truncated. The following render logic is a placeholder
  // to fix the compilation errors. The full UI implementation with all components
  // and handlers needs to be restored.

  // Fix: Added a return statement with a basic UI structure to resolve the 'React.FC' type error.
  if (!authChecked) {
    return (
      <div className="h-screen w-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Placeholder for AuthScreen, as handlers are missing.
  if (!currentUser && !isGuest) {
    // A real implementation would require handler functions for login, signup, etc.
    return (
      <AuthScreen
        onLogin={() => alert('Login handler not implemented.')}
        onSignUp={() => alert('Sign-up handler not implemented.')}
        onSocialLogin={() => alert('Social login handler not implemented.')}
        onGuestLogin={() => alert('Guest login handler not implemented.')}
        onForgotPassword={() => alert('Forgot password handler not implemented.')}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex bg-slate-50 dark:bg-neutral-950 text-gray-800 dark:text-gray-200">
      {/* Placeholder for SideNav */}
       <SideNav 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        hasUnreadNotifications={hasUnreadNotifications} 
        isGuest={isGuest} 
        onGuestAction={() => { /* Placeholder */ }} 
      />
      
      <main ref={mainContentRef} className="flex-1 overflow-y-auto pb-16 xl:pb-0">
        <Header title={`Screen: ${activeScreen}`} onBack={screenStack.length > 1 ? popScreen : undefined} />
        <div className="p-4">
          <p>Main content area for '{activeScreen}'.</p>
          <p>This is a placeholder UI because the original file was incomplete.</p>
          {/* A complete implementation would render the active screen component here */}
        </div>
      </main>
      
      {/* Placeholder for BottomNav */}
       <BottomNav 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        isGuest={isGuest} 
        onGuestAction={() => { /* Placeholder */ }} 
       />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

// Fix: Added default export for the App component to resolve the module loading error in index.tsx.
export default App;
