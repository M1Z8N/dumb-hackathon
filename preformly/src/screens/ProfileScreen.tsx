import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

const getScoreColor = (score: number) => {
  if (score >= 95) return colors.green.forest; // Exceptionally performative
  if (score >= 85) return colors.green.sage;  // Highly performative
  if (score >= 75) return colors.earth.clay;  // Moderately performative
  if (score >= 65) return colors.pink.primary; // Low performative
  return colors.red;                          // Not performative
};

export default function ProfileScreen() {
  // Default profile data
  const [profileData, setProfileData] = useState({
    name: 'Tech Professional',
    age: 28,
    performanceScore: 85,
    image: 'https://picsum.photos/seed/techpro/400/400',
    bio: 'Building the future, one sprint at a time 🚀',
    traits: ['Coffee Connoisseur', 'Startup Mindset', 'Design Thinker'],
    lifestyle: 'Digital nomad working from artisanal cafes',
    matchingTypes: ['Fellow entrepreneurs', 'Product designers']
  });

  // Load saved profile data from AsyncStorage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          console.log('Loaded saved profile:', profile);
          setProfileData(profile);
        } else {
          console.log('No saved profile found, using defaults');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: profileData.image }}
              style={styles.profileImage}
            />
            {profileData.enhancedImage && (
              <Image
                source={{ uri: profileData.enhancedImage }}
                style={styles.enhancedImage}
              />
            )}
          </View>
          <Text style={styles.name}>{profileData.name}, {profileData.age}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Performance Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(profileData.performanceScore) }]}>
              {profileData.performanceScore}
            </Text>
          </View>
        </View>

        {profileData.enhancedImage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Enhancement</Text>
            <Text style={styles.enhancementInfo}>
              Enhanced with: {profileData.customPrompt || 'AI magic'}
            </Text>
            <Text style={styles.enhancementDate}>
              Created: {new Date(profileData.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>{profileData.bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Traits</Text>
          <View style={styles.interestGrid}>
            {profileData.traits.map((trait) => (
              <View key={trait} style={styles.interestTag}>
                <Text style={styles.interestText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle</Text>
          <Text style={styles.lifestyleText}>{profileData.lifestyle}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best Matches</Text>
          {profileData.matchingTypes.map((type, index) => (
            <View key={index} style={styles.matchRow}>
              <Ionicons name="heart" size={16} color={colors.pink.primary} />
              <Text style={styles.matchText}>{type}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.green.sage,
  },
  enhancedImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.pink.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: colors.pink.pale,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.pink.primary,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  interestText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  editButton: {
    margin: 20,
    backgroundColor: colors.pink.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  bioText: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  lifestyleText: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  enhancementInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  enhancementDate: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  matchText: {
    fontSize: 15,
    color: colors.text.primary,
  },
});