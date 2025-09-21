import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { seedProfiles } from '../data/seedData';

interface TabOption {
  key: string;
  label: string;
  count: number;
}

const tabs: TabOption[] = [
  { key: 'all', label: 'All', count: 200 },
  { key: 'recent', label: 'Recent', count: 50 },
  { key: 'nearby', label: 'Nearby', count: 150 },
];

export default function LikeYouScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [isPremium] = useState(true); // Mock premium status

  const renderProfileCard = ({ item, index }: { item: typeof seedProfiles[0]; index: number }) => {
    const distance = Math.floor(Math.random() * 10) + 1;
    const hasLiked = index % 3 === 0; // Mock some profiles as liked

    return (
      <TouchableOpacity style={styles.profileCard} activeOpacity={0.8}>
        <Image source={item.photoUrl} style={styles.profileImage} />

        <View style={styles.profileOverlay}>
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{distance} km away</Text>
          </View>

          {hasLiked && (
            <View style={styles.likedBadge}>
              <Ionicons name="heart" size={16} color={colors.white} />
            </View>
          )}
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>{item.name}, {Math.floor(Math.random() * 8) + 22}</Text>
          <Text style={styles.onlineStatus}>Active 2h ago</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Like You</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="sparkles" size={14} color={colors.white} />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            <Text style={[styles.tabCount, activeTab === tab.key && styles.activeTabCount]}>
              {tab.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Profile Grid */}
      <FlatList
        data={[...seedProfiles, ...seedProfiles]} // Duplicate for more content
        renderItem={renderProfileCard}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Blur overlay for non-premium users */}
      {!isPremium && (
        <View style={styles.premiumOverlay}>
          <View style={styles.premiumContent}>
            <Ionicons name="lock-closed" size={48} color={colors.pink.primary} />
            <Text style={styles.premiumTitle}>See who likes you</Text>
            <Text style={styles.premiumDescription}>
              Upgrade to Premium to see all profiles who liked you
            </Text>
            <TouchableOpacity style={styles.premiumButton}>
              <Text style={styles.premiumButtonText}>Get Premium</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pink.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  premiumText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.pink.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  tabCount: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  activeTabCount: {
    color: colors.text.secondary,
  },
  gridContent: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  profileCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  profileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  likedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.pink.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    padding: 12,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  onlineStatus: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  premiumOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 140, // Account for header and tabs
  },
  premiumContent: {
    alignItems: 'center',
    padding: 40,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  premiumDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  premiumButton: {
    backgroundColor: colors.pink.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  premiumButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});