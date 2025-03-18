import AdminDashboard from '@/components/admin/AdminHomePage/AdminHomePage';
import AdminLoginPage from '@/components/admin/AdminLogin/AdminLogin';
import React from 'react'

const page = () => {
    return (
        <div className="min-h-screen bg-gray-100 py-10">
          <AdminDashboard />
        </div>
      );
}

export default page