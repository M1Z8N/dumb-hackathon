import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { seedProfiles } from '../data/seedData';

const { width, height } = Dimensions.get('window');

interface HotspotLocation {
  id: string;
  name: string;
  type: 'cafe' | 'gym' | 'coworking' | 'bar' | 'park';
  coordinate: {
    latitude: number;
    longitude: number;
  };
  performanceScore: number;
  profiles: typeof seedProfiles;
  description: string;
  address: string;
}

// Real SF locations with coordinates
const sfHotspots: HotspotLocation[] = [
  {
    id: '1',
    name: 'Blue Bottle Coffee - Mint Plaza',
    type: 'cafe',
    coordinate: {
      latitude: 37.7826,
      longitude: -122.4099,
    },
    performanceScore: 95,
    profiles: [seedProfiles[8], ...seedProfiles.slice(0, 2)], // Ryan first, he's always at Blue Bottle
    description: 'Ryan rating matcha while founders pitch',
    address: '66 Mint St, San Francisco',
  },
  {
    id: '2',
    name: 'Equinox Sports Club',
    type: 'gym',
    coordinate: {
      latitude: 37.7889,
      longitude: -122.4041,
    },
    performanceScore: 92,
    profiles: seedProfiles.slice(3, 5),
    description: 'VCs doing their 5am workout routine',
    address: '747 Market St, San Francisco',
  },
  {
    id: '3',
    name: 'WeWork Salesforce Tower',
    type: 'coworking',
    coordinate: {
      latitude: 37.7898,
      longitude: -122.3970,
    },
    performanceScore: 89,
    profiles: seedProfiles.slice(2, 6),
    description: 'Startup founders "crushing it"',
    address: '415 Mission St, San Francisco',
  },
  {
    id: '4',
    name: 'The Interval at Long Now',
    type: 'bar',
    coordinate: {
      latitude: 37.8066,
      longitude: -122.4324,
    },
    performanceScore: 87,
    profiles: seedProfiles.slice(4, 7),
    description: 'Deep tech conversations over craft cocktails',
    address: '2 Marina Blvd, San Francisco',
  },
  {
    id: '5',
    name: 'Dolores Park',
    type: 'park',
    coordinate: {
      latitude: 37.7596,
      longitude: -122.4269,
    },
    performanceScore: 85,
    profiles: seedProfiles.slice(1, 4),
    description: 'Tech picnics with matcha and kombucha',
    address: 'Dolores St & 19th St, San Francisco',
  },
  {
    id: '6',
    name: 'Ritual Coffee Roasters',
    type: 'cafe',
    coordinate: {
      latitude: 37.7565,
      longitude: -122.4211,
    },
    performanceScore: 91,
    profiles: [seedProfiles[8], ...seedProfiles.slice(5, 7)], // Ryan here too, testing their matcha
    description: 'Ryan debating matcha quality with PMs',
    address: '1026 Valencia St, San Francisco',
  },
  {
    id: '7',
    name: 'Barry\'s Bootcamp',
    type: 'gym',
    coordinate: {
      latitude: 37.7865,
      longitude: -122.4066,
    },
    performanceScore: 88,
    profiles: seedProfiles.slice(0, 2),
    description: 'High-intensity networking',
    address: '640 Post St, San Francisco',
  },
  {
    id: '8',
    name: 'The Battery',
    type: 'coworking',
    coordinate: {
      latitude: 37.7951,
      longitude: -122.4028,
    },
    performanceScore: 96,
    profiles: seedProfiles.slice(3, 6),
    description: 'Elite private club for tech leaders',
    address: '717 Battery St, San Francisco',
  },
];

export default function MapScreen() {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotLocation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const mapRef = useRef<MapView>(null);

  const initialRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'cafe': return '#8B4513';
      case 'gym': return '#4CAF50';
      case 'coworking': return '#2196F3';
      case 'bar': return '#9C27B0';
      case 'park': return '#4CAF50';
      default: return '#757575';
    }
  };

  const handleMarkerPress = (hotspot: HotspotLocation) => {
    setSelectedHotspot(hotspot);
    setShowDetails(true);

    // Animate to the selected location
    mapRef.current?.animateToRegion({
      ...hotspot.coordinate,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 500);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {sfHotspots.map((hotspot) => (
          <Marker
            key={hotspot.id}
            coordinate={hotspot.coordinate}
            onPress={() => handleMarkerPress(hotspot)}
          >
            <View style={styles.markerContainer}>
              {/* Profile images cluster */}
              <View style={styles.profileCluster}>
                {hotspot.profiles.slice(0, 3).map((profile, index) => (
                  <Image
                    key={profile.id}
                    source={profile.photoUrl}
                    style={[
                      styles.profileThumb,
                      {
                        zIndex: 3 - index,
                        left: index * 12,
                      }
                    ]}
                  />
                ))}
              </View>

              {/* Location pin */}
              <View style={[styles.locationPin, { backgroundColor: getMarkerColor(hotspot.type) }]}>
                <Text style={styles.scoreText}>{hotspot.performanceScore}</Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SF Hotspots</Text>
        <Text style={styles.subtitle}>Find your people</Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8B4513' }]} />
            <Text style={styles.legendText}>Cafe</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Gym</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>Cowork</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
            <Text style={styles.legendText}>Bar</Text>
          </View>
        </ScrollView>
      </View>

      {/* Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDetails}
        onRequestClose={() => setShowDetails(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetails(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>{selectedHotspot?.name}</Text>
            <Text style={styles.modalAddress}>{selectedHotspot?.address}</Text>

            <View style={styles.modalScore}>
              <Text style={styles.modalScoreLabel}>Performance Score</Text>
              <Text style={styles.modalScoreValue}>{selectedHotspot?.performanceScore}</Text>
            </View>

            <Text style={styles.modalDescription}>{selectedHotspot?.description}</Text>

            {/* Profiles at this location */}
            <Text style={styles.profilesTitle}>Who's here:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.profilesList}>
              {selectedHotspot?.profiles.map((profile) => (
                <View key={profile.id} style={styles.profileCard}>
                  <Image source={profile.photoUrl} style={styles.profileImage} />
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileBio} numberOfLines={1}>{profile.occupation}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.navigateButton}>
              <Ionicons name="navigate" size={20} color={colors.white} />
              <Text style={styles.navigateButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  legend: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  markerContainer: {
    alignItems: 'center',
  },
  profileCluster: {
    flexDirection: 'row',
    width: 60,
    height: 30,
    marginBottom: 5,
  },
  profileThumb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.white,
    position: 'absolute',
  },
  locationPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scoreText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: height * 0.7,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 5,
  },
  modalAddress: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 15,
  },
  modalScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.green.pale,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  modalScoreLabel: {
    fontSize: 14,
    color: colors.green.forest,
  },
  modalScoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.green.forest,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  profilesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 10,
  },
  profilesList: {
    marginBottom: 20,
  },
  profileCard: {
    marginRight: 15,
    alignItems: 'center',
    width: 80,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  profileName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  profileBio: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  navigateButton: {
    backgroundColor: colors.green.sage,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    marginTop: 10,
  },
  navigateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});