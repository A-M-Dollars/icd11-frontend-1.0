'use client'

import { baseInstance } from '@/constants/apis'
import useUserStore from '@/store/userStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { send } from '@/public/svgs/svgs'

type senderProp = {
  id: string,
  first_name: string,
  last_name: string,
  email: string
}

type messageProp = {
  id: string,
  message: string,
  timestamp: string,
  sender: senderProp
}

const Chatroom = () => {
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()

  // Get user data from store
  const { accessToken, isAuthenticated, id: userId } = useUserStore()

  // Fetch messages with proper dependency array
  const fetchMessages = useCallback(async () => {
    if (!id) throw new Error('Room ID is required')
    const response = await baseInstance.get(`/chats/rooms/${id}/messages`)
    return response.data
  }, [id])

  const { data: messages, isLoading, error, refetch } = useQuery<messageProp[]>({
    queryKey: ['messages', id], // Include id in query key
    queryFn: fetchMessages,
    enabled: !!id && isAuthenticated, // Only fetch if we have id and user is authenticated
    refetchOnWindowFocus: false,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const [input, setInput] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')

  // WebSocket connection effect
  useEffect(() => {
    // Don't connect if no token or room id
    if (!accessToken || !id) {
      console.log('Missing token or room ID, skipping WebSocket connection')
      return
    }

    console.log('Establishing WebSocket connection...')
    const wsUrl = `ws://localhost:8000/chats/ws/${id}?token=${accessToken}`
    wsRef.current = new WebSocket(wsUrl)
    const ws = wsRef.current

    setConnectionStatus('connecting')

    ws.onopen = () => {
      console.log('WebSocket connection established')
      setConnectionStatus('connected')
    }

    ws.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data)

        // Invalidate and refetch messages when new message received
        // queryClient.invalidateQueries({ queryKey: ['messages', id] })
        if (messageData.type === 'message') {
          // Add the new message to the existing messages
          queryClient.setQueryData(['messages', id], (oldMessages: messageProp[] | undefined) => {
            if (!oldMessages) return [messageData]

            // Check if message already exists to avoid duplicates
            const messageExists = oldMessages.some(msg => msg.id === messageData.id)
            if (messageExists) return oldMessages

            return [...oldMessages, messageData]
          })
        } else if (messageData.type === 'error') {
          console.error('WebSocket error:', messageData.message)
          // You could show a toast notification here
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }


    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason)
      setConnectionStatus('disconnected')
    }

    ws.onerror = (error) => {
      // console.error('WebSocket error:', error)
      setConnectionStatus('disconnected')
    }

    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
    }
  }, [id, accessToken, queryClient]) // Dependencies for WebSocket

  // Send message function
  const sendMessage = useCallback(() => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    const messagePayload = {
      type: 'message',
      content: input.trim(),
      room_id: id
    }

    wsRef.current.send(JSON.stringify(messagePayload))
    setInput('') // Clear input after sending
  }, [input, id])

  // Handle authentication check
  if (!isAuthenticated) {
    return <div>Please log in to access the chatroom.</div>
  }

  // Handle loading state
  if (isLoading) {
    return <div>Loading messages...</div>
  }

  // Handle error state
  if (error) {
    return <div>Error loading messages: {error.message}</div>
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 shrink-0 bg-[#1A1A1A]">
        <h1>ChatRoom {id}</h1>
        <div className="text-sm text-gray-500">
          Status:{' '}
          <span
            className={
              connectionStatus === 'connected' ? 'text-[#96D22B]' : 'text-red-500'
            }
          >
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#1A1A1A] brightness-60">
        {messages && messages.length > 0 ? (
          messages.map((message: messageProp) => (
            <div key={message.id} className={`mb-5 ${message.sender.id === userId ? "border-l-3 border-gray-600" : "whitespace-pre-wrap border-l-3 border-[#96D22B]"}`}>
              <div className="text-sm ml-4 text-gray-500">
                {message.sender.first_name} {message.sender.last_name} •{' '}
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              <p className="mt-1 ml-4 text-md">{message.message}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>


      {/* Message Input */}
      <div className="p-4 shrink-0 bg-[#1A1A1A]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 rounded border border-gray-600"
            disabled={connectionStatus !== 'connected'}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || connectionStatus !== 'connected'}
            className="items-center px-4 py-2 bg-[#96D22B] rounded text-white hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {send}
          </button>
        </div>
      </div>
    </div>
  )

}

export default Chatroom