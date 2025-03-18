import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/lib/firebaseConfig';
import { Button } from '@mui/material';

const UpdateNotificationAlert = () => {
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Notification document ID
  const notificationId = "iZyxBa9DvQc1RdmI2JXu";

  useEffect(() => {
    const fetchNotification = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "notification", notificationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAlertMessage(docSnap.data().alert);
        } else {
          console.log("No notification found!");
          setError("No notification data found");
        }
      } catch (error) {
        console.error("Error fetching notification:", error);
        setError("Failed to load notification");
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, []);

  const handleUpdateAlert = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const docRef = doc(db, "notification", notificationId);
      await updateDoc(docRef, {
        alert: alertMessage
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error("Error updating notification:", error);
      setError("Failed to update notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">Update Alert Notification</h2>

        {/* Alert message textarea */}
        <div className="mb-4">
          <label htmlFor="alertMessage" className="block text-sm font-medium text-gray-700 mb-1">
            Alert Message
          </label>
          <textarea
            id="alertMessage"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
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
            <p>Alert notification updated successfully!</p>
          </div>
        )}

        {/* Update button */}
        <div className="flex justify-end">
          <Button
            onClick={handleUpdateAlert}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            {loading ? 'Updating...' : 'Update Alert'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateNotificationAlert;