import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { seedProfiles } from '../data/seedData';

export default function ChatScreen() {
  const navigation = useNavigation<any>();

  const chats = seedProfiles.slice(0, 4).map((profile, index) => ({
    ...profile,
    lastMessage: [
      "Hey! How's your weekend going?",
      "Would love to grab matcha sometime",
      "That's such a cute dog!",
      "Just matched! Hi there 👋",
    ][index],
    timestamp: ["2m", "1h", "3h", "1d"][index],
    unread: index < 2,
    isAiActive: index < 2, // First two chats have AI assistance active
  }));

  const handleChatPress = (profile: any) => {
    navigation.navigate('ChatDetail', {
      profile,
      initialRizz: null,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.aiToggle}>
            <MaterialIcons name="auto-awesome" size={20} color={colors.green.sage} />
            <Text style={styles.aiToggleText}>AI: ON</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* AI Assistant Info */}
        <View style={styles.aiInfoCard}>
          <MaterialIcons name="auto-awesome" size={24} color={colors.green.sage} />
          <View style={styles.aiInfoContent}>
            <Text style={styles.aiInfoTitle}>AI Assistant Active</Text>
            <Text style={styles.aiInfoText}>
              Your AI is helping with 2 conversations
            </Text>
          </View>
          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>

        {chats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            onPress={() => handleChatPress(chat)}
          >
            <View style={styles.avatarContainer}>
              <Image source={chat.photoUrl} style={styles.avatar} />
              <View style={styles.onlineIndicator} />
              {chat.isAiActive && (
                <View style={styles.aiIndicator}>
                  <MaterialIcons name="auto-awesome" size={12} color={colors.white} />
                </View>
              )}
            </View>

            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <View style={styles.nameRow}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  {chat.isAiActive && (
                    <View style={styles.aiTag}>
                      <Text style={styles.aiTagText}>AI</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.timestamp}>{chat.timestamp}</Text>
              </View>
              <Text
                style={[styles.lastMessage, chat.unread && styles.unreadMessage]}
                numberOfLines={1}
              >
                {chat.lastMessage}
              </Text>
            </View>

            {chat.unread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Suggested Matches Section */}
        <View style={styles.suggestedSection}>
          <Text style={styles.suggestedTitle}>Start a conversation</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedScroll}
          >
            {seedProfiles.slice(4, 7).map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={styles.suggestedCard}
                onPress={() => handleChatPress(profile)}
              >
                <Image source={profile.photoUrl} style={styles.suggestedImage} />
                <Text style={styles.suggestedName}>{profile.name}</Text>
                <TouchableOpacity style={styles.rizzButton}>
                  <MaterialIcons name="auto-awesome" size={14} color={colors.white} />
                  <Text style={styles.rizzButtonText}>Rizz</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aiToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green.pale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  aiToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.green.forest,
  },
  aiInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green.pale,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  aiInfoContent: {
    flex: 1,
    marginLeft: 12,
  },
  aiInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.green.forest,
    marginBottom: 2,
  },
  aiInfoText: {
    fontSize: 12,
    color: colors.green.forest,
    opacity: 0.8,
  },
  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  manageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.green.forest,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.green.sage,
    borderWidth: 2,
    borderColor: colors.white,
  },
  aiIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.green.sage,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  aiTag: {
    backgroundColor: colors.green.sage,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  unreadMessage: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: colors.green.sage,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  suggestedSection: {
    paddingTop: 24,
    paddingBottom: 100,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  suggestedScroll: {
    paddingHorizontal: 20,
  },
  suggestedCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  suggestedImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  suggestedName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  rizzButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green.sage,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  rizzButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
});