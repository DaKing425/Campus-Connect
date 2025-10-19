import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Club } from '../../types/clubs';

interface ClubCardProps {
  club: Club;
  className?: string;
}

export default function ClubCard({ club, className }: ClubCardProps) {
  return (
    <TouchableOpacity className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <Text className="text-lg font-bold text-uw-purple mb-2">{club.name}</Text>
      <Text className="text-gray-600 mb-2">{club.description?.substring(0, 100)}...</Text>
    </TouchableOpacity>
  );
}
