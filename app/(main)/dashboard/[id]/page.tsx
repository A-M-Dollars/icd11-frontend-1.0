'use client'

import { baseInstance } from '@/constants/apis'
import useUserStore from '@/store/userStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { send } from '@/public/svgs/svgs'
import Loader from '@/components/loading/loader'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset before resizing
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const [awaitingResponse, setAwaitingResponse] = useState(false);


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

          setAwaitingResponse(false); // 👈 hide dots when response comes
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
      console.error('WebSocket error:', error)
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
    setAwaitingResponse(true); // 👈 show "thinking" dots

  }, [input, id])

  // Handle authentication check
  if (!isAuthenticated) {
    return <div>Please log in to access the chatroom.</div>
  }

  // Handle loading state
  if (isLoading) {
    return <div>
      <Loader />
    </div>
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
          messages.map((message: messageProp) =>
            message.sender.id === userId ? (
              <div key={message.id} className="mb-5 border-l-3 border-[#FFF]">
                <div className="text-sm ml-4 text-gray-500">
                  {message.sender.first_name} {message.sender.last_name} •{' '}
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                <p className="mt-1 ml-4 text-sm">{message.message}</p>
              </div>
            ) : (
              <div
                key={message.id}
                className="mb-6 border-l-4 border-[#007EFF] bg-white rounded-md shadow-sm p-4"
              >
                {/* Sender + Time */}
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    {message.sender.first_name} {message.sender.last_name}
                  </span>
                  <span>•</span>
                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>

                {/* Markdown Content */}
                <div className="prose prose-sm max-w-none text-gray-800 text-sm/6">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {message.message}
                  </Markdown>
                </div>

              </div>

            )
          )
        ) : (
          <div className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      {awaitingResponse && (
        <div className="flex items-center gap-1 text-gray-400 text-sm mt-2 ml-2">
          <span className="w-1 h-1 bg-[#96D22B] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1 h-1 bg-[#96D22B] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1 h-1 bg-[#96D22B] rounded-full animate-bounce"></span>
        </div>
      )}


      {/* Message Input */}
      <div className="p-4 shrink-0 bg-[#1A1A1A]">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // send on Enter
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 px-3 py-2 rounded border border-gray-600 resize-none overflow-hidden"
            disabled={connectionStatus !== "connected"}
            style={{ minHeight: "40px", maxHeight: "200px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || connectionStatus !== "connected"}
            className=" w-10 h-10
            place-items-center px-4 py-2 bg-[#007EFF] 
            rounded text-white hover:cursor-pointer disabled:opacity-50
            disabled:cursor-not-allowed"
          >
            {send}
          </button>
        </div>
      </div>

    </div>
  )

}

export default Chatroom