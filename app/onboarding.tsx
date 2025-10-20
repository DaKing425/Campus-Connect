/* eslint-disable jsx-a11y/alt-text, react/no-unescaped-entities */
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth/AuthProvider';
import { supabase } from '../lib/supabase/client';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

export default function OnboardingScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);
  const [interests, setInterests] = useState<string[]>([]); // Implement as multi-select chips
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in.');
      return;
    }
    if (!name) {
      Alert.alert('Missing Info', 'Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarUrl && avatarUrl.startsWith('file://')) {
        // Only upload if it's a new local image
        finalAvatarUrl = await uploadImage(avatarUrl);
        if (!finalAvatarUrl) {
          setLoading(false);
          return;
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: name,
            avatar_url: finalAvatarUrl,
            interests: interests, // Save interests
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (profileError) throw profileError;

      // Update user metadata in Supabase Auth
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: { full_name: name, avatar_url: finalAvatarUrl },
      });

      if (userUpdateError) throw userUpdateError;

      Alert.alert('Success', 'Profile updated successfully!');
      router.replace('/events'); // Redirect to main app
    } catch (error: any) {
      Alert.alert('Error saving profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant media library permissions to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Ensure this bucket exists in Supabase Storage
        .upload(filePath, blob, {
          contentType: blob.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      Alert.alert('Image Upload Error', error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4B2E83" />
        <Text className="mt-4 text-uw-purple">Loading user data...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <Text>Please sign in to complete onboarding.</Text>;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <ScrollView className="flex-1">
        <Text className="text-2xl font-bold text-uw-purple mb-6">Complete Your Profile</Text>

        <View className="items-center mb-6">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} accessibilityLabel="User avatar" className="w-24 h-24 rounded-full bg-gray-200" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
              <Text className="text-gray-500">No Avatar</Text>
            </View>
          )}
          <Button title="Change Avatar" onPress={pickImage} color="#B7A57A" className="mt-4" />
        </View>

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          className="mb-4 bg-white"
          mode="outlined"
        />

        {/* Interests selection (implement as multi-select chips) */}
        <Text className="text-lg font-semibold text-uw-purple mb-2">Your Interests</Text>
  <Text className="text-gray-600 mb-4">Select topics you&#39;re interested in (e.g., &quot;Tech&quot;, &quot;Sports&quot;)</Text>
        {/* Placeholder for interest chips */}
        <View className="flex-row flex-wrap mb-6">
          {['Tech', 'Sports', 'Arts', 'Academics', 'Social', 'Volunteering'].map((interest) => (
            <TouchableOpacity
              key={interest}
              onPress={() => {
                setInterests((prev) =>
                  prev.includes(interest)
                    ? prev.filter((i) => i !== interest)
                    : [...prev, interest]
                );
              }}
              className={`px-4 py-2 m-1 rounded-full ${
                interests.includes(interest) ? 'bg-uw-purple' : 'bg-gray-200'
              }`}
            >
              <Text className={`${interests.includes(interest) ? 'text-white' : 'text-gray-700'}`}>
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={loading ? 'Saving...' : 'Save Profile'}
          onPress={handleSaveProfile}
          disabled={loading}
          color="#4B2E83"
        />
        {loading && <ActivityIndicator size="small" color="#4B2E83" className="mt-4" />}
      </ScrollView>
    </SafeAreaView>
  );
}