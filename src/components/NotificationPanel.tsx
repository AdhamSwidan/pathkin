// في NotificationPanel component
{notification.type === 'completion_pending' && (
  <button 
    onClick={() => onApproveCompletion(notification.postId, notification.senderId)}
    className="bg-green-500 text-white px-3 py-1 rounded text-sm"
  >
    Approve
  </button>
)}
