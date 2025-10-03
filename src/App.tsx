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
import NotificationPanel from './components/NotificationPanel';
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
import { useTranslation } from './contexts/LanguageContext';

import { Screen, Adventure, AdventureType, User, Story, Notification, AdventurePrivacy, HydratedAdventure, HydratedStory, ActivityStatus, NotificationType, HydratedConversation, Conversation, Message, HydratedComment, Comment } from './types';
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
  GoogleAuthProvider, signInWithPopup, increment
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
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
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
  const { t } = useTranslation();

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
        console.log(`[DIAGNOSTIC] Fetched ${fetchedUsers.length} users.`);
        setUsers(fetchedUsers);
    }, (error) => {
        console.error("[DIAGNOSTIC] Error fetching users:", error);
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
        console.log(`[DIAGNOSTIC] Fetched ${fetchedAdventures.length} adventures from 'posts' collection.`);
        setAdventures(fetchedAdventures);
    }, (error) => {
        console.error("[DIAGNOSTIC] Error fetching adventures:", error);
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
    });

    return () => {
        unsubUsers();
        unsubAdventures();
        unsubStories();
    };
  }, []);

  // User-specific Listeners (Notifications, Conversations)
  useEffect(() => {
    if (!currentUser) {
        setNotifications([]);
        setConversations([]);
        return;
    }

    const notificationsQuery = query(collection(db, "notifications"), where("recipientId", "==", currentUser.id), orderBy("createdAt", "desc"));
    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        const fetchedNotifications = snapshot.docs.map(doc => {
            const data = doc.data();
            const user = users.find(u => u.id === data.userId) || data.user;
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
                user,
            } as Notification;
        });
        setNotifications(fetchedNotifications.filter(n => n.user));
    });

    const conversationsQuery = query(collection(db, "conversations"), where("participants", "array-contains", currentUser.id), orderBy("updatedAt", "desc"));
    const unsubConversations = onSnapshot(conversationsQuery, (snapshot) => {
        const fetchedConversations = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
                lastMessage: data.lastMessage ? {
                    ...data.lastMessage,
                    createdAt: (data.lastMessage.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
                } : undefined
            } as Conversation
        });
        setConversations(fetchedConversations);
    });

    return () => {
        unsubNotifications();
        unsubConversations();
    };
  }, [currentUser, users, adventures]);

  // Listener for comments when an adventure detail modal is opened
  useEffect(() => {
    if (!selectedAdventure) {
      setComments([]);
      return;
    }
    const commentsQuery = query(collection(db, 'posts', selectedAdventure.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
      } as Comment));
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [selectedAdventure]);

  const hydratedAdventures = useMemo((): HydratedAdventure[] => {
    return adventures
      .map(adventure => {
        const author = users.find(u => u.id === adventure.authorId);
        return author ? { ...adventure, author } : null;
      })
      .filter((adventure): adventure is HydratedAdventure => adventure !== null);
  }, [adventures, users]);
  
  const hydratedStories = useMemo((): HydratedStory[] => {
      return stories
        .map(story => {
          const author = users.find(u => u.id === story.authorId);
          return author ? { ...story, author } : null;
        })
        .filter((story): story is HydratedStory => story !== null);
  }, [stories, users]);
  
  const hydratedComments = useMemo((): HydratedComment[] => {
    return comments.map(comment => {
      const author = users.find(u => u.id === comment.authorId);
      return author ? { ...comment, author } : null;
    }).filter((comment): comment is HydratedComment => comment !== null);
  }, [comments, users]);

   const hydratedConversations = useMemo((): HydratedConversation[] => {
    if (!currentUser) return [];
    return conversations.map(convo => {
      const participantId = convo.participants.find(p => p !== currentUser.id);
      const participant = users.find(u => u.id === participantId);
      if (!participant) return null;
      return { ...convo, participant };
    }).filter((c): c is HydratedConversation => c !== null);
  }, [conversations, users, currentUser]);

  
  const savedAdventures = useMemo(() => {
    if (!currentUser) return [];
    return hydratedAdventures.filter(p => (currentUser.savedAdventures || []).includes(p.id));
  }, [hydratedAdventures, currentUser]);

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(n => n.recipientId === currentUser.id);
  }, [notifications, currentUser]);

  const hasUnreadNotifications = userNotifications.some(n => !n.read);

  const showGuestToast = () => {
    setToastMessage(t('guestToastMessage'));
  };

  const navigateTo = (screen: Screen) => {
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
    setScreenStack(prev => [...prev, screen]);
    setActiveScreen(screen);
  };
  
  const goBack = () => {
     if (screenStack.length > 1) {
        const newStack = [...screenStack];
        newStack.pop();
        setScreenStack(newStack);
        setActiveScreen(newStack[newStack.length - 1]);
     }
  };

  const handleSetActiveScreen = (screen: Screen) => {
    if (isGuest && (screen === 'create' || screen === 'profile' || screen === 'chat')) {
      showGuestToast(); return;
    }
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
    setScreenStack([screen]);
    setActiveScreen(screen);
  };
  
  const handleLogin = async (email: string, pass: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        console.error("Login failed:", error);
        alert(t('invalidCredentials'));
    }
  };
  
  const handleSignUp = async (name: string, username: string, email: string, pass: string, birthday: string, gender: string, country: string) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;
        if (!user) throw new Error("User creation failed.");

        const newUser: Omit<User, 'id'> = {
            name,
            username,
            email,
            avatarUrl: `https://picsum.photos/seed/${username}/200`,
            coverUrl: `https://picsum.photos/seed/${username}-cover/800/200`,
            bio: '',
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

        await setDoc(doc(db, 'users', user.uid), newUser);
        setToastMessage(t('emailConfirmationSent'));
      } catch(error: any) {
        if(error.code === 'auth/email-already-in-use') {
            alert(t('emailExistsError'));
        } else {
            console.error("Sign up failed:", error);
            alert("An error occurred during sign up.");
        }
      }
  };
  
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    if (provider !== 'google') {
      alert('Facebook login is not implemented yet.');
      return;
    }

    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        const newUser: Omit<User, 'id'> = {
            name: user.displayName || 'New User',
            username: user.email?.split('@')[0] || user.uid,
            email: user.email || '',
            avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200`,
            coverUrl: `https://picsum.photos/seed/${user.uid}-cover/800/200`,
            bio: '',
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
    } catch(error: any) {
      console.error("Social login failed:", error);
      alert("Failed to sign in with Google.");
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setCurrentUser(null);
    handleSetActiveScreen('feed');
  };
  
  const handleReturnToAuth = () => {
    setIsGuest(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsGuest(false);
    setScreenStack(['feed']);
    handleSetActiveScreen('feed');
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setToastMessage(t('passwordResetSent'));
      setTimeout(() => setIsForgotPasswordModalOpen(false), 2500);
    } catch (error) {
      console.error("Password reset failed:", error);
      setToastMessage("Failed to send reset email.");
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const uploadTask = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadTask.ref);
  };
  
  const handleUpdateProfile = async (updatedData: Partial<User>, avatarFile?: File, coverFile?: File) => {
    if (!currentUser) return;
    try {
        let avatarUrl = currentUser.avatarUrl;
        if (avatarFile) {
            avatarUrl = await uploadFile(avatarFile, `avatars/${currentUser.id}/${avatarFile.name}`);
        }

        let coverUrl = currentUser.coverUrl;
        if (coverFile) {
            coverUrl = await uploadFile(coverFile, `covers/${currentUser.id}/${coverFile.name}`);
        }
        
        const userDocRef = doc(db, 'users', currentUser.id);
        await updateDoc(userDocRef, {
            ...updatedData,
            avatarUrl,
            coverUrl
        });

        setToastMessage(t('settingsSaved'));
        goBack();
    } catch(e) {
        console.error("Error updating profile: ", e);
        setToastMessage("Failed to update profile.");
    }
  };

  const handleCreateAdventure = async (newAdventureData: Omit<Adventure, 'id' | 'authorId' | 'interestedUsers' | 'commentCount' | 'createdAt'>, mediaFile: File | null) => {
    if (!currentUser) return;
    try {
        const adventureToSave: any = {
            ...newAdventureData,
            authorId: currentUser.id,
            interestedUsers: [],
            commentCount: 0,
            createdAt: serverTimestamp(),
        };

        if (mediaFile) {
            const mediaUrl = await uploadFile(mediaFile, `adventures/${currentUser.id}/${Date.now()}_${mediaFile.name}`);
            adventureToSave.media = [{ url: mediaUrl, type: mediaFile.type.startsWith('video') ? 'video' : 'image' }];
        }
        
        const adventuresCollectionRef = collection(db, 'posts');
        await addDoc(adventuresCollectionRef, adventureToSave);

        handleSetActiveScreen('feed');
        setToastMessage(t('adventurePublished'));
    } catch(e) {
        console.error("Error creating adventure:", e);
        setToastMessage("Failed to publish adventure.");
    }
  };
  
  const handleCreateStory = async (mediaFile: File) => {
      if (!currentUser) return;
      try {
          const mediaUrl = await uploadFile(mediaFile, `stories/${currentUser.id}/${Date.now()}_${mediaFile.name}`);
          const newStory = {
              authorId: currentUser.id,
              media: { url: mediaUrl, type: mediaFile.type.startsWith('video') ? 'video' : 'image' },
              createdAt: serverTimestamp(),
          };
          const storiesCollectionRef = collection(db, 'stories');
          await addDoc(storiesCollectionRef, newStory);
      } catch(e) {
          console.error("Error creating story:", e);
          setToastMessage("Failed to add story.");
      }
  };
  
  const handleFollowToggle = async (userIdToFollow: string) => {
    if (!currentUser) { showGuestToast(); return; }
    const currentUserRef = doc(db, "users", currentUser.id);
    const userToFollowRef = doc(db, "users", userIdToFollow);
    
    const isFollowing = (currentUser.following || []).includes(userIdToFollow);
    
    try {
        await updateDoc(currentUserRef, {
            following: isFollowing ? arrayRemove(userIdToFollow) : arrayUnion(userIdToFollow)
        });
        await updateDoc(userToFollowRef, {
            followers: isFollowing ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id)
        });
    } catch (e) {
        console.error("Error toggling follow:", e);
    }
  };

  const handleRemoveFollower = async (followerIdToRemove: string) => {
    if (!currentUser) return;
    const currentUserRef = doc(db, "users", currentUser.id);
    const followerToRemoveRef = doc(db, "users", followerIdToRemove);
    try {
        await updateDoc(currentUserRef, { followers: arrayRemove(followerIdToRemove) });
        await updateDoc(followerToRemoveRef, { following: arrayRemove(currentUser.id) });
        setToastMessage(t('followerRemoved'));
    } catch (e) {
        console.error("Error removing follower:", e);
    }
  };

  const handleToggleInterest = async (adventureId: string) => {
    if (!currentUser) { showGuestToast(); return; }
    const adventureRef = doc(db, "posts", adventureId);
    const adventure = adventures.find(p => p.id === adventureId);
    if (!adventure) return;
    
    const isInterested = (adventure.interestedUsers || []).includes(currentUser.id);
    
    try {
        await updateDoc(adventureRef, {
            interestedUsers: isInterested ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id)
        });
    } catch (e) {
        console.error("Error toggling interest:", e);
    }
  };
  
  const handleRepostToggle = async (adventureId: string) => {
    if (!currentUser) { showGuestToast(); return; }
    const userRef = doc(db, "users", currentUser.id);
    const isReposted = (currentUser.repostedAdventures || []).includes(adventureId);
    try {
        await updateDoc(userRef, {
            repostedAdventures: isReposted ? arrayRemove(adventureId) : arrayUnion(adventureId)
        });
    } catch (e) { console.error("Error toggling repost:", e); }
  };

  const handleSaveToggle = async (adventureId: string) => {
    if (!currentUser) { showGuestToast(); return; }
    const userRef = doc(db, "users", currentUser.id);
    const isSaved = (currentUser.savedAdventures || []).includes(adventureId);
    try {
        await updateDoc(userRef, {
            savedAdventures: isSaved ? arrayRemove(adventureId) : arrayUnion(adventureId)
        });
    } catch (e) { console.error("Error toggling save:", e); }
  };
  
  const handleSelectConversation = (user: User) => {
     setSelectedConversationUser(user);
     navigateTo('chatDetail');
  };

  const handleSendMessage = async (receiverId: string, text: string) => {
    if (!currentUser) return;
  
    const convoId = [currentUser.id, receiverId].sort().join('_');
    const convoRef = doc(db, 'conversations', convoId);
    const messagesRef = collection(convoRef, 'messages');
  
    const newMessage: Omit<Message, 'id' | 'createdAt'> = {
        senderId: currentUser.id,
        text: text,
    };

    try {
        await addDoc(messagesRef, { ...newMessage, createdAt: serverTimestamp() });
        
        const lastMessageForConvo = {
            ...newMessage,
            createdAt: serverTimestamp()
        };

        await setDoc(convoRef, {
            participants: [currentUser.id, receiverId],
            lastMessage: lastMessageForConvo,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    } catch(e) {
        console.error("Error sending message:", e);
        setToastMessage("Failed to send message.");
    }
  };

  const handleAddComment = async (adventureId: string, text: string) => {
    if (!currentUser) { showGuestToast(); return; }

    const adventureRef = doc(db, "posts", adventureId);
    const commentsRef = collection(adventureRef, 'comments');
    
    try {
        await addDoc(commentsRef, {
            authorId: currentUser.id,
            text,
            createdAt: serverTimestamp(),
        });
        await updateDoc(adventureRef, { commentCount: increment(1) });
    } catch (e) {
        console.error("Error adding comment:", e);
        setToastMessage("Failed to post comment.");
    }
  };

  const handleShareAdventure = async (adventure: HydratedAdventure) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: adventure.title,
          text: t('shareAdventureText', { authorName: adventure.author.name }),
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      setToastMessage(t('sharingNotSupported'));
    }
  };

  const handleShareProfile = async (user: User) => {
     if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.name}'s Profile`,
          text: t('shareProfileText', { name: user.name }),
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      setToastMessage(t('sharingNotSupported'));
    }
  };


  const handleToggleNotifications = () => setIsNotificationPanelOpen(p => !p);

  const handleViewProfile = (userToView: User) => {
    if (isGuest) {
        setViewingUser(userToView);
        navigateTo('userProfile');
        return;
    }
    if (!currentUser) return;
    if (userToView.id === currentUser.id) handleSetActiveScreen('profile');
    else {
      setViewingUser(userToView);
      navigateTo('userProfile');
    }
  };

  const handleToggleCompleted = async (adventureId: string) => {
    if (!currentUser) { showGuestToast(); return; }

    const adventure = adventures.find(p => p.id === adventureId);
    if (!adventure) return;

    const endDate = adventure.endDate ? new Date(adventure.endDate) : new Date(adventure.startDate);
    if (endDate > new Date()) {
        setToastMessage(t('adventureNotEnded'));
        return;
    }

    if ((currentUser.activityLog || []).some(log => log.adventureId === adventureId)) {
        setToastMessage(t('alreadyMarkedDone'));
        return;
    }

    try {
        const userRef = doc(db, "users", currentUser.id);
        await updateDoc(userRef, {
            activityLog: arrayUnion({ adventureId: adventureId, status: ActivityStatus.Pending })
        });

        const notificationsRef = collection(db, "notifications");
        await addDoc(notificationsRef, {
            type: NotificationType.AttendanceRequest,
            recipientId: adventure.authorId,
            userId: currentUser.id,
            adventureId: adventure.id,
            attendeeId: currentUser.id,
            attendeeName: currentUser.name,
            text: t('attendanceRequestNotification', { title: adventure.title }),
            createdAt: serverTimestamp(),
            read: false,
        });

        setToastMessage(t('confirmationRequested'));
    } catch (e) {
        console.error("Error toggling completed status:", e);
        setToastMessage("Failed to mark as completed.");
    }
  };

  const handleConfirmAttendance = async (notificationId: string, adventureId: string, attendeeId: string, didAttend: boolean) => {
      if (!currentUser) return;

      const attendeeRef = doc(db, "users", attendeeId);
      const notificationRef = doc(db, "notifications", notificationId);
      const adventure = adventures.find(p => p.id === adventureId);
      if (!adventure) return;

      try {
          const attendeeDoc = await getDoc(attendeeRef);
          if (!attendeeDoc.exists()) return;

          const attendeeData = attendeeDoc.data() as User;
          let newActivityLog = (attendeeData.activityLog || []).filter(log => log.adventureId !== adventureId);

          if (didAttend) {
              newActivityLog.push({ adventureId, status: ActivityStatus.Confirmed });
              await addDoc(collection(db, "notifications"), {
                  type: NotificationType.AttendanceConfirmed,
                  recipientId: attendeeId,
                  userId: currentUser.id,
                  adventureId: adventureId,
                  text: t('attendanceConfirmedNotification', { title: adventure.title }),
                  createdAt: serverTimestamp(),
                  read: false,
              });
              await addDoc(collection(db, "notifications"), {
                  type: NotificationType.RateExperience,
                  recipientId: attendeeId,
                  userId: currentUser.id,
                  adventureId: adventureId,
                  text: t('rateExperienceNotification', { title: adventure.title }),
                  createdAt: serverTimestamp(),
                  read: false,
              });
          }
          await updateDoc(attendeeRef, { activityLog: newActivityLog });
          await deleteDoc(notificationRef);
      } catch (e) {
          console.error("Error confirming attendance:", e);
          setToastMessage("Failed to confirm attendance.");
      }
  };
  
  const handleSubmitRating = async (adventureId: string, rating: number) => {
    const adventure = hydratedAdventures.find(p => p.id === adventureId);
    if (!adventure || !currentUser) return;
    const authorRef = doc(db, "users", adventure.authorId);
    try {
        await runTransaction(db, async (transaction) => {
            const authorDoc = await transaction.get(authorRef);
            if (!authorDoc.exists()) throw "Author document not found!";

            const authorData = authorDoc.data() as User;
            const currentTotalRatings = authorData.totalRatings || 0;
            const currentAverageRating = authorData.averageRating || 0;
            const newTotalRatings = currentTotalRatings + 1;
            const newAverageRating = ((currentAverageRating * currentTotalRatings) + rating) / newTotalRatings;
            
            transaction.update(authorRef, {
                totalRatings: newTotalRatings,
                averageRating: newAverageRating
            });
        });
        
        const q = query(collection(db, "notifications"), 
            where("type", "==", NotificationType.RateExperience),
            where("adventureId", "==", adventureId),
            where("recipientId", "==", currentUser.id)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(doc(db, "notifications", docSnapshot.id));
        });

        setRatingModalAdventure(null);
        setToastMessage(t('feedbackThanks'));
    } catch (e) {
        console.error("Error submitting rating:", e);
        setToastMessage("Failed to submit rating.");
    }
  };
  
  const handleViewLocationOnMap = (adventure: HydratedAdventure) => {
    if (adventure.coordinates) {
      setMapAdventuresToShow([adventure]);
      handleSetActiveScreen('map');
    } else {
      setToastMessage(t('noCoordinatesOnMap'));
    }
  };

  const handleEditAdventure = (adventure: HydratedAdventure) => {
    setEditingAdventure(adventure);
  };
  
  const handleDeleteAdventure = async (adventureId: string) => {
    if (!currentUser) return;
    const adventureToDelete = adventures.find(p => p.id === adventureId);
    if (adventureToDelete?.authorId !== currentUser.id) {
        setToastMessage("You can only delete your own adventures.");
        return;
    }

    try {
        await deleteDoc(doc(db, 'posts', adventureId));
        setToastMessage(t('adventureDeletedSuccessfully'));
        if (selectedAdventure?.id === adventureId) {
            setSelectedAdventure(null);
        }
    } catch (e) {
        console.error("Error deleting adventure: ", e);
        setToastMessage("Failed to delete adventure.");
    }
  };
  
  const handleUpdateAdventure = async (adventureId: string, updatedData: Partial<Adventure>) => {
      try {
          const adventureRef = doc(db, 'posts', adventureId);
          await updateDoc(adventureRef, updatedData);
          setToastMessage(t('adventureUpdatedSuccessfully'));
          setEditingAdventure(null);
      } catch(e) {
          console.error("Error updating adventure: ", e);
          setToastMessage("Failed to update adventure.");
      }
  };
  
  useEffect(() => { if (!['map', 'search'].includes(activeScreen)) setMapAdventuresToShow(null); }, [activeScreen]);
  const handleSelectAdventure = (adventure: HydratedAdventure) => setSelectedAdventure(adventure);
  const handleCloseModal = () => setSelectedAdventure(null);
  const handleShowResultsOnMap = (results: Adventure[]) => { setMapAdventuresToShow(results); handleSetActiveScreen('map'); };
  const handleSelectStories = (storiesToShow: HydratedStory[]) => { if (storiesToShow.length > 0) setViewingStories(storiesToShow); };
  const handleAddStory = () => { if (isGuest) showGuestToast(); else setIsAddStoryModalOpen(true); };
  const handleOpenFollowList = (user: User, listType: 'followers' | 'following') => setFollowListModal({ isOpen: true, user, listType });
  const handleCloseFollowList = () => setFollowListModal({ isOpen: false, user: null, listType: null });
  
  const visibleAdventures = useMemo(() => {
    if (isGuest) return hydratedAdventures.filter(adventure => adventure.privacy === AdventurePrivacy.Public);
    if (!currentUser) return [];
    
    const userFollowing = currentUser.following || [];
    
    return hydratedAdventures.filter(adventure => {
      if (adventure.author.id === currentUser.id) return true;
      if (adventure.author.isPrivate && !userFollowing.includes(adventure.author.id)) return false;
      
      switch(adventure.privacy) {
        case AdventurePrivacy.Public: return true;
        case AdventurePrivacy.Followers: return userFollowing.includes(adventure.author.id);
        case AdventurePrivacy.Twins:
          if (!currentUser.birthday || !adventure.author.birthday) return false;
          return currentUser.birthday.substring(5) === adventure.author.birthday.substring(5);
        default: return false;
      }
    });
  }, [hydratedAdventures, currentUser, isGuest]);

  const renderScreen = () => {
    const userForUI = currentUser ?? guestUser;

    switch (activeScreen) {
      case 'feed':
        return <FeedScreen 
          adventures={visibleAdventures} 
          stories={hydratedStories}
          currentUser={userForUI}
          isGuest={isGuest}
          onSelectAdventure={handleSelectAdventure} onSendMessage={handleSelectConversation} onToggleInterest={handleToggleInterest}
          onSelectStories={handleSelectStories} onAddStory={handleAddStory} onNotificationClick={handleToggleNotifications}
          hasUnreadNotifications={!isGuest && hasUnreadNotifications} onNavigateToChat={() => navigateTo('chat')}
          onViewProfile={handleViewProfile} onRepostToggle={handleRepostToggle} onSaveToggle={handleSaveToggle}
          onShareAdventure={handleShareAdventure} onToggleCompleted={handleToggleCompleted}
          onViewLocationOnMap={handleViewLocationOnMap}
          onDeleteAdventure={handleDeleteAdventure}
          onEditAdventure={handleEditAdventure}
        />;
      case 'map':
        const eventAdventures = hydratedAdventures.filter(p => p.type === AdventureType.Event && p.coordinates && p.privacy === AdventurePrivacy.Public);
        return <MapScreen adventuresToShow={mapAdventuresToShow ?? eventAdventures} />;
      case 'create':
        if (isGuest || !currentUser) return null;
        return <CreateAdventureScreen onCreateAdventure={handleCreateAdventure} currentUser={currentUser} />;
      case 'search':
        return <SearchScreen adventures={hydratedAdventures} currentUser={userForUI} isGuest={isGuest} onSelectAdventure={handleSelectAdventure}
            onSendMessage={handleSelectConversation} onToggleInterest={handleToggleInterest} onNavigateToFindTwins={() => navigateTo('findTwins')}
            onViewProfile={handleViewProfile} onShowResultsOnMap={handleShowResultsOnMap} onRepostToggle={handleRepostToggle}
            onSaveToggle={handleSaveToggle} onShareAdventure={handleShareAdventure} onToggleCompleted={handleToggleCompleted}
            onViewLocationOnMap={handleViewLocationOnMap}
            onDeleteAdventure={handleDeleteAdventure}
            onEditAdventure={handleEditAdventure}
        />;
      case 'chat':
        if (isGuest || !currentUser) return null;
        return <ChatScreen conversations={hydratedConversations} onSelectConversation={handleSelectConversation} onBack={goBack} />;
      case 'profile':
        if (isGuest || !currentUser) return null;
        return <ProfileScreen user={currentUser} allAdventures={hydratedAdventures} onSelectAdventure={handleSelectAdventure} onSendMessage={handleSelectConversation}
          onToggleInterest={handleToggleInterest} onViewProfile={handleViewProfile} onRepostToggle={handleRepostToggle} onSaveToggle={handleSaveToggle}
          onShareProfile={handleShareProfile} onShareAdventure={handleShareAdventure} onToggleCompleted={handleToggleCompleted}
          onOpenFollowList={handleOpenFollowList} onNavigateToSettings={() => navigateTo('settings')}
          onViewLocationOnMap={handleViewLocationOnMap}
          onDeleteAdventure={handleDeleteAdventure}
          onEditAdventure={handleEditAdventure}
        />;
      case 'chatDetail':
        if (isGuest || !currentUser || !selectedConversationUser) return null;
        return <ChatDetailScreen participant={selectedConversationUser} currentUser={currentUser} onBack={goBack} onSendMessage={handleSendMessage} />;
      case 'findTwins':
         if (isGuest || !currentUser) return null;
        return <FindTwinsScreen allUsers={users} currentUser={currentUser} onSendMessage={handleSelectConversation} onBack={goBack} onFollowToggle={handleFollowToggle} onViewProfile={handleViewProfile} />;
      case 'userProfile':
        if(viewingUser) {
           return <UserProfileScreen user={viewingUser} currentUser={userForUI} isGuest={isGuest} allAdventures={hydratedAdventures} onBack={goBack} 
            onSelectAdventure={handleSelectAdventure} onSendMessage={handleSelectConversation} onToggleInterest={handleToggleInterest}
            onFollowToggle={handleFollowToggle} onViewProfile={handleViewProfile} onRepostToggle={handleRepostToggle}
            onSaveToggle={handleSaveToggle} onShareProfile={handleShareProfile} onShareAdventure={handleShareAdventure}
            onToggleCompleted={handleToggleCompleted} onOpenFollowList={handleOpenFollowList}
            onViewLocationOnMap={handleViewLocationOnMap}
            onDeleteAdventure={handleDeleteAdventure}
            onEditAdventure={handleEditAdventure}
           />;
        }
        return null;
      case 'settings':
        if (isGuest || !currentUser) return null;
        return <SettingsScreen onBack={goBack} onNavigate={navigateTo} onLogout={handleLogout} />;
      case 'editProfile':
        if (isGuest || !currentUser) return null;
        return <EditProfileScreen onBack={goBack} currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
      case 'privacySecurity':
        if (isGuest || !currentUser) return null;
        return <PrivacySecurityScreen onBack={goBack} currentUser={currentUser} onUpdateProfile={(data) => handleUpdateProfile(data)} />;
      case 'language':
        if (isGuest || !currentUser) return null;
        return <LanguageScreen onBack={goBack} />;
      case 'savedAdventures':
        if (isGuest || !currentUser) return null;
        return <SavedAdventuresScreen 
            onBack={goBack} 
            adventures={savedAdventures}
            currentUser={currentUser}
            onSelectAdventure={handleSelectAdventure}
            onSendMessage={handleSelectConversation}
            onToggleInterest={handleToggleInterest}
            onViewProfile={handleViewProfile}
            onRepostToggle={handleRepostToggle}
            onSaveToggle={handleSaveToggle}
            onShareAdventure={handleShareAdventure}
            onToggleCompleted={handleToggleCompleted}
            onViewLocationOnMap={handleViewLocationOnMap}
            onDeleteAdventure={handleDeleteAdventure}
            onEditAdventure={handleEditAdventure}
        />;
      default: return null;
    }
  };
  
  const showBottomNav = (currentUser || isGuest) && ['feed', 'map', 'create', 'search', 'profile'].includes(activeScreen);

  if (!authChecked) {
    return (
        <div className="h-screen w-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );
  }

  if (!currentUser && !isGuest) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} onSocialLogin={handleSocialLogin} onGuestLogin={handleGuestLogin} onForgotPassword={() => setIsForgotPasswordModalOpen(true)} />
        <ForgotPasswordModal isOpen={isForgotPasswordModalOpen} onClose={() => setIsForgotPasswordModalOpen(false)} onSubmit={handleForgotPassword} />
      </>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-neutral-950 flex font-sans text-gray-900 dark:text-gray-100">
      <SideNav activeScreen={activeScreen} setActiveScreen={handleSetActiveScreen} onNotificationClick={handleToggleNotifications}
          hasUnreadNotifications={!isGuest && hasUnreadNotifications} isGuest={isGuest} onGuestAction={showGuestToast} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
          {isGuest && <GuestHeader onLoginClick={handleReturnToAuth} />}
          <div ref={mainContentRef} className={`flex-grow overflow-y-auto w-full max-w-2xl mx-auto xl:border-l xl:border-r xl:border-gray-200 xl:dark:border-neutral-800 ${showBottomNav ? 'pb-16' : ''} xl:pb-0`}>
              {renderScreen()}
          </div>
          {showBottomNav && <BottomNav activeScreen={activeScreen} setActiveScreen={handleSetActiveScreen} isGuest={isGuest} onGuestAction={showGuestToast} />}
      </main>
      
      <AddStoryModal isOpen={isAddStoryModalOpen} onClose={() => setIsAddStoryModalOpen(false)} onStoryCreate={handleCreateStory} />
      {selectedAdventure && <AdventureDetailModal adventure={selectedAdventure} comments={hydratedComments} onAddComment={handleAddComment} currentUser={currentUser} onClose={handleCloseModal} />}
      {viewingStories && <StoryViewer stories={viewingStories} onClose={() => setViewingStories(null)} />}
      {isNotificationPanelOpen && (
          <div className="absolute top-0 right-0 z-50 w-full max-w-sm mt-2 mr-2">
              <NotificationPanel notifications={userNotifications} onClose={handleToggleNotifications} onConfirmAttendance={handleConfirmAttendance} 
                  onRateExperience={(adventureId) => setRatingModalAdventure(hydratedAdventures.find(p => p.id === adventureId) || null)} 
              />
          </div>
      )}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {ratingModalAdventure && <RatingModal adventure={ratingModalAdventure} onClose={() => setRatingModalAdventure(null)} onSubmit={handleSubmitRating} />}
      {editingAdventure && <EditAdventureModal adventure={editingAdventure} onClose={() => setEditingAdventure(null)} onUpdateAdventure={handleUpdateAdventure} />}
      {followListModal.isOpen && followListModal.user && followListModal.listType && (currentUser || isGuest) && (
          <FollowListModal title={t(followListModal.listType)} listOwner={followListModal.user} currentUser={currentUser}
              users={
                  followListModal.listType === 'followers'
                      ? users.filter(u => (followListModal.user!.followers || []).includes(u.id))
                      : users.filter(u => (followListModal.user!.following || []).includes(u.id))
              }
              listType={followListModal.listType} onClose={handleCloseFollowList} onViewProfile={(user) => { handleCloseFollowList(); handleViewProfile(user); }}
              onFollowToggle={handleFollowToggle} onRemoveFollower={handleRemoveFollower}
          />
      )}
    </div>
  );
};

export default App;
