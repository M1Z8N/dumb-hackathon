import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { generateRizzLines } from '../utils/rizzAgent';
import { generateChatResponse } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other' | 'ai';
  timestamp: Date;
  isAiGenerated?: boolean;
}

export default function ChatDetailScreen({ route, navigation }: any) {
  const { profile, initialRizz } = route.params || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiMode, setIsAiMode] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Initialize with AI-generated opener if coming from "Rizz for Me"
    if (initialRizz) {
      const initialMessages: Message[] = [
        {
          id: '1',
          text: initialRizz.opener,
          sender: 'user',
          timestamp: new Date(),
          isAiGenerated: true,
        },
      ];
      setMessages(initialMessages);

      // Generate immediate AI response
      setTimeout(async () => {
        try {
          const profileContext = `you're ${profile?.name}, ${profile?.age}, ${profile?.occupation}. ${profile?.personality?.vibe || ''}. into: ${profile?.interests?.slice(0, 3).join(', ')}`;

          const aiResponse = await generateChatResponse(
            initialRizz.opener,
            profileContext
          );

          const response: Message = {
            id: '2',
            text: aiResponse,
            sender: 'other',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, response]);
        } catch (error) {
          console.error('Failed to generate initial response:', error);
          const response: Message = {
            id: '2',
            text: "haha okay that was actually smooth",
            sender: 'other',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, response]);
        }
      }, 1500);
    }
  }, [initialRizz, profile]);

  const sendMessage = async () => {
    if (inputText.trim()) {
      const userText = inputText.trim();
      const newMessage: Message = {
        id: Date.now().toString(),
        text: userText,
        sender: 'user',
        timestamp: new Date(),
        isAiGenerated: false,
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      // Always generate AI response as the matched person
      setTimeout(async () => {
        try {
          // Build simple context
          const profileContext = `you're ${profile?.name}, ${profile?.age}, ${profile?.occupation}. ${profile?.personality?.vibe || ''}. interests: ${profile?.interests?.slice(0, 3).join(', ')}`;

          const recentMessages = messages.slice(-3).map(m =>
            `${m.sender === 'user' ? 'them' : 'you'}: ${m.text}`
          ).join('\n');

          const fullContext = `${profileContext}\n\n${recentMessages}`;

          // Generate response using Gemini as the matched person
          const aiResponse = await generateChatResponse(
            userText,
            fullContext
          );

          const response: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse || "Let's grab coffee and discuss that! ☕",
            sender: 'other',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, response]);
        } catch (error) {
          console.error('Failed to generate AI response:', error);
          // Fallback response based on profile personality
          const fallbackResponses = [
            "haha yeah totally feel that",
            "wait that's actually kinda genius",
            "omg yes!! coffee tomorrow?",
            "you get it 💫",
            "lol stop reading my mind",
            "exactly what i was thinking",
          ];
          const response: Message = {
            id: (Date.now() + 1).toString(),
            text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
            sender: 'other',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, response]);
        }
      }, 1000 + Math.random() * 1000); // Random delay for more natural feel

      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const generateAiMessage = () => {
    const aiSuggestions = [
      "What's your ideal weekend look like?",
      "Coffee or matcha? This is important 🍵",
      "What's the most performative thing you've done this week?",
      "Are you more sunrise yoga or sunset journaling?",
      "Quick question: thoughts on mensen who wear Allbirds?",
      "What's your hot take on oat milk brands?",
    ];

    const suggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    setInputText(suggestion);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user' || message.sender === 'ai';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isUser && (
          <Image
            source={profile?.photoUrl}
            style={styles.avatar}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessage : styles.otherMessage,
          ]}
        >
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.otherMessageText,
          ]}>
            {message.text}
          </Text>

          {message.isAiGenerated && isUser && (
            <View style={styles.aiIndicator}>
              <MaterialIcons name="auto-awesome" size={12} color={colors.white} />
              <Text style={styles.aiIndicatorText}>AI suggested</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{profile?.name || 'Match'}</Text>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Active now</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-vertical" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* AI Mode Indicator */}
      {isAiMode && (
        <View style={styles.aiModeBar}>
          <MaterialIcons name="auto-awesome" size={16} color={colors.green.forest} />
          <Text style={styles.aiModeText}>AI Assistant is helping you chat</Text>
          <TouchableOpacity onPress={() => setIsAiMode(false)}>
            <Text style={styles.turnOffText}>Turn off</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.matchInfo}>
          <Image
            source={profile?.photoUrl}
            style={styles.matchImage}
          />
          <Text style={styles.matchText}>You matched with {profile?.name}</Text>
          <Text style={styles.matchTime}>Today at 2:30 PM</Text>
        </View>

        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          {!isAiMode && (
            <TouchableOpacity style={styles.aiToggleButton} onPress={() => setIsAiMode(true)}>
              <MaterialIcons name="auto-awesome" size={20} color={colors.green.sage} />
            </TouchableOpacity>
          )}

          {isAiMode && (
            <TouchableOpacity style={styles.suggestButton} onPress={generateAiMessage}>
              <Feather name="zap" size={20} color={colors.green.forest} />
            </TouchableOpacity>
          )}

          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? colors.white : colors.gray[400]}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green.sage,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  moreButton: {
    padding: 4,
  },
  aiModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green.pale,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  aiModeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: colors.green.forest,
  },
  turnOffText: {
    fontSize: 13,
    color: colors.green.forest,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  matchInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  matchImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  matchText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green.sage,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: colors.green.sage,
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: colors.green.light,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.text.primary,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  aiIndicatorText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  aiToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.green.pale,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  suggestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.green.pale,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text.primary,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: colors.green.sage,
  },
});