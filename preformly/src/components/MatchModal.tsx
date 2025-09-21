import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Profile, RizzLine } from '../types';
import { generateRizzLines } from '../utils/rizzAgent';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  profile: Profile;
  onClose: () => void;
}

export default function MatchModal({ visible, profile, onClose }: MatchModalProps) {
  const navigation = useNavigation<any>();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRizzForMe = async () => {
    setIsProcessing(true);

    // Generate rizz lines
    const rizzLines = generateRizzLines(profile.name, profile.tags[0]);

    // Small delay for UX
    setTimeout(() => {
      setIsProcessing(false);
      onClose();

      // Navigate to chat with AI-generated messages
      navigation.navigate('ChatDetail', {
        profile,
        initialRizz: rizzLines,
      });
    }, 1000);
  };

  const handleContact = () => {
    if (profile.contactLink) {
      Linking.openURL(profile.contactLink).catch(() =>
        Alert.alert('Error', 'Could not open contact link')
      );
    } else {
      // Navigate to chat without AI assistance
      onClose();
      navigation.navigate('ChatDetail', {
        profile,
        initialRizz: null,
      });
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.matchHeader}>
            <View style={styles.sparkleContainer}>
              <Ionicons name="sparkles" size={32} color={colors.green.sage} />
            </View>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {profile.name} liked each other
            </Text>
          </View>

          <View style={styles.profileSection}>
            <Image source={profile.photoUrl} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileBio}>{profile.bio}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, isProcessing && styles.processingButton]}
              onPress={handleRizzForMe}
              disabled={isProcessing}
            >
              <View style={styles.buttonIcon}>
                {isProcessing ? (
                  <Feather name="loader" size={20} color={colors.white} />
                ) : (
                  <Feather name="message-circle" size={20} color={colors.white} />
                )}
              </View>
              <Text style={styles.buttonText}>
                {isProcessing ? "Generating..." : "Rizz for Me"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.contactButton]}
              onPress={handleContact}
            >
              <View style={[styles.buttonIcon, styles.contactIcon]}>
                <Feather name="send" size={20} color={colors.green.forest} />
              </View>
              <Text style={[styles.buttonText, styles.contactText]}>Chat Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <MaterialIcons name="auto-awesome" size={16} color={colors.green.sage} />
            <Text style={styles.infoText}>
              "Rizz for Me" uses AI to start the conversation for you
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '85%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  matchHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sparkleContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.green.pale,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  matchSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    marginBottom: 24,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.green.sage,
  },
  processingButton: {
    opacity: 0.7,
  },
  contactButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.green.sage,
  },
  buttonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIcon: {
    backgroundColor: colors.green.pale,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  contactText: {
    color: colors.green.forest,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green.pale,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.green.forest,
    lineHeight: 16,
  },
});