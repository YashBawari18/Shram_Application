import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Message } from '../types/app'

export function useChat(bookingId: string, currentUserId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load history
  useEffect(() => {
    if (!bookingId) return
    supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data ?? []) as Message[])
        setIsLoading(false)
      })
  }, [bookingId])

  // Realtime subscription
  useEffect(() => {
    if (!bookingId) return
    const channel = supabase
      .channel(`chat-${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId])

  async function sendMessage(content: string) {
    if (!content.trim()) return
    await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: currentUserId,
      content: content.trim(),
    })
  }

  return { messages, isLoading, sendMessage }
}
