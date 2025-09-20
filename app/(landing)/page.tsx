'use client'

import React from 'react'
import Login from '@/components/auth/login-in'
import useUserStore from '@/store/userStore'
import { useRouter } from 'next/navigation'


function page() {
  const isAuthenticated = useUserStore.getState().isAuthenticated
  const route = useRouter()

  // if (isAuthenticated)
  //   route.push('/dashboard')

  return (
    <div>
      <Login />
    </div>
  )
}

export default page