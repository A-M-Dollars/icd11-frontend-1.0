'use client'

import React, { useState } from 'react'
import axios from 'axios'
import useUserStore from '@/store/userStore'
import { useRouter } from 'next/navigation'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const {setUser} = useUserStore()

  const handleSubmit = async(e: any) => {
    e.preventDefault()
    try{
      const response = await axios.post('http://localhost:8000/users/auth/login', {email, password})
      const resUser = response.data
      setUser(resUser.user.id,resUser.user.first_name, resUser.user.last_name, resUser.user.email, resUser.access_token, resUser.refresh_token )
      router.replace("/dashboard")
    } catch(err){
      setError('invalid credentials')
    }
  }

  return (
    <div className='text-black'>
      <h1>
        Login
      </h1>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type='submit'>Login</button>
      </form>
    </div>
  )
}

export default Login