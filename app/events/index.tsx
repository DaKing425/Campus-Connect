import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase/client';
import { Event } from '../../types/events';
import EventCard from '../../components/events/EventCard';
import { TextInput } from 'react-native-paper';
import { Filter } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export default function EventFeedScreen() {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({}); // Implement filter state later

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data as Event[];
  };

  const { data: events, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['events', filters, searchText],
    queryFn: fetchEvents,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4B2E83" />
        <Text className="mt-4 text-uw-purple">Loading events...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-red-500 text-center">Error loading events: {error?.message}</Text>
        <TouchableOpacity onPress={() => refetch()} className="mt-4 p-2 bg-uw-purple rounded-md">
          <Text className="text-white">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4 bg-white border-b border-gray-200 flex-row items-center">
        <TextInput
          placeholder="Search events..."
          value={searchText}
          onChangeText={setSearchText}
          className="flex-1 mr-2 p-2 border border-gray-300 rounded-md"
          mode="outlined"
          left={<TextInput.Icon icon="magnify" />}
        />
        <TouchableOpacity onPress={() => { /* Open filter sheet */ }} className="p-3 bg-uw-gold rounded-md">
          <Filter size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#4B2E83']} />
        }
      >
        {events?.length === 0 ? (
          <Text className="text-center text-gray-500 mt-8">No events found.</Text>
        ) : (
          events?.map((event) => <EventCard key={event.id} event={event} className="mb-4" />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}