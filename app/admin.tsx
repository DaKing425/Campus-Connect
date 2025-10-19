import React from 'react';
import { View, Text, ScrollView, Button, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import { Event } from '../types/events';

export default function AdminDashboardScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Check if the user is an admin (implement role logic based on your profiles table)
  const isAdmin = user?.email?.endsWith('@uw.edu') && user?.email?.includes('admin'); // Placeholder for actual role check

  const fetchPendingEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Event[];
  };

  const { data: pendingEvents, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['pendingEvents'],
    queryFn: fetchPendingEvents,
    enabled: isAdmin, // Only fetch if user is admin
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ eventId, status, reason }: { eventId: string; status: 'approved' | 'rejected' | 'removed'; reason?: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      // Optionally, insert into audit_log
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: `Event ${status}`,
        entity_type: 'events',
        entity_id: eventId,
        details: reason ? { reason } : {},
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingEvents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] }); // Invalidate main event feed
      Alert.alert('Success', 'Event status updated.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update event status.');
    },
  });

  const handleApprove = (eventId: string) => {
    Alert.alert(
      'Approve Event',
      'Are you sure you want to approve this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => updateEventStatusMutation.mutate({ eventId, status: 'approved' }) },
      ]
    );
  };

  const handleReject = (eventId: string) => {
    Alert.prompt(
      'Reject Event',
      'Enter reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: (reason) => updateEventStatusMutation.mutate({ eventId, status: 'rejected', reason }),
        },
      ],
      'plain-text'
    );
  };

  if (authLoading || isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4B2E83" />
        <Text className="mt-4 text-uw-purple">Loading admin dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-xl font-bold text-red-500 text-center">Access Denied</Text>
        <Text className="text-gray-600 text-center mt-2">You do not have administrative privileges to view this page.</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-red-500 text-center">Error loading pending events: {error?.message}</Text>
        <Button title="Try Again" onPress={() => refetch()} color="#4B2E83" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <ScrollView className="flex-1">
        <Text className="text-2xl font-bold text-uw-purple mb-6">Admin Moderation Queue</Text>

        {pendingEvents?.length === 0 ? (
          <Text className="text-center text-gray-500 mt-8">No pending events for moderation.</Text>
        ) : (
          pendingEvents?.map((event) => (
            <View key={event.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <Text className="text-xl font-bold text-gray-800 mb-2">{event.title}</Text>
              <Text className="text-gray-600 mb-2">By: {event.created_by}</Text> {/* Assuming created_by exists */}
              <Text className="text-gray-600 mb-4">{event.description?.substring(0, 100)}...</Text>
              <View className="flex-row justify-around">
                <Button title="Approve" onPress={() => handleApprove(event.id)} color="green" />
                <Button title="Reject" onPress={() => handleReject(event.id)} color="orange" />
                <Button title="Remove" onPress={() => Alert.alert('Remove', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Remove', onPress: () => updateEventStatusMutation.mutate({ eventId: event.id, status: 'removed', reason: 'Admin removed' }) }])} color="red" />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}