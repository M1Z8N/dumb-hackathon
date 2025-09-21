import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Profile } from '../types';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface SwipeCardProps {
  profile: Profile;
  onInfo: () => void;
  onProfilePress: () => void;
}

export default function SwipeCard({ profile, onInfo, onProfilePress }: SwipeCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onProfilePress} activeOpacity={0.9}>
      <Image
        source={typeof profile.photoUrl === 'string' ? { uri: profile.photoUrl } : profile.photoUrl}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Potential Match Badge */}
      <View style={styles.matchBadge}>
        <Ionicons name="heart" size={14} color={colors.white} />
        <Text style={styles.matchBadgeText}>Potential Match</Text>
      </View>

      {/* Bottom Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.nameRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={20} color={colors.pink.primary} />
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color={colors.text.secondary} />
          <Text style={styles.locationText}>{Math.floor(Math.random() * 5) + 1} km away</Text>
          <View style={styles.commonInterest}>
            <Text style={styles.interestIcon}>💬</Text>
            <Text style={styles.interestText}>{profile.tags.length} Common Interest</Text>
          </View>
        </View>

        <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
      </View>

      {/* Like Button */}
      <TouchableOpacity style={styles.likeButton} activeOpacity={0.8}>
        <Ionicons name="heart" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width - 30,
    height: height * 0.72,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
  },
  matchBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: colors.pink.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchBadgeText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  age: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  commonInterest: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  interestIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  interestText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  bio: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  likeButton: {
    position: 'absolute',
    bottom: 120,
    left: '50%',
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.pink.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.pink.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});