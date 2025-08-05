import React, { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, X, Image, Trash2, Edit } from 'lucide-react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  serverTimestamp,
  where,
  updateDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

// Updated Photo interface
interface Photo {
  url: string;  // Full image URL (from Cloudinary)
  thumbnailUrl: string; // Thumbnail URL (from Cloudinary)
  name: string;
  uploadedAt: string;
  publicId: string; // Cloudinary public ID for future management/deletion
}

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  photos: Photo[];
  createdAt?: Timestamp;
}

interface PhotoPreview {
  file: File;
  url: string;
}

// Your Cloudinary configuration
const CLOUDINARY_UPLOAD_PRESET = 'activity-photos'; // Create this in your Cloudinary dashboard
const CLOUDINARY_CLOUD_NAME = 'ddka96xq8';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
// Add at the beginning of uploadToCloudinary
console.log('Uploading to Cloudinary with preset:', CLOUDINARY_UPLOAD_PRESET);
console.log('Cloudinary cloud name:', CLOUDINARY_CLOUD_NAME);
console.log('Upload URL:', CLOUDINARY_UPLOAD_URL);
const AddActivity = () => {
  // States remain the same
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showActivityForm, setShowActivityForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'id'>>({
    title: '',
    description: '',
    date: '',
    photos: []
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUploadProgress, setPhotoUploadProgress] = useState<number>(0);
  const [photoPreview, setPhotoPreview] = useState<PhotoPreview[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>([]);

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  // Fetch activities from Firestore - remains the same
  const fetchActivities = async () => {
    // Same implementation
    setIsLoading(true);
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(activitiesQuery);
      const activitiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date || doc.data().createdAt?.toDate().toISOString().split('T')[0]
      })) as Activity[];

      setActivities(activitiesList);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle viewing the full-size image - updated to use direct URLs
  const handleViewFullImage = (url: string) => {
    window.open(url, '_blank');
  };

  // Handle photo file selection - remains the same
  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);

    // Limit to a reasonable number (e.g., 5)
    const maxFiles = 5;
    const availableSlots = maxFiles - (photoFiles.length + existingPhotos.length);

    if (availableSlots <= 0) {
      alert(`You can only upload a maximum of ${maxFiles} photos. Please remove some photos first.`);
      return;
    }

    const newFiles = files.slice(0, availableSlots);

    // Add new files to existing ones
    const combinedFiles = [...photoFiles, ...newFiles];
    setPhotoFiles(combinedFiles);

    // Create preview URLs for new files
    const newPreviews = newFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    // Update preview state
    const updatedPreviews = [...photoPreview, ...newPreviews];
    setPhotoPreview(updatedPreviews);

    // Reset the input field to allow selecting the same file again
    e.target.value = '';
  };

  // Remove photo from selection - remains the same
  const removePhoto = (index: number) => {
    try {
      const updatedFiles = [...photoFiles];
      const updatedPreviews = [...photoPreview];

      // Release the object URL to avoid memory leaks
      if (updatedPreviews[index] && updatedPreviews[index].url) {
        URL.revokeObjectURL(updatedPreviews[index].url);
      }

      updatedFiles.splice(index, 1);
      updatedPreviews.splice(index, 1);

      setPhotoFiles(updatedFiles);
      setPhotoPreview(updatedPreviews);
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  // Remove existing photo when in edit mode - remains the same
  const removeExistingPhoto = (index: number) => {
    try {
      const updatedPhotos = [...existingPhotos];
      updatedPhotos.splice(index, 1);
      setExistingPhotos(updatedPhotos);
    } catch (error) {
      console.error('Error removing existing photo:', error);
    }
  };

  // NEW FUNCTION: Upload to Cloudinary
  // Updated Cloudinary upload function with folder structure
  const uploadToCloudinary = async (file: File, activityTitle: string): Promise<{ url: string, thumbnailUrl: string, publicId: string }> => {
    return new Promise((resolve, reject) => {
      console.log('Starting Cloudinary upload for file:', file.name);

      // Create a sanitized folder name from the activity title
      const folderName = activityTitle
        .toLowerCase()
        .replace(/[^\w\s]/gi, '') // Remove special characters
        .replace(/\s+/g, '-');     // Replace spaces with hyphens

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      // Add folder parameter
      formData.append('folder', `activities/${folderName}`);

      console.log('Upload URL:', CLOUDINARY_UPLOAD_URL);
      console.log('Upload preset:', CLOUDINARY_UPLOAD_PRESET);
      console.log('Upload folder:', `activities/${folderName}`);

      fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            console.error('Cloudinary server error:', response.status, response.statusText);
            return response.text().then(text => {
              throw new Error(`Cloudinary API error: ${response.status} ${text}`);
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Cloudinary response:', data);

          if (!data.secure_url) {
            console.error('Cloudinary response missing secure_url:', data);
            reject(new Error('Invalid Cloudinary response - missing secure_url'));
            return;
          }

          const fullUrl = data.secure_url;
          // For thumbnail, we'll create a transformation URL manually
          const thumbnailUrl = fullUrl.replace('/upload/', '/upload/c_fill,h_150,w_150/');

          resolve({
            url: fullUrl,
            thumbnailUrl: thumbnailUrl,
            publicId: data.public_id || ''
          });
        })
        .catch(error => {
          console.error('Error uploading to Cloudinary:', error);
          reject(error);
        });
    });
  };
  // Process all photos for an activity with Cloudinary
  // Updated processPhotos function
  const processPhotos = async (activityTitle: string): Promise<Photo[]> => {
    if (photoFiles.length === 0) return [];

    const photoData: Photo[] = [];
    let progress = 0;
    const increment = 100 / photoFiles.length;

    for (let i = 0; i < photoFiles.length; i++) {
      try {
        // Upload to Cloudinary with folder path
        const { url, thumbnailUrl, publicId } = await uploadToCloudinary(photoFiles[i], activityTitle);

        const photo: Photo = {
          name: photoFiles[i].name,
          uploadedAt: new Date().toISOString(),
          thumbnailUrl: thumbnailUrl,
          url: url,
          publicId: publicId
        };

        photoData.push(photo);

        progress += increment;
        setPhotoUploadProgress(Math.min(Math.round(progress), 100));
      } catch (error) {
        console.error('Error processing photo:', error);
      }
    }

    return photoData;
  };

  // Add new activity - updated to use new photo handling
  // Updated addActivity function
  const addActivity = async () => {
    if (!newActivity.title || !newActivity.description) {
      alert('Please fill in the title and description');
      return;
    }

    setIsLoading(true);
    try {
      // Process photos with Cloudinary, passing the activity title
      const photoData = await processPhotos(newActivity.title);

      // Add the activity document with photo data directly
      await addDoc(collection(db, 'activities'), {
        title: newActivity.title,
        description: newActivity.description,
        date: newActivity.date || new Date().toISOString().split('T')[0],
        photos: photoData, // Store complete photo data
        createdAt: serverTimestamp()
      });

      // Reset form
      setNewActivity({
        title: '',
        description: '',
        date: '',
        photos: []
      });
      setPhotoFiles([]);
      setPhotoPreview([]);
      setPhotoUploadProgress(0);
      setShowActivityForm(false);

      // Refresh activities list
      fetchActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity. Please try again: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated updateActivity function
  const updateActivity = async () => {
    if (!currentActivityId || !newActivity.title || !newActivity.description) {
      alert('Please fill in the title and description');
      return;
    }

    setIsLoading(true);
    try {
      // Process new photos with Cloudinary, passing the activity title
      const photoData = await processPhotos(newActivity.title);

      // Update the activity document
      const activityRef = doc(db, 'activities', currentActivityId);
      await updateDoc(activityRef, {
        title: newActivity.title,
        description: newActivity.description,
        date: newActivity.date || new Date().toISOString().split('T')[0],
        photos: [...existingPhotos, ...photoData], // Combine existing and new photos
        updatedAt: serverTimestamp()
      });

      // Reset form
      resetForm();

      // Refresh activities list
      fetchActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Failed to update activity. Please try again: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load activity for editing - remains mostly the same
  const loadActivityForEdit = async (activityId: string) => {
    setIsLoading(true);
    try {
      const activityDoc = await getDoc(doc(db, 'activities', activityId));

      if (!activityDoc.exists()) {
        throw new Error('Activity not found');
      }

      const activityData = activityDoc.data();

      // Set edit mode data
      setCurrentActivityId(activityId);
      setIsEditMode(true);
      setShowActivityForm(true);
      setNewActivity({
        title: activityData.title || '',
        description: activityData.description || '',
        date: activityData.date || '',
        photos: []
      });
      setExistingPhotos(activityData.photos || []);

    } catch (error) {
      console.error('Error loading activity for edit:', error);
      alert('Failed to load activity for editing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const filteredNotifications = activities.filter(activities =>
    activities.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activities.description.toLowerCase().includes(searchTerm.toLowerCase())
  );



  // Delete activity - updated to handle Cloudinary image deletion
  const deleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    setIsLoading(true);
    try {
      // Get activity to extract photo publicIds
      const activityDoc = await getDoc(doc(db, 'activities', activityId));

      if (activityDoc.exists()) {
        const activityData = activityDoc.data();
        const photos = activityData.photos || [];

        // Optional: Delete images from Cloudinary if you have a server endpoint
        // This requires a server component as Cloudinary API keys shouldn't be exposed in frontend
        // For each photo that has a publicId, you could call your server endpoint to delete

        // Example of what the server endpoint might look like:
        // photos.forEach(async (photo) => {
        //   if (photo.publicId) {
        //     await fetch('/api/delete-cloudinary-image', {
        //       method: 'POST',
        //       headers: { 'Content-Type': 'application/json' },
        //       body: JSON.stringify({ publicId: photo.publicId })
        //     });
        //   }
        // });
      }

      // Delete activity document
      await deleteDoc(doc(db, 'activities', activityId));

      // Refresh the activities list
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form function - remains the same
  const resetForm = () => {
    setNewActivity({
      title: '',
      description: '',
      date: '',
      photos: []
    });
    setPhotoFiles([]);
    setPhotoPreview([]);
    setExistingPhotos([]);
    setPhotoUploadProgress(0);
    setShowActivityForm(false);
    setIsEditMode(false);
    setCurrentActivityId(null);
  };

  // UI rendering - updated to use direct URLs
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="mb-2 sm:mb-0">Activities</span>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative w-full sm:w-auto">
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
              </div>
              <button
                onClick={() => setShowActivityForm(true)}
                className="flex items-center justify-center text-sm text-blue-500 hover:text-blue-700 bg-blue-50 py-1 px-3 rounded-md"
                disabled={showActivityForm}
              >
                <Plus className="h-4 w-4 mr-1" /> Add New
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <div className="p-4 sm:p-6">
          {showActivityForm ? (
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium">{isEditMode ? 'Update Activity' : 'Add New Activity'}</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Photos</label>

                {/* Existing photos if in edit mode */}
                {isEditMode && existingPhotos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Current Photos:</p>
                    <div className="flex flex-wrap gap-2">
                      {existingPhotos.map((photo, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={photo.thumbnailUrl}
                            alt={`Photo ${index}`}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                          <button
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            onClick={() => removeExistingPhoto(index)}
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload new photos area */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="photo-upload-files"
                  key={`files-${Date.now()}`}
                />

                <label htmlFor="photo-upload-files" className="cursor-pointer mr-2">
                  <div className="flex flex-col items-center">
                    <Image className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Choose from gallery</p>
                  </div>
                </label>

                {photoPreview.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected Photos:</p>
                    <div className="flex flex-wrap gap-2">
                      {photoPreview.map((photo, index) => (
                        <div key={`preview-${index}`} className="relative">
                          <img
                            src={photo.url}
                            alt={`Preview ${index}`}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                          <button
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            onClick={() => removePhoto(index)}
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {photoUploadProgress > 0 && photoUploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${photoUploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1">{photoUploadProgress}% uploaded</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                  disabled={isLoading}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={isEditMode ? updateActivity : addActivity}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="mt-2 text-gray-500">Loading activities...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-gray-50">
                  <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No activities found</p>
                  <button
                    onClick={() => setShowActivityForm(true)}
                    className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    type="button"
                  >
                    Add Your First Activity
                  </button>
                </div>
              ) : (
                filteredNotifications.map((activity) => (
                  <div key={activity.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <p className="font-medium text-lg mb-1 sm:mb-0">{activity.title}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                        <button
                          onClick={() => loadActivityForEdit(activity.id)}
                          className="text-blue-500 hover:text-blue-700"
                          type="button"
                          aria-label="Edit activity"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteActivity(activity.id)}
                          className="text-red-500 hover:text-red-700"
                          type="button"
                          aria-label="Delete activity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>

                    {activity.photos && activity.photos.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {activity.photos.map((photo, index) => (
                            <div key={`activity-${activity.id}-photo-${index}`} className="relative">
                              <img
                                src={photo.thumbnailUrl}
                                alt={`Activity photo ${index + 1}`}
                                className="h-24 w-24 object-cover rounded-md cursor-pointer"
                                onClick={() => handleViewFullImage(photo.url)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* View more button - show only if there are more than 5 activities */}
              {activities.length > 5 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => {/* Implement view all logic */ }}
                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    type="button"
                  >
                    View All Activities
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default AddActivity;