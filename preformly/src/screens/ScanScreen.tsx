import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { analyzeProfileImage, generatePerformativeImage, testApiKey } from '../services/geminiService';

interface ProfileAnalysis {
  performanceScore: number;
  traits: string[];
  lifestyle: string;
  matchingTypes: string[];
  bioSuggestion: string;
  warning?: string;
  generatedImage?: string;
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [enhancementSuggestions, setEnhancementSuggestions] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageForView, setSelectedImageForView] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // Check API key configuration on mount
  useEffect(() => {
    const API_KEY = Constants.expoConfig?.extra?.googleApiKey ||
                   process.env.EXPO_PUBLIC_GOOGLE_API_KEY ||
                   'YOUR_API_KEY_HERE';
    const isConfigured = API_KEY !== 'YOUR_API_KEY_HERE' && !!API_KEY &&
                        API_KEY.length > 30 && API_KEY.startsWith('AIza');
    setApiKeyConfigured(isConfigured);
    console.log('API Key Status:', {
      configured: isConfigured,
      length: API_KEY.length,
      startsWith: API_KEY.substring(0, 10),
      isDefault: API_KEY === 'YOUR_API_KEY_HERE'
    });
  }, []);

  const handleTestApiKey = async () => {
    setTestingApiKey(true);
    try {
      const isValid = await testApiKey();
      if (isValid) {
        Alert.alert(
          '✅ API Key Valid!',
          'Your Gemini API key is working correctly. You can now generate enhanced images.',
          [{ text: 'Great!' }]
        );
        setApiKeyConfigured(true);
      } else {
        Alert.alert(
          '❌ API Key Test Failed',
          'The API responded but didn\'t return the expected result. Please check your API key.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        '❌ API Key Test Failed',
        error.message || 'Unknown error occurred during API key test.',
        [{ text: 'OK' }]
      );
    } finally {
      setTestingApiKey(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
        setCapturedImage(photo.uri);
        if (photo.base64) {
          analyzeImage(photo.base64);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      if (result.assets[0].base64) {
        analyzeImage(result.assets[0].base64);
      }
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setAnalyzing(true);
    setEnhancedImage(null);
    setShowPromptBox(false);
    setEnhancementSuggestions(null);

    try {
      // Call the real Gemini 2.5 Flash API
      const analysisResult = await analyzeProfileImage(base64Image);
      setAnalysis(analysisResult);

      // Show prompt box for enhancement options
      setShowPromptBox(true);
    } catch (error: any) {
      console.error('Analysis error:', error);

      // Provide specific error messages based on error type
      if (error.message?.includes('API key')) {
        Alert.alert(
          'Configuration Error',
          'Please ensure your Gemini API key is set in the .env file.',
          [{ text: 'OK' }]
        );
      } else if (error.message?.includes('quota')) {
        Alert.alert(
          'API Limit',
          'You\'ve reached your API quota limit. Please try again later.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Analysis Failed',
          'The AI couldn\'t analyze this image. Please try a different photo.',
          [{ text: 'Retry', onPress: () => analyzeImage(base64Image) },
           { text: 'Cancel', style: 'cancel' }]
        );
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return colors.green.forest; // Exceptionally performative - dark green
    if (score >= 85) return colors.green.sage;  // Highly performative - medium green
    if (score >= 75) return colors.earth.clay;  // Moderately performative - orange
    if (score >= 65) return colors.pink.primary; // Low performative - pink
    return colors.red;                          // Not performative - red
  };

  const retake = () => {
    setCapturedImage(null);
    setEnhancedImage(null);
    setAnalysis(null);
    setCustomPrompt('');
    setShowPromptBox(false);
  };

  const generateEnhanced = async (imageUri: string) => {
    if (!customPrompt.trim() && !analysis) return;

    setIsEnhancing(true);
    setShowPromptBox(false);

    try {
      const prompt = customPrompt ||
        `Make this EXCEPTIONALLY performative with over-the-top curated aesthetic: matcha latte, labubu doll, Clairo/Laufey vibes, ethereal lighting, vintage elements, perfect staging - target MAX SCORE (95-100)`;

      console.log('Generating with prompt:', prompt);

      // Get base64 from the captured image
      const base64Response = await fetch(capturedImage);
      const blob = await base64Response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (base64) {
          console.log('Starting image generation...');
          const generatedImageData = await generatePerformativeImage(
            base64,
            analysis?.performanceScore || 85,
            prompt
          );
          console.log('Image generation completed, data received:', !!generatedImageData);

          if (generatedImageData) {
            try {
              console.log('Processing generated image data, length:', generatedImageData.length);
              console.log('Data type:', typeof generatedImageData);
              console.log('Data preview:', generatedImageData.substring(0, 50));

              // Validate that we have proper base64 data
              if (!generatedImageData || generatedImageData.length < 100) {
                throw new Error('Generated image data is too short or empty');
              }

              // Check if it looks like base64
              if (!/^[A-Za-z0-9+/]*={0,2}$/.test(generatedImageData)) {
                throw new Error('Generated image data does not appear to be valid base64');
              }

              // Use data URL directly (React Native compatible)
              const dataUrl = `data:image/jpeg;base64,${generatedImageData}`;
              console.log('Using data URL for image display');

              setEnhancedImage(dataUrl);
              setEnhancementSuggestions({
                editingSuggestions: [prompt],
                performanceIncrease: 20,
                aestheticMatch: 98,
                enhancedBio: `MAXIMALLY performative with curated aesthetic - now ${analysis?.performanceScore + 20 || 90}% performative!`,
                vibeAnalysis: `Peak performative aesthetic = EXCEPTIONAL SCORE (${analysis?.performanceScore + 20 || 90})`
              });

              Alert.alert(
                '✨ AI Image Created!',
                `Created new version with: "${prompt}"`,
                [{ text: 'Awesome!', style: 'default' }]
              );
              setIsEnhancing(false);
            } catch (conversionError) {
              console.error('Error converting image data:', conversionError);
              Alert.alert(
                '❌ Image Processing Failed',
                'The AI generated an image but there was an error processing it. This might be due to:\n\n• Image format issues\n• Memory limitations\n• Network timeout\n\nTry again or use a simpler prompt.',
                [
                  { text: 'Retry', onPress: () => generateEnhanced(capturedImage) },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }
          } else {
            // Check if API key is configured
            const API_KEY = Constants.expoConfig?.extra?.googleApiKey || process.env.EXPO_PUBLIC_GOOGLE_API_KEY || 'YOUR_API_KEY_HERE';
            if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
              Alert.alert(
                '❌ API Key Required',
                'Please set up your Google Gemini API key first:\n\n1. Get API key from: https://makersuite.google.com/app/apikey\n2. Update app.json with your key\n3. Restart the app',
                [{ text: 'Got it', style: 'default' }]
              );
            } else {
              let errorMessage = 'Could not generate the enhanced image.';

              if (error.message?.includes('API key')) {
                errorMessage = '❌ API Key Issue:\n\n' + error.message + '\n\nPlease check your API key in app.json';
              } else if (error.message?.includes('quota') || error.message?.includes('QUOTA')) {
                errorMessage = '📊 API Quota Exceeded:\n\nYou\'ve reached your free API quota limit. You may need to:\n• Wait until quota resets\n• Upgrade to paid tier\n• Use a different API key';
              } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage = '🌐 Network Issue:\n\nPlease check your internet connection and try again.';
              } else {
                errorMessage = '❌ Generation Failed:\n\n' + error.message + '\n\nThis might be due to:\n• API service issues\n• Invalid image format\n• Model temporarily unavailable';
              }

              Alert.alert(
                'Generation Failed',
                errorMessage,
                [
                  { text: 'Retry', onPress: () => generateEnhanced(capturedImage) },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
              setIsEnhancing(false);
            }
          }
          setIsEnhancing(false);
        }
      };

    } catch (error) {
      console.error('Enhancement error:', error);
      Alert.alert('Error', 'Failed to enhance image');
      setIsEnhancing(false);
    }
  };

  const saveImage = async (imageUri: string) => {
    if (!mediaLibraryPermission?.granted) {
      const permission = await requestMediaLibraryPermission();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to save images to your device',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setSavingImage(true);
    try {
      // For data URLs, we need to download them first
      if (imageUri.startsWith('data:')) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64data = reader.result?.toString().split(',')[1];
          if (base64data) {
            const fileName = `Preformly_${Date.now()}.jpg`;
            const fileUri = FileSystem.documentDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, base64data, {
              encoding: FileSystem.EncodingType.Base64,
            });

            await MediaLibrary.saveToLibraryAsync(fileUri);
            Alert.alert('✅ Image Saved!', 'Your performative image has been saved to your camera roll');
          }
          setSavingImage(false);
        };

        reader.readAsDataURL(blob);
      } else {
        // For regular file URIs
        await MediaLibrary.saveToLibraryAsync(imageUri);
        Alert.alert('✅ Image Saved!', 'Your performative image has been saved to your camera roll');
        setSavingImage(false);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('❌ Save Failed', 'Could not save image to camera roll');
      setSavingImage(false);
    }
  };

  const openImageViewer = (imageUri: string) => {
    setSelectedImageForView(imageUri);
    setImageViewerVisible(true);
  };

  const createProfile = async () => {
    if (analysis) {
      const profileData = {
        image: capturedImage,
        enhancedImage: enhancedImage,
        performanceScore: analysis.performanceScore,
        traits: analysis.traits,
        lifestyle: analysis.lifestyle,
        matchingTypes: analysis.matchingTypes,
        bio: enhancementSuggestions?.enhancedBio || analysis.bioSuggestion,
        customPrompt: customPrompt,
        enhancementSuggestions: enhancementSuggestions,
        createdAt: new Date().toISOString()
      };

      try {
        // Save to AsyncStorage
        await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
        console.log('Profile saved to AsyncStorage:', profileData);

        Alert.alert(
          '✅ Profile Created!',
          `Your performative score of ${analysis.performanceScore}% has been saved to your profile. ${enhancementSuggestions ? `Performance boost: +${enhancementSuggestions.performanceIncrease || 0} points!` : ''}`,
          [{
            text: 'View Profile',
            onPress: () => {
              // Navigate to profile screen to show the saved data
              // For now, just show a message
              Alert.alert(
                'Profile Saved!',
                'Your profile data has been saved. You can view it on the Profile tab.',
                [{ text: 'OK' }]
              );
            }
          }]
        );
      } catch (error) {
        console.error('Error saving profile:', error);
        Alert.alert(
          '❌ Save Failed',
          'Could not save profile data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.green.sage} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noPermission}>
          <Ionicons name="camera-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.noPermissionText}>Camera access denied</Text>
          <Text style={styles.noPermissionSubtext}>
            Please enable camera access in settings to scan your performance potential
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!capturedImage ? (
        <>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
          <View style={[styles.cameraOverlay, StyleSheet.absoluteFillObject]}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>

              <Text style={styles.instructionText}>
                Position your face in the frame
              </Text>
              <Text style={styles.subInstructionText}>
                AI will analyze your performative potential
              </Text>
            </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={pickImage}
            >
              <Ionicons name="images" size={28} color={colors.text.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            >
              <Ionicons name="camera-reverse" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
          {/* Prominent Score Display */}
          <View style={styles.scoreHeader}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardTitle}>Performance Score</Text>
              <Text style={[styles.scoreCardValue, { color: getScoreColor(analysis?.performanceScore || 85) }]}>
                {analysis?.performanceScore || 85}
              </Text>
              <Text style={styles.scoreCardSubtitle}>
                {analysis?.performanceScore >= 95 ? 'Peak Performative' :
                 analysis?.performanceScore >= 85 ? 'Highly Performative' :
                 analysis?.performanceScore >= 75 ? 'Moderately Performative' :
                 analysis?.performanceScore >= 65 ? 'Low Performative' :
                 'Not Performative'}
              </Text>
            </View>
          </View>

          <View style={styles.imageVerticalContainer}>
            <TouchableOpacity onPress={() => openImageViewer(capturedImage!)} style={styles.imageContainer}>
              <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
              <View style={styles.imageOverlay}>
                <Ionicons name="expand" size={24} color={colors.white} />
                <Text style={styles.imageOverlayText}>Tap to view</Text>
              </View>
            </TouchableOpacity>

            {enhancedImage && (
              <>
                <View style={styles.imageComparisonArrow}>
                  <Ionicons name="arrow-down" size={32} color={colors.white} />
                </View>
                <TouchableOpacity
                  style={styles.imageContainerWithActions}
                  onPress={() => openImageViewer(enhancedImage)}
                >
                  <Image source={{ uri: enhancedImage }} style={styles.capturedImage} />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="expand" size={24} color={colors.white} />
                    <Text style={styles.imageOverlayText}>Tap to view</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => saveImage(enhancedImage)}
                    disabled={savingImage}
                  >
                    <Ionicons
                      name={savingImage ? "cloud-download" : "download"}
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.saveButtonText}>
                      {savingImage ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </>
            )}
          </View>

          {generatingImage && (
            <View style={styles.generatingContainer}>
              <ActivityIndicator size="small" color={colors.green.sage} />
              <Text style={styles.generatingText}>Analyzing your photo...</Text>
            </View>
          )}

          {analyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={colors.green.sage} />
              <Text style={styles.analyzingText}>Analyzing performative signals...</Text>
              <Text style={styles.analyzingSubtext}>Using real AI to detect networking potential</Text>
            </View>
          ) : analysis && (
            <View style={styles.analysisContainer}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Performance Score</Text>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(analysis.performanceScore) }]}>
                  <Text style={styles.scoreValue}>{analysis.performanceScore}</Text>
                </View>
              </View>

              {analysis.warning && (
                <View style={styles.warningContainer}>
                  <MaterialIcons name="warning" size={20} color={colors.earth.clay} />
                  <Text style={styles.warningText}>{analysis.warning}</Text>
                </View>
              )}

              {!apiKeyConfigured && (
                <View style={styles.apiKeyWarning}>
                  <Ionicons name="warning" size={20} color={colors.earth.clay} />
                  <Text style={styles.apiKeyWarningText}>
                    ❌ API Key Required: Your key in app.json is still the placeholder text
                  </Text>
                  <View style={styles.apiKeyButtons}>
                    <TouchableOpacity
                      style={styles.setupButton}
                    onPress={() => {
                      Alert.alert(
                        '🔑 API Key Setup Guide',
                        '1. Go to: https://makersuite.google.com/app/apikey\n2. Click "Create API key" (or "Get started")\n3. Copy the long key (starts with "AIza..." - about 39 characters)\n4. Edit app.json and replace "YOUR_GOOGLE_API_KEY_HERE" with your key\n5. Save app.json and restart the app\n\n⚠️ Make sure to restart the app after updating app.json!',
                        [{ text: 'Got it' }]
                      );
                    }}
                    >
                      <Text style={styles.setupButtonText}>Setup Guide</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.testButton, testingApiKey && styles.testButtonDisabled]}
                    onPress={handleTestApiKey}
                    disabled={testingApiKey}
                  >
                    <Text style={styles.testButtonText}>
                      {testingApiKey ? 'Testing...' : 'Test Key'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => {
                      const API_KEY = Constants.expoConfig?.extra?.googleApiKey ||
                                     process.env.EXPO_PUBLIC_GOOGLE_API_KEY ||
                                     'YOUR_API_KEY_HERE';
                      Alert.alert(
                        '🔍 Current API Key',
                        `Length: ${API_KEY.length} characters\nStarts with: "${API_KEY.substring(0, 15)}..."`,
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Text style={styles.checkButtonText}>Check Current</Text>
                  </TouchableOpacity>
                  </View>
                </View>
              )}

              {showPromptBox && !enhancedImage && (
                <View style={styles.promptSection}>
                  <Text style={styles.sectionTitle}>✨ Make It More Performative</Text>
                  <Text style={styles.promptLabel}>Choose a style or describe what to add to your photo:</Text>
                  <Text style={styles.scoringHint}>
                    💡 Harsh Scoring: Soft/feminine = MAX (95-100) | Agile/rough = LOW (50-64)
                  </Text>

                  <View style={styles.suggestionChips}>
                    <TouchableOpacity
                      style={styles.chip}
                      onPress={() => setCustomPrompt('Add matcha latte, vintage film camera, soft natural lighting, ethereal glow, perfect staging - MAX SCORE (98+)')}
                    >
                      <Text style={styles.chipText}>☕ Peak Performative (98+)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.chip}
                      onPress={() => setCustomPrompt('Add labubu doll, cozy sweater, Clairo/Laufey indie vibes, dreamy aesthetic, influencer setup - MAX SCORE (95+)')}
                    >
                      <Text style={styles.chipText}>🧸 Instagram Ready (95+)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.chip}
                      onPress={() => setCustomPrompt('Add tech conference lanyard, MacBook, startup office with curated background - HIGH SCORE (85-90)')}
                    >
                      <Text style={styles.chipText}>💻 Tech Bro Aesthetic (85-90)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.chip}
                      onPress={() => setCustomPrompt('Add Patagonia vest, AirPods, coffee shop - keep it rough and unpolished, missing key elements - LOW SCORE (55-65)')}
                    >
                      <Text style={styles.chipText}>🎒 Authentic Fail (55-65)</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.promptInput}
                    placeholder="e.g., Soft/feminine = MAX score (95+), Agile/rough = LOW score (50-64)"
                    placeholderTextColor={colors.text.tertiary}
                    value={customPrompt}
                    onChangeText={setCustomPrompt}
                    multiline
                    numberOfLines={3}
                  />

                  <TouchableOpacity
                    style={[styles.generateButton, (isEnhancing || !apiKeyConfigured) && styles.generateButtonDisabled]}
                    onPress={() => !isEnhancing && apiKeyConfigured && generateEnhanced(capturedImage)}
                    disabled={isEnhancing || !apiKeyConfigured}
                  >
                    <Text style={styles.generateButtonText}>
                      {isEnhancing ? 'Creating AI Image...' : !apiKeyConfigured ? 'Setup API Key First' : 'Create Enhanced Photo'}
                    </Text>
                    {!isEnhancing && <Ionicons name="sparkles" size={20} color={colors.white} />}
                    {isEnhancing && <ActivityIndicator size="small" color={colors.white} style={{ marginLeft: 8 }} />}
                  </TouchableOpacity>
                </View>
              )}

              {isEnhancing && (
                <View style={styles.enhancingContainer}>
                  <ActivityIndicator size="large" color={colors.green.sage} />
                  <Text style={styles.enhancingText}>Creating your AI image...</Text>
                  <Text style={styles.enhancingSubtext}>{customPrompt || 'Adding elements to your photo'}</Text>
                </View>
              )}

              {enhancedImage && !isEnhancing && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>✨ AI-Generated Version</Text>
                  <Text style={styles.enhancedText}>
                    Original photo edited with: {customPrompt || 'AI magic'}
                  </Text>
                  <TouchableOpacity
                    style={styles.regenerateButton}
                    onPress={() => {
                      setEnhancedImage(null);
                      setShowPromptBox(true);
                    }}
                  >
                    <Text style={styles.regenerateButtonText}>Try Different Edit</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detected Traits</Text>
                <View style={styles.traitsContainer}>
                  {analysis.traits.map((trait, index) => (
                    <View key={index} style={styles.traitBadge}>
                      <Text style={styles.traitText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lifestyle Analysis</Text>
                <Text style={styles.lifestyleText}>{analysis.lifestyle}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Best Matches</Text>
                {analysis.matchingTypes.map((type, index) => (
                  <View key={index} style={styles.matchType}>
                    <Ionicons name="heart" size={16} color={colors.pink.primary} />
                    <Text style={styles.matchTypeText}>{type}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AI-Generated Bio</Text>
                <View style={styles.bioContainer}>
                  <Text style={styles.bioText}>{analysis.bioSuggestion}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.retakeButton} onPress={retake}>
                  <Ionicons name="camera" size={20} color={colors.text.primary} />
                  <Text style={styles.retakeButtonText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.createProfileButton} onPress={createProfile}>
                  <Text style={styles.createProfileButtonText}>Create Profile</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImageViewerVisible(false)}
          >
            <Ionicons name="close" size={30} color={colors.white} />
          </TouchableOpacity>

          {selectedImageForView && (
            <Image
              source={{ uri: selectedImageForView }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}

          <View style={styles.modalInfo}>
            <Text style={styles.modalImageLabel}>
              {selectedImageForView === capturedImage ? 'Original Image' : 'AI Enhanced Image'}
            </Text>
            {selectedImageForView === enhancedImage && enhancementSuggestions && (
              <Text style={styles.modalEnhancementInfo}>
                Enhanced with: {enhancementSuggestions.editingSuggestions?.[0]}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.green.sage,
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 40,
    textAlign: 'center',
  },
  subInstructionText: {
    color: colors.gray[400],
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.green.sage,
  },
  noPermission: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noPermissionText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 20,
  },
  noPermissionSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 10,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingBottom: 100, // Extra space for bottom nav
  },
  scoreHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  scoreCard: {
    backgroundColor: colors.white,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 200,
  },
  scoreCardTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  scoreCardValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreCardSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 15,
    marginTop: 0,
  },
  imageVerticalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 15,
    marginTop: 0,
  },
  capturedImage: {
    width: 280,
    height: 200,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  imageComparisonArrow: {
    padding: 15,
    backgroundColor: colors.green.sage,
    borderRadius: 30,
    alignSelf: 'center',
    marginVertical: 10,
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  imageContainerWithActions: {
    position: 'relative',
  },
  saveButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.green.forest,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    opacity: 0.9,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
    backgroundColor: colors.green.pale,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  generatingText: {
    fontSize: 14,
    color: colors.green.forest,
    fontWeight: '500',
  },
  analyzingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 20,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
  analysisContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  scoreBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.earth.sand,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: colors.earth.bark,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  enhancedText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitBadge: {
    backgroundColor: colors.green.pale,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  traitText: {
    fontSize: 14,
    color: colors.green.forest,
    fontWeight: '500',
  },
  lifestyleText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  matchType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  matchTypeText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  bioContainer: {
    backgroundColor: colors.gray[100],
    padding: 16,
    borderRadius: 12,
  },
  bioText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 25,
    marginBottom: 120, // Extra space for bottom nav
    paddingHorizontal: 20,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.gray[300],
    gap: 8,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  createProfileButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green.sage,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  createProfileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: colors.green.sage,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  promptSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
  },
  promptLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  scoringHint: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  chipText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '500',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  imageOverlayText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  promptInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: colors.green.sage,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  generateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  regenerateButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.green.sage,
    alignSelf: 'center',
  },
  regenerateButtonText: {
    color: colors.green.sage,
    fontSize: 14,
    fontWeight: '500',
  },
  enhancingContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  enhancingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  enhancingSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  apiKeyWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.earth.sand,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  apiKeyWarningText: {
    flex: 1,
    fontSize: 12,
    color: colors.earth.bark,
    fontWeight: '500',
  },
  setupButton: {
    backgroundColor: colors.green.sage,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  setupButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  apiKeyButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  testButton: {
    backgroundColor: colors.green.forest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  checkButton: {
    backgroundColor: colors.gray[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  checkButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalImage: {
    width: '90%',
    height: '70%',
    borderRadius: 12,
  },
  modalInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 12,
  },
  modalImageLabel: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalEnhancementInfo: {
    color: colors.white,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.9,
  },
});