





import React, { useState, useMemo, useEffect, useRef } from 'react';
import BottomNav from './components/BottomNav';
import FeedScreen from './components/FeedScreen';
import MapScreen from './components/MapScreen';
import CreatePostScreen from './components/CreatePostScreen';
import ChatScreen from './components/ChatScreen';
import ProfileScreen from './components/ProfileScreen';
import PostDetailModal from './components/PostDetailModal';
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
import { useTranslation } from './contexts/LanguageContext';


import { Screen, Post, PostType, User, Conversation, Story, Notification, PostPrivacy, ActivityStatus, NotificationType, PrivacySettings } from './types';
import { posts as mockPosts, currentUserData, users as mockUsers, conversations as mockConversations, stories as mockStories, notifications as mockNotifications } from './data/mockData';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>('feed');
  const [screenStack, setScreenStack] = useState<Screen[]>(['feed']);

  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [users, setUsers] = useState<User[]>(mockUsers);
  
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [viewingStories, setViewingStories] = useState<Story[] | null>(null);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [mapPostsToShow, setMapPostsToShow] = useState<Post[] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ratingModalPost, setRatingModalPost] = useState<Post | null>(null);
  const [followListModal, setFollowListModal] = useState<{
    isOpen: boolean;
    user: User | null;
    listType: 'followers' | 'following' | null;
  }>({ isOpen: false, user: null, listType: null });
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const showGuestToast = () => {
    setToastMessage(t('guestToastMessage'));
  };

  const navigateTo = (screen: Screen) => {
    if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
    }
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
      showGuestToast();
      return;
    }
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
    setScreenStack([screen]); // Reset stack for main nav
    setActiveScreen(screen);
  };
  
  const handleLogin = (email: string, pass: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) {
      setCurrentUser(user);
      setIsGuest(false);
      handleSetActiveScreen('feed');
    } else {
      alert(t('invalidCredentials'));
    }
  };
  
  const handleSignUp = (name: string, username: string, email: string, pass: string) => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert(t('emailExistsError'));
        return;
    }
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert(t('usernameExistsError'));
        return;
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        username,
        email,
        password: pass,
        avatarUrl: `https://picsum.photos/seed/${username}/200`,
        coverUrl: `https://picsum.photos/seed/${username}-cover/800/200`,
        bio: '',
        interests: [],
        followers: [],
        following: [],
        reposts: [],
        savedPosts: [],
        activityLog: [],
        isPrivate: false,
        privacySettings: {
          showFollowLists: true,
          showStats: true,
          showCompletedActivities: true,
          allowTwinSearch: true,
        },
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsGuest(false);
    handleSetActiveScreen('feed');
  };
  
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Simulate login with different users for different providers
    const userToLoginId = provider === 'google' ? 'user-1' : 'user-2'; // Alex for Google, Brenda for Facebook
    const user = users.find(u => u.id === userToLoginId);

    if (user) {
      setCurrentUser(user);
      setIsGuest(false);
      handleSetActiveScreen('feed');
    } else {
      alert(`${provider} user not found for social login simulation.`);
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setCurrentUser(null);
    handleSetActiveScreen('feed');
  };
  
  const handleReturnToAuth = () => {
    setIsGuest(false);
    setCurrentUser(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGuest(false);
    setScreenStack(['feed']);
  };

  const handleForgotPassword = (email: string) => {
    console.log(`Password reset requested for: ${email}`); // Simulate action
    setToastMessage(t('passwordResetSent'));
    setTimeout(() => {
        setIsForgotPasswordModalOpen(false);
    }, 2500); // Close modal after delay to let user see confirmation
  };
  
  const hasUnreadNotifications = notifications.some(n => !n.read);
  
  useEffect(() => {
    if (!['map', 'search'].includes(activeScreen)) {
      setMapPostsToShow(null);
    }
  }, [activeScreen]);

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };
  
  const handleToggleInterest = (postId: string) => {
    if (!currentUser || isGuest) {
        showGuestToast();
        return;
    }
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          const isInterested = p.interestedUsers.includes(currentUser.id);
          const interestedUsers = isInterested
            ? p.interestedUsers.filter(uid => uid !== currentUser.id)
            : [...p.interestedUsers, currentUser.id];
          return { ...p, interestedUsers };
        }
        return p;
      })
    );
  };
  
  const updateUserState = (userId: string, updateFn: (user: User) => User) => {
      setUsers(currentUsers => {
          const newUsers = [...currentUsers];
          const userIndex = newUsers.findIndex(u => u.id === userId);
          if (userIndex === -1) return currentUsers;

          const updatedUser = updateFn(newUsers[userIndex]);
          newUsers[userIndex] = updatedUser;
          
          if (currentUser?.id === userId) {
            setCurrentUser(updatedUser);
          }
          if (viewingUser?.id === userId) {
              setViewingUser(updatedUser);
          }
          
          if (followListModal.isOpen && followListModal.user?.id === userId) {
            setFollowListModal(prev => ({...prev, user: updatedUser}));
          }

          return newUsers;
      });
  };

  const handleUpdateProfile = (updatedData: Partial<User>) => {
    if (!currentUser || isGuest) return;
    
    updateUserState(currentUser.id, user => {
        const newPrivacySettings = updatedData.privacySettings 
            ? { ...user.privacySettings, ...updatedData.privacySettings } 
            : user.privacySettings;

        return {
            ...user,
            ...updatedData,
            privacySettings: newPrivacySettings,
        };
    });

    setToastMessage(t('settingsSaved'));
    if(activeScreen === 'editProfile') goBack(); // Go back only if we are on edit profile
  };

  const handleRepostToggle = (postId: string) => {
    if (!currentUser || isGuest) {
        showGuestToast();
        return;
    }
    updateUserState(currentUser.id, user => {
        const isReposted = user.reposts.includes(postId);
        const reposts = isReposted
            ? user.reposts.filter(id => id !== postId)
            : [...user.reposts, postId];
        return { ...user, reposts };
    });
  };

  const handleSaveToggle = (postId: string) => {
      if (!currentUser || isGuest) {
          showGuestToast();
          return;
      }
      updateUserState(currentUser.id, user => {
          const isSaved = user.savedPosts.includes(postId);
          const savedPosts = isSaved
              ? user.savedPosts.filter(id => id !== postId)
              : [...user.savedPosts, postId];
          return { ...user, savedPosts };
      });
  };

  const handleToggleCompleted = (postId: string) => {
    if (!currentUser || isGuest) {
      showGuestToast();
      return;
    }
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const activityEndDate = post.endDate ? new Date(post.endDate) : new Date(post.startDate);
    const now = new Date();
    if (now < activityEndDate) {
      setToastMessage(t('adventureNotEnded'));
      return;
    }

    updateUserState(currentUser.id, user => {
        const existingEntry = user.activityLog.find(a => a.postId === postId);
        if (existingEntry) {
           setToastMessage(t('alreadyMarkedDone'));
           return user;
        }

        const newActivityLog = [...user.activityLog, { postId, status: ActivityStatus.Pending }];
        
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: NotificationType.AttendanceRequest,
            user: currentUser,
            post: post,
            text: t('attendanceRequestNotification', { title: post.title }),
            createdAt: new Date().toISOString(),
            read: false,
            attendeeId: currentUser.id,
            attendeeName: currentUser.name,
        };
        setNotifications(prev => [newNotification, ...prev]);
        setToastMessage(t('confirmationRequested'));

        return { ...user, activityLog: newActivityLog };
    });
  };
  
  const handleConfirmAttendance = (notificationId: string, postId: string, attendeeId: string, didAttend: boolean) => {
    if (!currentUser || isGuest) return;
    if (didAttend) {
        updateUserState(attendeeId, user => {
            const newActivityLog = user.activityLog.map(a => 
                a.postId === postId ? { ...a, status: ActivityStatus.Confirmed } : a
            );
            return { ...user, activityLog: newActivityLog };
        });

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const confirmNotification: Notification = {
            id: `notif-${Date.now()}-confirm`,
            type: NotificationType.AttendanceConfirmed,
            user: currentUser,
            post: post,
            text: t('attendanceConfirmedNotification', { title: post.title }),
            createdAt: new Date().toISOString(),
            read: false,
        };

        const rateNotification: Notification = {
            id: `notif-${Date.now()}-rate`,
            type: NotificationType.RateExperience,
            user: currentUser,
            post: post,
            text: t('rateExperienceNotification', { title: post.title }),
            createdAt: new Date().toISOString(),
            read: false,
        };

        setNotifications(prev => [confirmNotification, rateNotification, ...prev]);
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };
  
  const handleSubmitRating = (postId: string, rating: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    updateUserState(post.author.id, user => {
      const currentTotalRatings = user.totalRatings ?? 0;
      const currentAverage = user.averageRating ?? 0;
      const newTotalRatings = currentTotalRatings + 1;
      const newAverageRating = ((currentAverage * currentTotalRatings) + rating) / newTotalRatings;
      return { ...user, averageRating: newAverageRating, totalRatings: newTotalRatings };
    });

    setNotifications(prev => prev.filter(n => n.post?.id !== postId || n.type !== NotificationType.RateExperience));

    setRatingModalPost(null);
    setToastMessage(t('feedbackThanks'));
  };

  const handleSendMessage = (user: User) => {
     if (!currentUser || isGuest) {
         showGuestToast();
         return;
     }
     const existingConvo = mockConversations.find(c => c.participant.id === user.id);
     if (existingConvo) {
         setSelectedConversation(existingConvo);
         navigateTo('chatDetail');
     } else {
         const newConvo = {
            id: `convo-new-${Date.now()}`,
            participant: user,
            messages: [],
            lastMessage: { id: 'm-new', senderId: currentUser.id, text: t('nowConnected'), timestamp: new Date().toISOString() },
         };
         setSelectedConversation(newConvo);
         navigateTo('chatDetail');
     }
  };
  
  const handleSelectConversation = (user: User) => {
     handleSendMessage(user);
  };

  const handleToggleNotifications = () => {
    if (isGuest) {
      showGuestToast();
      return;
    }
    setIsNotificationPanelOpen(prev => !prev);
    if (!isNotificationPanelOpen) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };
  
  const handleFollowToggle = (userIdToFollow: string) => {
    if (!currentUser || isGuest) {
        showGuestToast();
        return;
    }
    updateUserState(currentUser.id, user => {
        const isFollowing = user.following.includes(userIdToFollow);
        return {
            ...user,
            following: isFollowing
                ? user.following.filter(id => id !== userIdToFollow)
                : [...user.following, userIdToFollow],
        };
    });

    updateUserState(userIdToFollow, user => {
        const isFollowedByCurrentUser = user.followers.includes(currentUser.id);
        return {
            ...user,
            followers: isFollowedByCurrentUser
                ? user.followers.filter(id => id !== currentUser.id)
                : [...user.followers, currentUser.id],
        };
    });
  };

  const handleRemoveFollower = (followerIdToRemove: string) => {
    if (!currentUser || isGuest) return;
    updateUserState(currentUser.id, user => ({
      ...user,
      followers: user.followers.filter(id => id !== followerIdToRemove)
    }));

    updateUserState(followerIdToRemove, user => ({
      ...user,
      following: user.following.filter(id => id !== currentUser.id)
    }));

    setToastMessage(t('followerRemoved'));
  };
  
  const handleViewProfile = (userToView: User) => {
    if (isGuest) {
        setViewingUser(userToView);
        navigateTo('userProfile');
        return;
    }
    if (!currentUser) return;
    if (userToView.id === currentUser.id) {
      handleSetActiveScreen('profile');
    } else {
      setViewingUser(userToView);
      navigateTo('userProfile');
    }
  };
  
  const handleShowResultsOnMap = (results: Post[]) => {
    setMapPostsToShow(results);
    handleSetActiveScreen('map');
  };
  
  const handleSelectStories = (storiesToShow: Story[]) => {
    if (storiesToShow && storiesToShow.length > 0) {
      setViewingStories(storiesToShow);
    }
  };

  const handleAddStory = () => {
    if (!currentUser || isGuest) {
      showGuestToast();
      return;
    }
    const newStory: Story = {
      id: `story-new-${Date.now()}`,
      author: currentUser,
      media: {
        url: `https://picsum.photos/seed/newstory${Date.now()}/1080/1920`,
        type: 'image',
      },
      createdAt: new Date().toISOString(),
    };
    const updatedStories = [newStory, ...stories];
    setStories(updatedStories);
    
    const myUpdatedStories = updatedStories.filter(s => s.author.id === currentUser.id);
    setViewingStories(myUpdatedStories);
  };

  const handleSharePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !navigator.share) {
      setToastMessage(t('sharingNotSupported'));
      return;
    }
    try {
      await navigator.share({
        title: `WanderLodge: ${post.title}`,
        text: t('sharePostText', { authorName: post.author.name }),
        url: window.location.origin,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };
  
  const handleShareProfile = async (user: User) => {
    if (!navigator.share) {
      setToastMessage(t('sharingNotSupported'));
      return;
    }
    try {
      await navigator.share({
        title: `WanderLodge: ${user.name}'s Profile`,
        text: t('shareProfileText', { name: user.name }),
        url: window.location.origin,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };
  
  const handleOpenFollowList = (user: User, listType: 'followers' | 'following') => {
    setFollowListModal({ isOpen: true, user, listType });
  };

  const handleCloseFollowList = () => {
    setFollowListModal({ isOpen: false, user: null, listType: null });
  };

  const handleCreatePost = (newPostData: Omit<Post, 'id' | 'author' | 'interestedUsers' | 'comments' | 'createdAt'>) => {
    if (!currentUser || isGuest) {
        showGuestToast();
        return;
    }
    const newPost: Post = {
      ...newPostData,
      id: `post-new-${Date.now()}`,
      author: currentUser,
      interestedUsers: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
    handleSetActiveScreen('feed');
    setToastMessage(t('postPublished'));
  };


  const visiblePosts = useMemo(() => {
    // In guest mode, only show public posts
    if (isGuest) {
      return posts.filter(post => post.privacy === PostPrivacy.Public);
    }
    if (!currentUser) return [];
    
    // For logged-in users, apply privacy rules
    return posts.filter(post => {
      const postAuthor = users.find(u => u.id === post.author.id);
      if (!postAuthor) return false;

      // You can always see your own posts
      if (post.author.id === currentUser.id) return true;
      // If the author's account is private, you must be a follower
      if (postAuthor.isPrivate && !postAuthor.followers.includes(currentUser.id)) return false;
      
      switch(post.privacy) {
        case PostPrivacy.Public:
          return true;
        case PostPrivacy.Followers:
          return postAuthor.followers.includes(currentUser.id);
        case PostPrivacy.Twins:
          if (!currentUser.birthday || !post.author.birthday) return false;
          return currentUser.birthday.substring(5) === post.author.birthday.substring(5);
        default:
          return false;
      }
    });
  }, [posts, users, currentUser, isGuest]);

  const renderScreen = () => {
    // If guest, currentUser is null, but we need a dummy for some components
    const userForUI = currentUser ?? { id: 'guest', name: 'Guest', followers: [], following: [], reposts: [], savedPosts: [], activityLog: [], privacySettings: {} } as any;

    switch (activeScreen) {
      case 'feed':
        return <FeedScreen 
          posts={visiblePosts} 
          stories={stories}
          currentUser={userForUI}
          isGuest={isGuest}
          onSelectPost={handleSelectPost}
          onSendMessage={handleSendMessage}
          onToggleInterest={handleToggleInterest}
          onSelectStories={handleSelectStories}
          onAddStory={handleAddStory}
          onNotificationClick={handleToggleNotifications}
          hasUnreadNotifications={!isGuest && hasUnreadNotifications}
          onNavigateToChat={() => navigateTo('chat')}
          onViewProfile={handleViewProfile}
          onRepostToggle={handleRepostToggle}
          onSaveToggle={handleSaveToggle}
          onSharePost={handleSharePost}
          onToggleCompleted={handleToggleCompleted}
        />;
      case 'map':
        const eventPosts = posts.filter(p => p.type === PostType.Event && p.coordinates && p.privacy === PostPrivacy.Public);
        return <MapScreen postsToShow={mapPostsToShow ?? eventPosts} />;
      case 'create':
        if (isGuest || !currentUser) return null;
        return <CreatePostScreen onCreatePost={handleCreatePost} />;
      case 'search':
        return <SearchScreen 
            posts={posts} 
            currentUser={userForUI} 
            isGuest={isGuest}
            onSelectPost={handleSelectPost}
            onSendMessage={handleSendMessage}
            onToggleInterest={handleToggleInterest}
            onNavigateToFindTwins={() => navigateTo('findTwins')}
            onViewProfile={handleViewProfile}
            onShowResultsOnMap={handleShowResultsOnMap}
            onRepostToggle={handleRepostToggle}
            onSaveToggle={handleSaveToggle}
            onSharePost={handleSharePost}
            onToggleCompleted={handleToggleCompleted}
        />;
      case 'chat':
        if (isGuest || !currentUser) return null;
        return <ChatScreen conversations={mockConversations} onSelectConversation={handleSelectConversation} onBack={goBack} />;
      case 'profile':
        if (isGuest || !currentUser) return null;
        return <ProfileScreen 
          user={currentUser} 
          allPosts={posts}
          onSelectPost={handleSelectPost}
          onSendMessage={handleSendMessage}
          onToggleInterest={handleToggleInterest}
          onViewProfile={handleViewProfile}
          onRepostToggle={handleRepostToggle}
          onSaveToggle={handleSaveToggle}
          onShareProfile={handleShareProfile}
          onSharePost={handleSharePost}
          onToggleCompleted={handleToggleCompleted}
          onOpenFollowList={handleOpenFollowList}
          onNavigateToSettings={() => navigateTo('settings')}
        />;
      case 'chatDetail':
        if (isGuest || !currentUser || !selectedConversation) return null;
        return <ChatDetailScreen conversation={selectedConversation} currentUser={currentUser} onBack={goBack} />;
        
      case 'findTwins':
         if (isGuest || !currentUser) return null;
        return <FindTwinsScreen 
            allUsers={users} 
            currentUser={currentUser} 
            onSendMessage={handleSendMessage} 
            onBack={goBack} 
            onFollowToggle={handleFollowToggle}
            onViewProfile={handleViewProfile}
        />;
      case 'userProfile':
        if(viewingUser) {
           return <UserProfileScreen 
            user={viewingUser} 
            currentUser={userForUI}
            isGuest={isGuest}
            allPosts={posts}
            onBack={goBack} 
            onSelectPost={handleSelectPost}
            onSendMessage={handleSendMessage}
            onToggleInterest={handleToggleInterest}
            onFollowToggle={handleFollowToggle}
            onViewProfile={handleViewProfile}
            onRepostToggle={handleRepostToggle}
            onSaveToggle={handleSaveToggle}
            onShareProfile={handleShareProfile}
            onSharePost={handleSharePost}
            onToggleCompleted={handleToggleCompleted}
            onOpenFollowList={handleOpenFollowList}
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
        return <PrivacySecurityScreen onBack={goBack} currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
      case 'language':
        if (isGuest || !currentUser) return null;
        return <LanguageScreen onBack={goBack} />;
      default:
        return null;
    }
  };
  
  const showBottomNav = (currentUser || isGuest) && ['feed', 'map', 'create', 'search', 'profile'].includes(activeScreen);

  if (!currentUser && !isGuest) {
    return (
      <>
        <AuthScreen 
          onLogin={handleLogin} 
          onSignUp={handleSignUp} 
          onSocialLogin={handleSocialLogin} 
          onGuestLogin={handleGuestLogin}
          onForgotPassword={() => setIsForgotPasswordModalOpen(true)}
        />
        <ForgotPasswordModal 
          isOpen={isForgotPasswordModalOpen}
          onClose={() => setIsForgotPasswordModalOpen(false)}
          onSubmit={handleForgotPassword}
        />
      </>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-neutral-950 flex font-sans text-gray-900 dark:text-gray-100">
      <SideNav 
          activeScreen={activeScreen} 
          setActiveScreen={handleSetActiveScreen} 
          onNotificationClick={handleToggleNotifications}
          hasUnreadNotifications={!isGuest && hasUnreadNotifications}
          isGuest={isGuest}
          onGuestAction={showGuestToast}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
          {isGuest && <GuestHeader onLoginClick={handleReturnToAuth} />}
          <div ref={mainContentRef} className={`flex-grow overflow-y-auto w-full max-w-2xl mx-auto xl:border-l xl:border-r xl:border-gray-200 xl:dark:border-neutral-800 ${showBottomNav ? 'pb-16' : ''} xl:pb-0`}>
              {renderScreen()}
          </div>

          {showBottomNav && <BottomNav activeScreen={activeScreen} setActiveScreen={handleSetActiveScreen} isGuest={isGuest} onGuestAction={showGuestToast} />}
      </main>
      
      {selectedPost && <PostDetailModal post={selectedPost} onClose={handleCloseModal} />}
      {viewingStories && <StoryViewer stories={viewingStories} onClose={() => setViewingStories(null)} />}
      {isNotificationPanelOpen && (
          <div className="absolute top-0 right-0 z-50 w-full max-w-sm mt-2 mr-2">
              <NotificationPanel 
                  notifications={notifications} 
                  onClose={handleToggleNotifications} 
                  onConfirmAttendance={handleConfirmAttendance} 
                  onRateExperience={(postId) => setRatingModalPost(posts.find(p => p.id === postId) || null)} 
              />
          </div>
      )}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {ratingModalPost && <RatingModal post={ratingModalPost} onClose={() => setRatingModalPost(null)} onSubmit={handleSubmitRating} />}
      {followListModal.isOpen && followListModal.user && followListModal.listType && (currentUser || isGuest) && (
          <FollowListModal
              title={t(followListModal.listType)}
              listOwner={followListModal.user}
              currentUser={currentUser}
              users={
                  followListModal.listType === 'followers'
                      ? users.filter(u => followListModal.user!.followers.includes(u.id))
                      : users.filter(u => followListModal.user!.following.includes(u.id))
              }
              listType={followListModal.listType}
              onClose={handleCloseFollowList}
              onViewProfile={(user) => {
                  handleCloseFollowList();
                  handleViewProfile(user);
              }}
              onFollowToggle={handleFollowToggle}
              onRemoveFollower={handleRemoveFollower}
          />
      )}
    </div>
  );
};

export default App;