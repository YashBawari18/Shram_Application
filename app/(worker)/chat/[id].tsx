import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useAuthStore } from '../../../src/stores/authStore'
import { useChat } from '../../../src/hooks/useChat'
import { Colors, Typography, Spacing, Radius } from '../../../src/constants/theme'
import { Message } from '../../../src/types/app'
import { Ionicons } from '@expo/vector-icons'

const QUICK_REPLIES = [
  'ठीक है 👍',
  'हाँ, आ रहा हूं',
  '5 मिनट में पहुंचूंगा',
  'पता भेजें',
  'कितना समय लगेगा?',
]

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session, profile } = useAuthStore()
  const userId = session?.user?.id ?? ''
  const { messages, isLoading, sendMessage } = useChat(id, userId)
  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList>(null)

  async function handleSend(text?: string) {
    const msg = text ?? input
    if (!msg.trim()) return
    setInput('')
    await sendMessage(msg)
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
            <Text style={styles.backText}>वापस</Text>
          </TouchableOpacity>
          <View style={{ marginLeft: Spacing.sm }}>
            <Text style={styles.headerTitle}>मैसेज</Text>
            <Text style={styles.headerSub}>बुकिंग #{id.slice(0, 8)}</Text>
          </View>
        </View>

        {/* Messages */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item }) => <MessageBubble message={item} isMe={item.sender_id === userId} />}
            contentContainerStyle={styles.messageList}
            onLayout={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} style={{ marginBottom: Spacing.sm }} />
                <Text style={styles.emptyChatText}>बात शुरू करें</Text>
              </View>
            }
          />
        )}

        {/* Quick replies */}
        <View style={styles.quickReplies}>
          {QUICK_REPLIES.map(q => (
            <TouchableOpacity key={q} onPress={() => handleSend(q)} style={styles.quickChip}>
              <Text style={styles.quickText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="मैसेज लिखें..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function MessageBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  const time = new Date(message.created_at).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
  return (
    <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
      <View style={[styles.bubble, isMe && styles.bubbleMe]}>
        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{message.content}</Text>
        <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>{time}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl, paddingBottom: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.base },
  backBtn: {},
  backText: { fontSize: Typography.base, color: Colors.textSecondary, fontWeight: Typography.medium },
  headerTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  headerSub: { fontSize: Typography.xs, color: Colors.textMuted },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messageList: { padding: Spacing.base, gap: Spacing.sm, flexGrow: 1 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing['4xl'] },
  emptyChatText: { fontSize: Typography.base, color: Colors.textMuted },
  bubbleRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: Spacing.sm },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', backgroundColor: Colors.offWhite, borderRadius: Radius.lg, borderBottomLeftRadius: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 4 },
  bubbleMe: { backgroundColor: Colors.primary, borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: Typography.base, color: Colors.textPrimary, lineHeight: Typography.base * 1.4 },
  bubbleTextMe: { color: Colors.white },
  bubbleTime: { fontSize: 10, color: Colors.textMuted, alignSelf: 'flex-end' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.7)' },
  quickReplies: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  quickChip: { backgroundColor: Colors.surfaceSecondary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  quickText: { fontSize: Typography.sm, color: Colors.textSecondary },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.base, paddingBottom: Spacing.base, paddingTop: Spacing.sm, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  textInput: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.xl, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, fontSize: Typography.base, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  sendBtn: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendIcon: { fontSize: Typography.base, color: Colors.black, fontWeight: Typography.bold },
})
