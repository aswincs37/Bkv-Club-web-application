"use client"
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Clock, Eye, Search, XCircle } from 'lucide-react';
import { Button } from '@mui/material';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from "next/navigation";
import UpdateNotificationAlert from '../UpdateNotificationAlert/UpdateNotificationAlert';
import AddActivity from '../AddActivity/AddActivity';
import MemberDetailsDialog from '@/components/admin/MemberDetailsDialogue/MemberDetailsDialogue';
import StatusNotification from '../StatusNotification/StatusNotification';


// Enhanced Member interface to match your Firestore structure
interface Member {
  id: string;
  fullName: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'banned';
  date?: string;
  phoneNumber: string;
  address: string;
  age: string;
  bloodGroup: string;
  fatherName: string;
  gender: string;
  hasCriminalCase: string;
  hobbies: string;
  isClubMember: string;
  job: string;
  memberId: string;
  nomineeName: string;
  education: string;
  createdBy: string;
  profilePhoto?: string;
  idPhoto?: string;
  signature?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  // State for members data
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // State for member details dialog
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  // State for status notification
  const [statusNotification, setStatusNotification] = useState({
    open: false,
    status: null as 'accepted' | 'rejected' | 'banned' | null,
    memberName: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/"); // Redirect to home if not authenticated
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [router]);

  // Add this filtering logic
  const filteredMembers = useMemo(() => {
    // First filter by search query
    let result = members.filter(member =>
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then filter by active tab
    if (activeTab !== 'all') {
      result = result.filter(member => member.status === activeTab);
    }

    return result;
  }, [members, searchQuery, activeTab]);

  // Fetch members data from Firestore
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersCollection = collection(db, 'members');
        const membersSnapshot = await getDocs(membersCollection);

        const membersData = membersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure status exists, default to 'pending' if not present
          status: doc.data().status || 'pending'
        } as Member));

        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Member count by status
  const acceptedCount = members.filter(m => m.status === 'accepted').length;
  const pendingCount = members.filter(m => m.status === 'pending').length;
  const rejectedCount = members.filter(m => m.status === 'rejected').length;
  const bannedCount = members.filter(m => m.status === 'banned').length;

  // Handle member status update
  const updateMemberStatus = async (memberId: string, newStatus: 'accepted' | 'rejected' | 'banned') => {
    try {
      const memberRef = doc(db, 'members', memberId);
      await updateDoc(memberRef, {
        status: newStatus
      });

      // Find the member who was updated
      const updatedMember = members.find(member => member.id === memberId);

      // Update local state after successful Firestore update
      setMembers(members.map(member =>
        member.id === memberId ? { ...member, status: newStatus } : member
      ));

      // Show notification
      if (updatedMember) {
        setStatusNotification({
          open: true,
          status: newStatus,
          memberName: updatedMember.fullName
        });
      }

      // Update selected member if the dialog is open
      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember({ ...selectedMember, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating member status:", error);
    }
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setStatusNotification({
      open: false,
      status: null,
      memberName: ''
    });

    // Close the details dialog if open
    if (detailsOpen) {
      setDetailsOpen(false);
    }
  };


  // Generate PDF for member (placeholder function)
  const generatePDF = (member: Member) => {
    console.log("Generating PDF for member:", member.fullName);
    // Implement PDF generation logic here
    alert(`PDF generated for ${member.fullName}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Navigate to the home page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Open member details dialog
  const openMemberDetails = (member: Member) => {
    setSelectedMember(member);
    setDetailsOpen(true);
  };


  return (
    <>
      <StatusNotification
        open={statusNotification.open}
        status={statusNotification.status}
        memberName={statusNotification.memberName}
        onClose={handleNotificationClose}
      />
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center relative">

            {/* Left Section - Logo */}
            <div className="flex items-center space-x-2">
              <img
                src="/logo.png"  // Replace with your logo path
                alt="BKV Logo"
                className="h-15 w-12"
              />
             <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800">
  BHAGATH SINGH KALAVEDHÍ VAZHAKKAD (BKV)
</h1>

            </div>

            {/* Center Section - Mobile and Desktop Compatible */}
            <h1 className="text-xl pr-2 sm:pr-0 md:text-2xl md:text-center lg:text-2xl lg:pr-100 font-extrabold text-blue-700">
              Admin Dashboard
            </h1>


            {/* Right Section - Notifications and Logout */}
            <div className="flex items-center space-x-4">
              {/* <div className="relative">
          <Bell className="h-6 w-6 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {notifications.filter((n) => !n.read).length}
          </span>
        </div> */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto p-4 md:p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Accepted Members</p>
                    <p className="text-2xl font-bold">{acceptedCount}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rejected Members</p>
                    <p className="text-2xl font-bold">{rejectedCount}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Canceled Members</p>
                    <p className="text-2xl font-bold">{bannedCount}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Member Management */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Member Management</span>
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      {members.length} Total
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Search Bar */}
                  <div className="mb-4 relative">
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        className="w-full p-2 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <div className="px-3 py-2 bg-gray-100">
                        <Search className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value)}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All Members</TabsTrigger>
                      <TabsTrigger value="accepted">Accepted</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="rejected">Rejected</TabsTrigger>
                      <TabsTrigger value="banned">Banned</TabsTrigger>
                    </TabsList>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Phone</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-3 text-center">Loading members...</td>
                            </tr>
                          ) : filteredMembers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-3 text-center">No members found</td>
                            </tr>
                          ) : (
                            filteredMembers.map((member) => (
                              <tr key={member.id}>
                                <td className="px-4 py-3 text-sm">{member.fullName}</td>
                                <td className="px-4 py-3 text-sm">{member.email}</td>
                                <td className="px-4 py-3 text-sm">{member.phoneNumber}</td>
                                <td className="px-4 py-3 text-sm">
                                  <Badge
                                    className={
                                      member.status === 'accepted' ? 'bg-green-500' :
                                        member.status === 'pending' ? 'bg-yellow-500' :
                                          member.status === 'banned' ? 'bg-purple-500' :
                                            'bg-red-500'
                                    }
                                  >
                                    {member.status === 'banned' ? 'Banned' : member.status}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => openMemberDetails(member)}
                                      className="flex items-center"
                                    >
                                      <Eye className="h-4 w-4 mr-1" /> View
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              {/* Notifications */}
              <UpdateNotificationAlert />
              {/*Add activity */}
              <AddActivity />
            </div>
          </div>
        </div>

        {/* Member Details Dialog as a separate component */}
        <MemberDetailsDialog
          member={selectedMember}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onStatusUpdate={updateMemberStatus}
          onGeneratePDF={generatePDF}
        />
      </div>
    </>
  );
}