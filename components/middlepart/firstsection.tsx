'use client'

import React, { useEffect, useRef, useState } from 'react'

const Textbox = () => {
  const wsRef = useRef<WebSocket | null>(null)
  const [input, setInput] = useState('')
  useEffect(() => {})


  return (
    <div>
      textbox
    </div>
  )
}

export default Textbox