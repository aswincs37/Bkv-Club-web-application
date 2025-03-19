import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, IconButton, Stack, TextField, CircularProgress } from '@mui/material';
import { Check, X, FileText, Ban, XCircle, ZoomIn, ZoomOut, Save } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Image from 'next/image';
import { Member } from '../AdminHomePage/AdminHomePage';


interface MemberDetailsDialogProps {
  member: Member | null;
  open: boolean;
  onClose: () => void;
  onStatusUpdate: (memberId: string, newStatus: 'accepted' | 'rejected' | 'banned') => Promise<void>;
  onGeneratePDF: (member: Member) => void;
}

const MemberDetailsDialog: React.FC<MemberDetailsDialogProps> = ({
  member,
  open,
  onClose,
  onStatusUpdate,
  onGeneratePDF,
}) => {
  // State for image zoom modal
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(1);

  // States for message and loading
  const [showMessageField, setShowMessageField] = useState(false);
  const [decision, setDecision] = useState<'accepted' | 'rejected' | 'banned' | null>(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!member) return null;

  // Helper function to determine if a string is a base64 image
  const isBase64Image = (str: string | undefined) => {
    return str?.startsWith('data:image');
  };

  // Function to open the zoom modal
  const handleOpenZoomModal = (imageUrl: string | undefined, type: string) => {
    if (!imageUrl) return;
    setCurrentImage(imageUrl);
    setImageType(type);
    setZoomLevel(1); // Reset zoom level
    setZoomModalOpen(true);
  };

  // Function to close the zoom modal
  const handleCloseZoomModal = () => {
    setZoomModalOpen(false);
    setCurrentImage(null);
    setZoomLevel(1);
  };

  // Function to increase zoom
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Max zoom 3x
  };

  // Function to decrease zoom
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5)); // Min zoom 0.5x
  };

  // Function to handle status update button clicks
  const handleStatusButtonClick = (status: 'accepted' | 'rejected' | 'banned') => {
    setDecision(status);
    setShowMessageField(true);
  };

  // Save message to Firebase and update status
  const handleSaveMessage = async () => {
    if (!member || !decision) return;

    setIsSaving(true);

    try {
      const memberRef = doc(db, 'members', member.id);
      await updateDoc(memberRef, {
        status: decision,
        message: message.trim() || '',  // Save message field
      });

      // Call the onStatusUpdate function to reflect the new status
      await onStatusUpdate(member.id, decision);

      setShowMessageField(false);
      setMessage('');
      setDecision(null);
    } catch (error) {
      console.error('Error updating Firestore:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Function to cancel the message entry
  const handleCancelMessage = () => {
    setShowMessageField(false);
    setMessage('');
    setDecision(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent className="max-w-full max-h-[90vh] overflow-y-auto p-6 relative">
          {/* Close button */}
          <IconButton
            onClick={onClose}
            className="absolute top-2 right-2"
            size="small"
          >
            <XCircle className="h-6 w-6 text-gray-500 hover:text-gray-700" />
          </IconButton>

          <DialogTitle className="text-2xl font-bold mb-4 text-center border-b pb-2">
            Member Details - {member.fullName}
          </DialogTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* Profile Photo and ID Photo Section */}
            <div className="md:col-span-1 flex flex-col space-y-4 items-center">
              <div className="border rounded-lg p-4 w-full">
                <h3 className="font-semibold text-lg mb-2 text-center">Profile Photo</h3>
                <div className="flex justify-center">
                  {(member.profilePhoto || member.photoUrl) ? (
                    <div
                      className="relative w-48 h-48 cursor-pointer"
                      onClick={() => handleOpenZoomModal(member.profilePhoto || member.photoUrl, 'Profile Photo')}
                    >
                      {isBase64Image(member.profilePhoto || member.photoUrl) ? (
                        // Handle base64 image
                        <img
                          src={member.profilePhoto || member.photoUrl}
                          alt="Profile Photo"
                          className="rounded-lg object-cover w-full h-full hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        // Handle URL image
                        <Image
                          src={member.profilePhoto || member.photoUrl || ''}
                          alt="Profile Photo"
                          fill
                          className="rounded-lg object-cover hover:opacity-90 transition-opacity"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-50 rounded-full p-2">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No photo available</span>
                    </div>
                  )}
                </div>
              </div>

             {/* Signature Section */}
             <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-2 border rounded-lg p-4 w-full">
                  <h3 className="font-semibold text-lg mb-2">Signature</h3>
                  <div className="flex justify-center">
                  {(member.signaturePhoto || member.signatureUrl) ? (
                      <div
                        className="relative w-48 h-24 cursor-pointer"
                        onClick={() => handleOpenZoomModal(member.signaturePhoto || member.signatureUrl, 'Signature')}
                      >
                        {isBase64Image(member.signaturePhoto || member.signatureUrl) ? (
                        // Handle base64 image
                        <img
                          src={member.signaturePhoto || member.signatureUrl}
                          alt="Signature"
                          className="rounded-lg object-contain w-full h-full hover:opacity-90 transition-opacity"
                        />
                        ) : (
                          // Handle URL image
                          <Image
                            src={member.signaturePhoto || member.signatureUrl || ''}
                            alt="Signature"
                            fill
                            className="rounded-lg object-contain hover:opacity-90 transition-opacity"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="bg-black bg-opacity-50 rounded-full p-2">
                            <ZoomIn className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-48 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No signature available</span>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            {/* Personal Details Section */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-2">
                  <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Full Name:</span> {member.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Member ID:</span> {member.memberId}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {member.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {member.phoneNumber}
                    </div>
                    <div>
                      <span className="font-medium">Age:</span> {member.age}
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span> {member.gender}
                    </div>
                    <div>
                      <span className="font-medium">Blood Group:</span> {member.bloodGroup}
                    </div>
                    <div>
                      <span className="font-medium">Father Name:</span> {member.fatherName}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-2">
                  <h3 className="font-semibold text-lg mb-2">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Education:</span> {member.education}
                    </div>
                    <div>
                      <span className="font-medium">Job:</span> {member.job}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span> {member.address}
                    </div>
                    <div>
                      <span className="font-medium">Hobbies:</span> {member.hobbies}
                    </div>
                    <div>
                      <span className="font-medium">Nominee:</span> {member.nomineeName}
                    </div>
                    <div>
                      <span className="font-medium">Club Member:</span> {member.isClubMember}
                    </div>
                    <div>
                      <span className="font-medium">Criminal Case:</span> {member.hasCriminalCase}
                    </div>
                    <div>
                      <span className="font-medium">Application Date:</span> {member.date || 'Not available'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status Section */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Current Status</h3>
            <div className="flex items-center justify-center">
              <div className={`px-4 py-2 rounded-full text-white font-medium ${
                member.status === 'accepted' ? 'bg-green-500' :
                member.status === 'pending' ? 'bg-yellow-500' :
                member.status === 'banned' ? 'bg-purple-500' :
                'bg-red-500'
              }`}>
                {member.status === 'banned' ? 'Registration Banned' : member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </div>
            </div>
          </div>

          {/* Message field when decision is made */}
          {showMessageField && (
            <div className="mt-6 bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-lg mb-2">
                Leave a message for this {decision === 'accepted' ? 'acceptance' :
                                          decision === 'rejected' ? 'rejection' : 'cancellation'}
              </h3>
              <TextField
                fullWidth
                label="Enter message (Optional)"
                multiline
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
                className="mb-4"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outlined"
                  onClick={handleCancelMessage}
                  className="border-gray-300 text-gray-700"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveMessage}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                >
                  {isSaving ? 'Saving...' : 'Save and Update Status'}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons - Only show when not in message mode */}
          {!showMessageField && (
            <Stack spacing={2} direction={'row'} justifyContent={'center'} className="mt-6">
              {/* Show Accept button only if status is pending or rejected */}
              {(member.status === 'pending' || member.status === 'rejected') && (
                <Button
                  variant="contained"
                  onClick={() => handleStatusButtonClick('accepted')}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  startIcon={<Check className="h-4 w-4" />}
                >
                  Accept Member
                </Button>
              )}

              {/* Show Reject button only if status is pending or accepted */}
              {(member.status === 'pending' || member.status === 'accepted') && (
                <Button
                  variant="contained"
                  onClick={() => handleStatusButtonClick('rejected')}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  startIcon={<X className="h-4 w-4" />}
                >
                  Reject Member
                </Button>
              )}

              {/* Show Cancel Registration button only if status is accepted */}
              {member.status === 'accepted' && (
                <Button
                  variant="contained"
                  onClick={() => handleStatusButtonClick('banned')}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                  startIcon={<Ban className="h-4 w-4" />}
                >
                  Cancel Registration
                </Button>
              )}

              {/* Show PDF button in all cases */}
              <Button
                variant="outlined"
                onClick={() => onGeneratePDF(member)}
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
                startIcon={<FileText className="h-4 w-4" />}
              >
                Generate PDF
              </Button>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Zoom Modal */}
      <Dialog
        open={zoomModalOpen}
        onClose={handleCloseZoomModal}
        maxWidth="md"
        fullWidth
      >
        <DialogContent className="p-0 relative bg-gray-900">
          {/* Close button */}
          <IconButton
            onClick={handleCloseZoomModal}
            className="absolute top-2 right-2 z-10"
            size="small"
          >
            <XCircle className="h-6 w-6 text-white" />
          </IconButton>

          <div className="flex flex-col items-center p-4">
            <h3 className="text-xl font-semibold text-white mb-4">{imageType}</h3>

            {/* Image container with zoom level */}
            <div className="overflow-auto w-full flex justify-center items-center h-[60vh]">
              {currentImage && (
                <div style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}>
                  {isBase64Image(currentImage) ? (
                    <img
                      src={currentImage}
                      alt={imageType}
                      className="max-w-full object-contain"
                    />
                  ) : (
                    <img
                      src={currentImage}
                      alt={imageType}
                      className="max-w-full object-contain"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Zoom controls */}
            <div className="flex items-center justify-center mt-4 bg-gray-800 rounded-full p-2">
              <IconButton onClick={zoomOut} disabled={zoomLevel <= 0.5} className="text-white">
                <ZoomOut className="h-6 w-6" />
              </IconButton>
              <span className="mx-3 text-white">{Math.round(zoomLevel * 100)}%</span>
              <IconButton onClick={zoomIn} disabled={zoomLevel >= 3} className="text-white">
                <ZoomIn className="h-6 w-6" />
              </IconButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MemberDetailsDialog;