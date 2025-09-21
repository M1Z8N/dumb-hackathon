import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import SwipeCard from '../components/SwipeCard';
import MatchModal from '../components/MatchModal';
import { seedProfiles } from '../data/seedData';
import { Profile } from '../types';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

export default function SwipeScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  const currentProfile = seedProfiles[currentIndex];

  const rotate = rotateValue.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const cardStyle = {
    transform: [
      ...position.getTranslateTransform(),
      { rotate },
    ],
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        rotateValue.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          handleSwipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handleSwipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
    Animated.spring(rotateValue, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleSwipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -width * 1.5, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => nextCard());
  };

  const handleSwipeRight = () => {
    const isMatch = currentProfile?.autoMatch;

    Animated.timing(position, {
      toValue: { x: width * 1.5, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (isMatch) {
        setMatchedProfile(currentProfile);
        setShowMatch(true);
      }
      nextCard();
    });
  };

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % seedProfiles.length);
    position.setValue({ x: 0, y: 0 });
    rotateValue.setValue(0);
  };

  const handleInfo = () => {
    console.log('Info tapped for', currentProfile.name);
  };

  const handleProfilePress = () => {
    if (currentProfile) {
      console.log('Profile pressed for', currentProfile.name);
      navigation.navigate('ProfileDetail', { profile: currentProfile });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Preformly</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="refresh" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="tune" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {currentProfile && (
          <Animated.View
            style={[styles.cardWrapper, cardStyle]}
            {...panResponder.panHandlers}
          >
            <SwipeCard profile={currentProfile} onInfo={handleInfo} onProfilePress={handleProfilePress} />
          </Animated.View>
        )}
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.pink.primary,
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
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
  },
});