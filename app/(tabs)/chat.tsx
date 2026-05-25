import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, Button, BottomTabBar } from '../../src/presentation/components';

const INITIAL_MESSAGES = [
  {
    id: 'm1',
    text: 'Olá, Carlos! Sou a Mariana. Como posso ajudar com o edital da Prefeitura de Santo André hoje?',
    isAgent: true,
    time: '14:02',
  },
  {
    id: 'm2',
    text: 'Oi Mariana! Não entendi a parte da Certidão Negativa. Onde consigo isso?',
    isAgent: false,
    time: '14:05',
  },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  function sendMessage() {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: `m${Date.now()}`,
        text: input.trim(),
        isAgent: false,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.agentInfo}>
          <View style={styles.agentAvatarWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
              }}
              style={styles.agentAvatar}
            />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.agentName}>Mariana - Concierge</Text>
            <Text style={styles.onlineStatus}>Online agora</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[styles.messageGroup, msg.isAgent ? styles.messageGroupLeft : styles.messageGroupRight]}
          >
            <View style={[styles.messageBubble, msg.isAgent ? styles.bubbleAgent : styles.bubbleUser]}>
              <Text style={[styles.messageText, msg.isAgent ? styles.messageTextAgent : styles.messageTextUser]}>
                {msg.text}
              </Text>
            </View>
            <Text style={styles.messageTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.textInput}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={`${colors.textMuted}80`}
          value={input}
          onChangeText={setInput}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.8}>
          <Feather name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom tab bar still visible */}
      <BottomTabBar />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  agentAvatarWrapper: { position: 'relative' },
  agentAvatar: { width: 44, height: 44, borderRadius: 22 },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.surface,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  agentName: { fontSize: 15, fontWeight: '700', color: colors.primary },
  onlineStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.green,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageList: { padding: 16, gap: 20, paddingBottom: 160 },
  messageGroup: { maxWidth: '78%', gap: 4 },
  messageGroupLeft: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageGroupRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  messageBubble: { borderRadius: 20, padding: 14 },
  bubbleAgent: {
    backgroundColor: colors.accent,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.surface,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  messageText: { fontSize: 14, lineHeight: 22 },
  messageTextAgent: { color: '#fff' },
  messageTextUser: { color: colors.text },
  messageTime: { fontSize: 10, color: `${colors.textMuted}80` },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
    marginBottom: 80,
  },
  textInput: {
    flex: 1,
    height: 46,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
