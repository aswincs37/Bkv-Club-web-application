import MemberRegistration from '@/components/client/MemberRegistration/MemberRegistration';
import RegistrationStatus from '@/components/client/RegistrationStatus/RegistrationStatus';
import React from 'react'

const page = () => {
    return (
        <div className="min-h-screen bg-gray-100 py-10">
          <RegistrationStatus />
        </div>
      );
}

export default page