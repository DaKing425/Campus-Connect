import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Button, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase/client';
import { Event } from '../../types/events';
import { MapPin, Calendar as CalendarIcon, Users, Clock, ExternalLink } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { formatEventDateTime, getEventDuration } from '../../lib/utils';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();

  const fetchEventDetails = async (eventId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data as Event;
  };

  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEventDetails(id as string),
    enabled: !!id,
  });

  const handleOpenInMaps = () => {
    if (event?.location_lat && event?.location_lng) {
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${event.location_lat},${event.location_lng}`;
      const label = event.location_name || 'Event Location';
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });
      Linking.openURL(url!);
    } else if (event?.location_name) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location_name)}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Location Missing', 'No map location available for this event.');
    }
  };

  const handleAddToCalendar = () => {
    // Implement ICS share or expo-calendar integration here
    Alert.alert('Add to Calendar', 'This feature is coming soon!');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4B2E83" />
        <Text className="mt-4 text-uw-purple">Loading event details...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-red-500 text-center">Error loading event: {error?.message}</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-gray-500">Event not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-bold text-uw-purple mb-2">{event.title}</Text>
        <Text className="text-lg text-gray-700 mb-4">by {event.club_id}</Text> {/* Assuming club_id can be displayed */}

        <View className="flex-row items-center mb-2">
          <CalendarIcon size={18} color="#4B2E83" className="mr-2" />
          <Text className="text-gray-600">{formatEventDateTime(event.start_date)} - {formatEventDateTime(event.end_date)}</Text>
        </View>
        <View className="flex-row items-center mb-2">
          <Clock size={18} color="#4B2E83" className="mr-2" />
          <Text className="text-gray-600">{getEventDuration(event.start_date, event.end_date)}</Text>
        </View>
        <View className="flex-row items-center mb-4">
          <MapPin size={18} color="#4B2E83" className="mr-2" />
          <Text className="text-gray-600">{event.location_name} {event.room ? `(${event.room})` : ''}</Text>
        </View>

        <Text className="text-gray-800 text-base mb-6">{event.description}</Text>

        <View className="flex-row justify-around mb-6">
          <Button title="RSVP" onPress={() => Alert.alert('RSVP', 'RSVP functionality coming soon!')} color="#4B2E83" />
          <Button title="Open in Maps" onPress={handleOpenInMaps} color="#B7A57A" />
          <Button title="Add to Calendar" onPress={handleAddToCalendar} color="#B7A57A" />
        </View>

        {/* Related events (stub) */}
        <Text className="text-xl font-bold text-uw-purple mb-4">You might like</Text>
        <Text className="text-gray-500">Related events coming soon...</Text>
      </ScrollView>
    </SafeAreaView>
  );
}