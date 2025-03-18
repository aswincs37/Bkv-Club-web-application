import React, { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, X, Upload, Image, Trash2, Edit } from 'lucide-react';
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
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

// Updated Photo interface
interface Photo {
  url: string;  // For the full image data (may not be stored in main document)
  thumbnailUrl: string; // For the small preview
  name: string;
  uploadedAt: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  photos: Photo[];
  createdAt?: any;
}

interface PhotoPreview {
  file: File;
  url: string;
}

const AddActivity = () => {
  // State for activities
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showActivityForm, setShowActivityForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);

  // State for new activity form
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'id'>>({
    title: '',
    description: '',
    date: '',
    photos: []
  });

  // State for photo uploads
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUploadProgress, setPhotoUploadProgress] = useState<number>(0);
  const [photoPreview, setPhotoPreview] = useState<PhotoPreview[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>([]);

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  // Fetch activities from Firestore
  const fetchActivities = async () => {
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

  // Function to handle viewing the full-size image
  const handleViewFullImage = async (activityId: string, photoIndex: number) => {
    try {
      // Query the full-size image from the activityPhotos collection
      const photoQuery = query(
        collection(db, 'activityPhotos'),
        where('activityId', '==', activityId),
        where('photoIndex', '==', photoIndex)
      );

      const photoSnapshot = await getDocs(photoQuery);

      if (!photoSnapshot.empty) {
        // Get the first matching document
        const photoDoc = photoSnapshot.docs[0];
        const photoData = photoDoc.data();

        // Open the full-size image in a new tab/window
        const fullImageUrl = photoData.fullImageData;
        window.open(fullImageUrl, '_blank');
      } else {
        console.error('Full-size image not found');
      }
    } catch (error) {
      console.error('Error fetching full-size image:', error);
    }
  };

  // Handle photo file selection
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

  // Remove photo from selection
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

  // Remove existing photo when in edit mode
  const removeExistingPhoto = (index: number) => {
    try {
      const updatedPhotos = [...existingPhotos];
      updatedPhotos.splice(index, 1);
      setExistingPhotos(updatedPhotos);
    } catch (error) {
      console.error('Error removing existing photo:', error);
    }
  };

  // Helper function to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper function to compress image before upload
  const compressImage = (file: File, maxWidth = 800): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const imgElement = document.createElement('img');
        if (e.target?.result) {
          imgElement.src = e.target.result as string;
        }

        imgElement.onload = () => {
          const canvas = document.createElement('canvas');
          let width = imgElement.width;
          let height = imgElement.height;

          // Scale down if width is greater than maxWidth
          if (width > maxWidth) {
            height = Math.floor(height * (maxWidth / width));
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(imgElement, 0, 0, width, height);

          // Convert to blob with reduced quality
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              resolve(file); // Fallback to original file if compression fails
            }
          }, 'image/jpeg', 0.7); // Adjust quality (0.7 = 70%)
        };
      };
    });
  };

  // Create a small thumbnail for preview
  const createThumbnail = async (file: File, size = 100): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const imgElement = document.createElement('img');
        imgElement.src = e.target?.result as string;

        imgElement.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = size;
          canvas.height = size;

          // Calculate dimensions to maintain aspect ratio
          const scale = Math.min(size / imgElement.width, size / imgElement.height);
          const x = (size - imgElement.width * scale) / 2;
          const y = (size - imgElement.height * scale) / 2;

          // Fill with white background
          ctx!.fillStyle = '#ffffff';
          ctx!.fillRect(0, 0, size, size);

          // Draw image centered and scaled
          ctx!.drawImage(imgElement, x, y, imgElement.width * scale, imgElement.height * scale);

          // Get data URL with reduced quality
          resolve(canvas.toDataURL('image/jpeg', 0.5));
        };
      };
    });
  };

  // Process all photos for an activity - create separate documents for each photo
  const processPhotos = async (): Promise<Photo[]> => {
    if (photoFiles.length === 0) return [];

    const photoData: Photo[] = [];
    let progress = 0;
    const increment = 100 / photoFiles.length;

    for (let i = 0; i < photoFiles.length; i++) {
      try {
        // Compress image first
        const compressedFile = await compressImage(photoFiles[i]);

        // Convert to Base64 (but we'll only store a small preview in the main document)
        const base64String = await fileToBase64(compressedFile);

        // Create photo object with smaller thumbnail preview
        const photo: Photo = {
          name: photoFiles[i].name,
          uploadedAt: new Date().toISOString(),
          // Store a data URI thumbnail instead of full image
          thumbnailUrl: await createThumbnail(compressedFile, 100), // 100px thumbnail
          url: base64String
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

  // Add new activity
  const addActivity = async () => {
    if (!newActivity.title || !newActivity.description) {
      alert('Please fill in the title and description');
      return;
    }

    setIsLoading(true);
    try {
      // Process photos
      const photoData = await processPhotos();

      // Create a Firestore-friendly version of photo data
      const firestorePhotoData = photoData.map(photo => ({
        name: photo.name,
        uploadedAt: photo.uploadedAt,
        thumbnailUrl: photo.thumbnailUrl,
      }));

      // Add the activity document with photo thumbnails
      const activityRef = await addDoc(collection(db, 'activities'), {
        title: newActivity.title,
        description: newActivity.description,
        date: newActivity.date || new Date().toISOString().split('T')[0],
        photos: firestorePhotoData, // Only store thumbnails in main document
        createdAt: serverTimestamp()
      });

      // Now store the full-size images in separate documents
      for (let i = 0; i < photoData.length; i++) {
        await addDoc(collection(db, 'activityPhotos'), {
          activityId: activityRef.id,
          photoIndex: i,
          fullImageData: photoData[i].url,
          createdAt: serverTimestamp()
        });
      }

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

  // Update existing activity
  const updateActivity = async () => {
    if (!currentActivityId || !newActivity.title || !newActivity.description) {
      alert('Please fill in the title and description');
      return;
    }

    setIsLoading(true);
    try {
      // Process new photos
      const photoData = await processPhotos();

      // Create a Firestore-friendly version of photo data
      const newPhotoData = photoData.map(photo => ({
        name: photo.name,
        uploadedAt: photo.uploadedAt,
        thumbnailUrl: photo.thumbnailUrl,
      }));

      // Update the activity document
      const activityRef = doc(db, 'activities', currentActivityId);
      await updateDoc(activityRef, {
        title: newActivity.title,
        description: newActivity.description,
        date: newActivity.date || new Date().toISOString().split('T')[0],
        photos: [...existingPhotos, ...newPhotoData], // Combine existing and new photos
        updatedAt: serverTimestamp()
      });

      // Store the full-size images for new photos in separate documents
      // First, get highest existing photo index
      const photoQuery = query(
        collection(db, 'activityPhotos'),
        where('activityId', '==', currentActivityId)
      );
      const photoSnapshot = await getDocs(photoQuery);
      let startIndex = 0;

      // Find the highest existing index
      if (!photoSnapshot.empty) {
        const indices = photoSnapshot.docs.map(doc => doc.data().photoIndex as number);
        startIndex = Math.max(...indices) + 1;
      }

      // Add new photos
      for (let i = 0; i < photoData.length; i++) {
        await addDoc(collection(db, 'activityPhotos'), {
          activityId: currentActivityId,
          photoIndex: startIndex + i,
          fullImageData: photoData[i].url,
          createdAt: serverTimestamp()
        });
      }

      // Delete removed photo documents
      if (existingPhotos.length < activities.find(a => a.id === currentActivityId)?.photos.length!) {
        // Find photos that were removed
        const currentActivity = activities.find(a => a.id === currentActivityId);
        const removedIndices: number[] = [];

        if (currentActivity) {
          currentActivity.photos.forEach((photo, idx) => {
            // If this photo isn't in existingPhotos array, it was removed
            const stillExists = existingPhotos.some(p =>
              p.name === photo.name && p.uploadedAt === photo.uploadedAt
            );

            if (!stillExists) {
              removedIndices.push(idx);
            }
          });
        }

        // Delete the corresponding documents
        for (const idx of removedIndices) {
          const deletedPhotoQuery = query(
            collection(db, 'activityPhotos'),
            where('activityId', '==', currentActivityId),
            where('photoIndex', '==', idx)
          );

          const deletedPhotoSnapshot = await getDocs(deletedPhotoQuery);

          if (!deletedPhotoSnapshot.empty) {
            await deleteDoc(deletedPhotoSnapshot.docs[0].ref);
          }
        }
      }

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

  // Load activity for editing
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

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchActivities();
      return;
    }

    setIsLoading(true);
    try {
      // Case-insensitive search is tricky in Firestore
      // This is a simplified approach - for production, consider using Firebase Extensions
      // like Search with Algolia or ElasticSearch
      const activitiesRef = collection(db, 'activities');
      const querySnapshot = await getDocs(activitiesRef);

      const searchResults = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date || doc.data().createdAt?.toDate().toISOString().split('T')[0]
        })) as Activity[];

      const filteredResults = searchResults.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setActivities(filteredResults);
    } catch (error) {
      console.error('Error searching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete activity
  const deleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    setIsLoading(true);
    try {
      // Delete activity document
      await deleteDoc(doc(db, 'activities', activityId));

      // Delete associated photo documents
      const photoQuery = query(
        collection(db, 'activityPhotos'),
        where('activityId', '==', activityId)
      );

      const photoSnapshot = await getDocs(photoQuery);

      const deletionPromises = photoSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletionPromises);

      // Refresh the activities list
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form function
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

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="mb-2 sm:mb-0">Activities</span>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="w-full px-3 py-2 pr-8 text-sm border rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Search className="h-4 w-4 text-gray-500" />
                </button>
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
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
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
{/* For selecting from files */}
<input
  type="file"
  accept="image/*"
  multiple
  onChange={handlePhotoSelect}
  className="hidden"
  id="photo-upload-files"
  key={`files-${Date.now()}`}
/>

{/* For taking photos with camera */}
{/* <input
  type="file"
  accept="image/*"
  multiple
  onChange={handlePhotoSelect}
  className="hidden"
  id="photo-upload-camera"
  capture="environment"
  key={`camera-${Date.now()}`}
/> */}

{/* Two different labels */}
<label htmlFor="photo-upload-files" className="cursor-pointer mr-2">
  <div className="flex flex-col items-center">
    <Image className="h-8 w-8 text-gray-400 mb-2" />
    <p className="text-sm text-gray-500">Choose from gallery</p>
  </div>
</label>

{/* <label htmlFor="photo-upload-camera" className="cursor-pointer">
  <div className="flex flex-col items-center">
    <Upload className="h-8 w-8 text-gray-400 mb-2" />
    <p className="text-sm text-gray-500">Take a photo</p>
  </div>
</label> */}

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
                activities.map((activity) => (
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
                                onClick={() => handleViewFullImage(activity.id, index)}
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
                    onClick={() => {/* Implement view all logic */}}
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