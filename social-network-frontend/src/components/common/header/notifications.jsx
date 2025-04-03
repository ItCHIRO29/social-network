import { useState } from 'react';

function Notification({ notification, onAction }) {
  const { type, referenceId, message } = notification;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action) => {
    setIsProcessing(true);
    try {
      await onAction(referenceId, action);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getNotificationDescription = () => {
    switch (type) {
      case 'follow':
        return 'You have a new follower.';
      case 'follow_request':
        return 'Someone has sent you a follow request.';
      case 'accepted_follow':
        return 'Your follow request has been accepted.';
      case 'rejected_follow':
        return 'Your follow request has been rejected.';
      case 'group_invitation':
        return 'You have been invited to join a group.';
      case 'request_join_group':
        return 'A user has requested to join your group.';
      case 'event':
        return 'An event has been created in a group you belong to.';
      default:
        return '';
    }
  };

  const renderActionButtons = () => {
    if (type === 'follow') {
      return null;
    }

    if (type === 'follow_request' || type === 'group_invitation' || type === 'request_join_group') {
      return (
        <div>
          <button onClick={() => handleAction('accept')} disabled={isProcessing}>Accept</button>
          <button onClick={() => handleAction('refuse')} disabled={isProcessing}>Refuse</button>
        </div>
      );
    }

    if (type === 'event') {
      return (
        <div>
          <button onClick={() => handleAction('accept')} disabled={isProcessing}>RSVP</button>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <p>{message}</p>
      <p>{getNotificationDescription()}</p>
      {renderActionButtons()}
    </div>
  );
}

export function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/notifications/getNotifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAction = async (referenceId, action) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/notifications/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ referenceId }),
      });
      if (!response.ok) {
        throw new Error('Failed to perform action');
      }
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {notifications.map((notification) => (
        <Notification
          key={notification.referenceId}
          notification={notification}
          onAction={handleAction}
        />
      ))}
    </div>
  );
}
