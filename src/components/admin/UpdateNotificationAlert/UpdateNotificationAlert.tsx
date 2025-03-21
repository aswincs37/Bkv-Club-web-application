import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebaseConfig';
import { Button } from '@mui/material';

// Define notification interface
interface Notification {
  id: string;
  title: string;
  alert: string;
  createdAt: string;
  updatedAt?: string;
}

const UpdateNotificationAlert: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentNotificationId, setCurrentNotificationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNotificationForm, setShowNotificationForm] = useState<boolean>(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (): Promise<void> => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "notification"));
      const notificationsData: Notification[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Notification, 'id'>)
      }));
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate inputs
      if (!alertTitle.trim() || !alertMessage.trim()) {
        setError("Title and message are required");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "notification"), {
        title: alertTitle,
        alert: alertMessage,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setAlertTitle('');
      setAlertMessage('');
      fetchNotifications();
      setTimeout(() => {
        setSuccess(false);
        setShowNotificationForm(false); // Hide form after successful creation
      }, 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error("Error creating notification:", error);
      setError("Failed to create notification");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlert = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate inputs
      if (!alertTitle.trim() || !alertMessage.trim()) {
        setError("Title and message are required");
        setLoading(false);
        return;
      }

      if (currentNotificationId) {
        const docRef = doc(db, "notification", currentNotificationId);
        await updateDoc(docRef, {
          title: alertTitle,
          alert: alertMessage,
          updatedAt: new Date().toISOString()
        });

        setSuccess(true);
        setAlertTitle('');
        setAlertMessage('');
        setEditMode(false);
        setCurrentNotificationId(null);
        fetchNotifications();
        setTimeout(() => {
          setSuccess(false);
          setShowNotificationForm(false); // Hide form after successful update
        }, 3000); // Hide success message after 3 seconds
      }
    } catch (error) {
      console.error("Error updating notification:", error);
      setError("Failed to update notification");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteDoc(doc(db, "notification", id));
      fetchNotifications();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting notification:", error);
      setError("Failed to delete notification");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAlert = (notification: Notification): void => {
    setAlertTitle(notification.title);
    setAlertMessage(notification.alert);
    setCurrentNotificationId(notification.id);
    setEditMode(true);
    setShowNotificationForm(true); // Show form when editing
  };

  const handleCancelEdit = (): void => {
    setAlertTitle('');
    setAlertMessage('');
    setCurrentNotificationId(null);
    setEditMode(false);
    setShowNotificationForm(false); // Hide form when canceling
  };

  const toggleNotificationForm = (): void => {
    // If we're not in edit mode, toggle the form visibility
    if (!editMode) {
      setShowNotificationForm(!showNotificationForm);
      // Reset form fields when showing the form
      if (!showNotificationForm) {
        setAlertTitle('');
        setAlertMessage('');
      }
    }
  };

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.alert.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Alert Notifications</h2>

            <div className="flex space-x-2">
              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <svg
                  className="absolute left-2 top-2.5 h-4 w-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Add New Notification Button */}
              <Button
                onClick={toggleNotificationForm}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
                aria-label="Add new notification"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* Notification Form - conditionally rendered */}
          {showNotificationForm && (
            <div className="mb-8 p-4 border rounded-md bg-gray-50">
              <h3 className="text-xl font-bold mb-4">
                {editMode ? 'Edit Alert Notification' : 'Create Alert Notification'}
              </h3>

              {/* Title input */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter alert title"
                  disabled={loading}
                />
              </div>

              {/* Alert message textarea */}
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter alert notification message"
                  disabled={loading}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                  <p>{error}</p>
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700">
                  <p>{editMode ? 'Alert notification updated successfully!' : 'Alert notification created successfully!'}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editMode ? handleUpdateAlert : handleCreateAlert}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {loading ? 'Processing...' : editMode ? 'Update Alert' : 'Create Alert'}
                </Button>
              </div>
            </div>
          )}

          {/* List of notifications */}
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications found.</p>
          ) : filteredNotifications.length === 0 ? (
            <p className="text-gray-500">No notifications match your search.</p>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="p-4 border rounded-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{notification.title}</h3>
                      <p className="text-gray-700 mt-1">{notification.alert}</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Created: {new Date(notification.createdAt).toLocaleString()}
                        {notification.updatedAt && (
                          <span> | Updated: {new Date(notification.updatedAt).toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAlert(notification)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={loading}
                        aria-label={`Edit ${notification.title}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(notification.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loading}
                        aria-label={`Delete ${notification.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateNotificationAlert;