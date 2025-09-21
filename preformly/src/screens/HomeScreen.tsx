import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { seedProfiles } from '../data/seedData';
import { Profile } from '../types';
import { colors } from '../theme/colors';
import MatchModal from '../components/MatchModal';
import { generateMatchSuggestions } from '../services/geminiService';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DURATION = 250;

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>(seedProfiles);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.7)).current;

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[(currentIndex + 1) % profiles.length];

  // Load AI-generated matches on mount
  useEffect(() => {
    loadAIMatches();
  }, []);

  const loadAIMatches = async () => {
    setLoadingMatches(true);
    try {
      // Get user traits from profile or use defaults
      const userTraits = ['Tech Enthusiast', 'Coffee Connoisseur', 'Startup Mindset'];
      const performanceScore = 85;

      const aiMatches = await generateMatchSuggestions(userTraits, performanceScore);

      if (aiMatches && aiMatches.length > 0) {
        // Convert AI matches to Profile format and append to existing profiles
        const newProfiles = aiMatches.map((match: any, index: number) => ({
          ...seedProfiles[index % seedProfiles.length], // Use seed profile as base
          id: `ai-${index}`,
          name: match.name || seedProfiles[index % seedProfiles.length].name,
          age: match.age || seedProfiles[index % seedProfiles.length].age,
          bio: match.bio || seedProfiles[index % seedProfiles.length].bio,
          // Keep the local image from seed profiles
          performanceScore: match.performanceScore || 85,
          matchReason: match.matchReason || 'Similar tech vibes'
        }));

        // Combine seed profiles with AI-enhanced profiles
        setProfiles([...seedProfiles, ...newProfiles]);
      }
    } catch (error) {
      console.error('Failed to load AI matches:', error);
      // Keep using seed profiles as fallback
    } finally {
      setLoadingMatches(false);
    }
  };

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const currentCardAnimatedStyle = {
    transform: [
      ...position.getTranslateTransform(),
      { rotate },
    ],
  };

  const nextCardAnimatedStyle = {
    transform: [{ scale: nextCardScale }],
    opacity: nextCardOpacity,
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });

        // Animate next card as current card moves
        const progress = Math.min(Math.abs(gestureState.dx) / width, 1);
        nextCardScale.setValue(0.95 + (0.05 * progress));
        nextCardOpacity.setValue(0.7 + (0.3 * progress));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        friction: 4,
      }),
      Animated.timing(nextCardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(nextCardOpacity, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const swipeLeft = () => {
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: -width * 1.5, y: 0 },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(nextCardScale, {
        toValue: 1,
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(nextCardOpacity, {
        toValue: 1,
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => nextCard());
  };

  const swipeRight = () => {
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: width * 1.5, y: 0 },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(nextCardScale, {
        toValue: 1,
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(nextCardOpacity, {
        toValue: 1,
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (currentProfile?.autoMatch) {
        setMatchedProfile(currentProfile);
        setShowMatch(true);
      }
      nextCard();
    });
  };

  const nextCard = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      // If we've gone through all profiles, reset to 0
      if (nextIndex >= profiles.length) {
        return 0;
      }
      return nextIndex;
    });
    position.setValue({ x: 0, y: 0 });
    nextCardScale.setValue(0.95);
    nextCardOpacity.setValue(0.7);
  };

  const renderCard = (profile: Profile, isTop: boolean = false) => {
    const age = Math.floor(Math.random() * 8) + 22;
    const distance = Math.floor(Math.random() * 10) + 1;

    return (
      <View style={styles.card}>
        <Image source={profile.photoUrl} style={styles.cardImage} />

        {isTop && (
          <>
            <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
              <Text style={styles.likeLabelText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
              <Text style={styles.nopeLabelText}>NOPE</Text>
            </Animated.View>
          </>
        )}

        <View style={styles.cardGradient} />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.name}>{profile.name}, {age}</Text>
            <MaterialIcons name="verified" size={20} color={colors.green.sage} />
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color={colors.white} />
            <Text style={styles.locationText}>{distance} km away</Text>
          </View>

          <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>

          <View style={styles.tagsContainer}>
            {(profile.tags || profile.interests || []).slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.scoreFloat}>
          <Text style={styles.scoreValue}>{profile.preformanceScore}</Text>
          <Text style={styles.scoreLabel}>score</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>preformly</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Feather name="filter" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Cards */}
      <View style={styles.cardStack}>
        {profiles.length === 0 || !currentProfile ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-circle" size={80} color={colors.gray[400]} />
            <Text style={styles.emptyTitle}>No more profiles!</Text>
            <Text style={styles.emptyText}>Check back later for more matches</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => {
                setCurrentIndex(0);
                setProfiles(seedProfiles);
              }}
            >
              <Text style={styles.refreshButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {nextProfile && (
              <Animated.View style={[styles.cardWrapper, nextCardAnimatedStyle]}>
                {renderCard(nextProfile)}
              </Animated.View>
            )}

            {currentProfile && (
              <Animated.View
                style={[styles.cardWrapper, currentCardAnimatedStyle]}
                {...panResponder.panHandlers}
              >
                {renderCard(currentProfile, true)}
              </Animated.View>
            )}
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={swipeLeft}
        >
          <Ionicons name="close" size={30} color={colors.gray[600]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.superLikeButton}>
          <Ionicons name="star" size={24} color={colors.earth.clay} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={swipeRight}
        >
          <Ionicons name="heart" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Match Modal */}
      {matchedProfile && (
        <MatchModal
          visible={showMatch}
          profile={matchedProfile}
          onClose={() => setShowMatch(false)}
        />
      )}
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
  logo: {
    fontSize: 26,
    fontWeight: '300',
    color: colors.green.forest,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
  },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
  },
  card: {
    width: width - 40,
    height: height * 0.65,
    borderRadius: 20,
    backgroundColor: colors.white,
    overflow: 'hidden',
    shadowColor: colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: colors.white,
    marginLeft: 4,
    opacity: 0.9,
  },
  bio: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.95,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tagText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  scoreFloat: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: colors.green.sage,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.white,
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    left: 30,
    transform: [{ rotate: '-20deg' }],
    borderWidth: 3,
    borderColor: colors.green.sage,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  likeLabelText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.green.sage,
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    right: 30,
    transform: [{ rotate: '20deg' }],
    borderWidth: 3,
    borderColor: colors.earth.clay,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  nopeLabelText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.earth.clay,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 20,
    gap: 30,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  rejectButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[300],
  },
  likeButton: {
    backgroundColor: colors.green.sage,
  },
  superLikeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.earth.clay,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: colors.green.sage,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});