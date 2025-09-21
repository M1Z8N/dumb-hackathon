import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ABOUT PREFORMLY</Text>
        <Text style={styles.tagline}>67% More Performative Than Your Ex</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What is Preformly?</Text>
        <Text style={styles.text}>
          Tinder for performative people. Swipe nearby fits, match, and let the AI rizz agent talk for you.
          Our "Nano Bana" feature edits your photos on prompt to make any fit more performative.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core Features</Text>
        <Text style={styles.bulletPoint}>• Swipe & Match: Location-based card deck</Text>
        <Text style={styles.bulletPoint}>• Rizz Agent: AI-generated openers</Text>
        <Text style={styles.bulletPoint}>• Scan to Score: Photo enhancement with Nano Bana</Text>
        <Text style={styles.bulletPoint}>• Hotspot Map: Find performative locations</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Safety</Text>
        <Text style={styles.text}>
          Opt-in profiles only. Contact links are user-shared. No scraping or tracking.
          Your photos stay private. All edits are performed on user-provided images only.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technology</Text>
        <Text style={styles.text}>
          Built with React Native Expo for cross-platform compatibility.
          Powered by Google's Gemini Nano Bana image generation model for photo enhancements.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with performative energy</Text>
        <Text style={styles.footerText}>For a dumb hackathon</Text>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  version: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 10,
  },
});