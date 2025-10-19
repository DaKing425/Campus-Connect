import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Button, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; // You might need to install this: npm install @react-native-picker/picker

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(''); // Use a date picker component in a real app
  const [endDate, setEndDate] = useState('');     // Use a date picker component in a real app
  const [locationName, setLocationName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createEventMutation = useMutation({
    mutationFn: async (newEvent: {
      title: string;
      description: string;
      start_date: string;
      end_date: string;
      location_name: string;
      capacity: number;
      cover_image_url?: string;
    }) => {
      const { data, error } = await supabase.from('events').insert(newEvent).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      Alert.alert('Success', 'Event created successfully!');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create event.');
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant media library permissions to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images') // Ensure this bucket exists in Supabase Storage
        .upload(filePath, blob, {
          contentType: blob.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('event-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      Alert.alert('Image Upload Error', error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !startDate || !endDate || !locationName || !capacity) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    let imageUrl: string | undefined;
    if (coverImage) {
      imageUrl = await uploadImage(coverImage);
      if (!imageUrl) {
        setLoading(false);
        return; // Image upload failed
      }
    }

    createEventMutation.mutate({
      title,
      description,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      location_name: locationName,
      capacity: parseInt(capacity),
      cover_image_url: imageUrl,
    });
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-uw-purple mb-6">Create New Event</Text>

        <TextInput
          label="Event Title"
          value={title}
          onChangeText={setTitle}
          className="mb-4 bg-white"
          mode="outlined"
        />
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          className="mb-4 bg-white"
          mode="outlined"
        />
        {/* In a real app, use proper date/time pickers */}
        <TextInput
          label="Start Date & Time (YYYY-MM-DD HH:MM)"
          value={startDate}
          onChangeText={setStartDate}
          className="mb-4 bg-white"
          mode="outlined"
        />
        <TextInput
          label="End Date & Time (YYYY-MM-DD HH:MM)"
          value={endDate}
          onChangeText={setEndDate}
          className="mb-4 bg-white"
          mode="outlined"
        />
        <TextInput
          label="Location Name"
          value={locationName}
          onChangeText={setLocationName}
          className="mb-4 bg-white"
          mode="outlined"
        />
        <TextInput
          label="Capacity"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
          className="mb-4 bg-white"
          mode="outlined"
        />

        <Button title="Pick Cover Image" onPress={pickImage} color="#B7A57A" />
        {coverImage && <Text className="mt-2 text-gray-600">Image selected: {coverImage.split('/').pop()}</Text>}

        <View className="mt-6">
          <Button
            title={loading || createEventMutation.isPending ? 'Creating...' : 'Submit Event'}
            onPress={handleSubmit}
            disabled={loading || createEventMutation.isPending}
            color="#4B2E83"
          />
        </View>

        {(loading || createEventMutation.isPending) && (
          <ActivityIndicator size="small" color="#4B2E83" className="mt-4" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}