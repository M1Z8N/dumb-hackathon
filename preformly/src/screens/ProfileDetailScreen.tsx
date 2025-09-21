import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Profile } from '../types';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface ProfileDetailScreenProps {
  route: any;
  navigation: any;
}

export default function ProfileDetailScreen({ route, navigation }: ProfileDetailScreenProps) {
  const { profile } = route.params || {};

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
      </SafeAreaView>
    );
  }

  const handleMessage = () => {
    navigation.navigate('ChatDetail', {
      profile,
      initialRizz: {
        opener: `Hey ${profile.name.split(' ')[0]}! Loved your profile - that ${profile.interests[0]} vibe is so cool.`,
        followUps: [
          `What's your favorite spot in ${profile.location}?`,
          `I see you're into ${profile.interests.slice(1, 3).join(' and ')} too!`,
          `What's the most interesting project you've worked on lately?`
        ]
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image
            source={typeof profile.photoUrl === 'string' ? { uri: profile.photoUrl } : profile.photoUrl}
            style={styles.profileImage}
          />
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{profile.preformanceScore}</Text>
            <Text style={styles.scoreLabel}>Performative</Text>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.basicInfoContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.ageOccupation}>{profile.age} • {profile.occupation}</Text>
          <Text style={styles.location}>📍 {profile.location}</Text>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>

        {/* Personality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personality</Text>
          <View style={styles.personalityContainer}>
            <View style={styles.traitContainer}>
              {profile.personality.traits.map((trait, index) => (
                <View key={index} style={styles.traitChip}>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.vibeText}>{profile.personality.vibe}</Text>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {profile.interests.map((interest, index) => (
              <View key={index} style={styles.interestChip}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {profile.tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Ionicons name="chatbubble" size={20} color={colors.white} />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons name="heart" size={20} color={colors.white} />
          <Text style={styles.likeButtonText}>Like</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 4,
  },
  moreButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  profileImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  scoreBadge: {
    position: 'absolute',
    bottom: 20,
    right: width * 0.2,
    backgroundColor: colors.pink.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  scoreText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  scoreLabel: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
  },
  basicInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  ageOccupation: {
    fontSize: 18,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  personalityContainer: {
    gap: 12,
  },
  traitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitChip: {
    backgroundColor: colors.green.pale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  traitText: {
    color: colors.green.forest,
    fontSize: 14,
    fontWeight: '500',
  },
  vibeText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: colors.blue.pale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: colors.blue.forest,
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: colors.pink.pale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: colors.pink.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 12,
    backgroundColor: colors.white,
    gap: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green.sage,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  messageButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pink.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  likeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 50,
  },
});
