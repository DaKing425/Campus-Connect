import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Event } from '../../types/events';

interface EventCardProps {
  event: Event;
  className?: string;
}

export default function EventCard({ event, className }: EventCardProps) {
  return (
    <TouchableOpacity className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <Text className="text-lg font-bold text-uw-purple mb-2">{event.title}</Text>
      <Text className="text-gray-600 mb-2">{event.description?.substring(0, 100)}...</Text>
      <Text className="text-sm text-gray-500">{event.location_name}</Text>
    </TouchableOpacity>
  );
}
