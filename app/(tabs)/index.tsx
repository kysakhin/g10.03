import PlaceCard from '@/components/PlaceCard';
import { PLACE_STATUS } from '@/lib/constants';
import { deletePlace, listPlaces, markAsVisited, updatePlace } from '@/lib/services/places';
import type { Place } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'want_to_go' | 'visited'>('all');

  const loadPlaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listPlaces();
      setPlaces(data);
    } catch (e) {
      console.error('Failed to load places:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlaces();
    }, [loadPlaces]),
  );

  const filteredPlaces = places.filter((p) => {
    if (tab === 'all') return true;
    return p.status === tab;
  });

  const handleDelete = (place: Place) => {
    Alert.alert('Delete', `Remove "${place.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePlace(place.$id);
          loadPlaces();
        },
      },
    ]);
  };

  const handleToggleStatus = async (place: Place) => {
    if (place.status === PLACE_STATUS.WANT_TO_GO) {
      await markAsVisited(place.$id);
    } else {
      await updatePlace(place.$id, { status: PLACE_STATUS.WANT_TO_GO });
    }
    loadPlaces();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pb-3 pt-14">
        <Text className="text-2xl font-bold text-gray-900">Your Places</Text>
        <Text className="mt-1 text-sm text-gray-400">
          {places.length} saved · {places.filter((p) => p.status === PLACE_STATUS.WANT_TO_GO).length} to visit
        </Text>
      </View>

      {/* Filter tabs */}
      <View className="flex-row gap-2 bg-white px-5 pb-3">
        {(['all', 'want_to_go', 'visited'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`rounded-full px-4 py-2 ${tab === t ? 'bg-indigo-500' : 'bg-gray-100'}`}
          >
            <Text
              className={`text-sm font-medium ${tab === t ? 'text-white' : 'text-gray-600'}`}
            >
              {t === 'all' ? 'All' : t === 'want_to_go' ? 'Want to go' : 'Visited'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : filteredPlaces.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons name="restaurant-outline" size={48} color="#d1d5db" />
          <Text className="mt-4 text-center text-base text-gray-400">
            {tab === 'all'
              ? 'No places saved yet.\nTap + to add your first one!'
              : 'No places in this category.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.$id}
          contentContainerClassName="px-4 pt-3 pb-24"
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              onPress={() => router.push({ pathname: '/add-place', params: { id: item.$id } })}
              onDelete={() => handleDelete(item)}
              onToggleStatus={() => handleToggleStatus(item)}
            />
          )}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/add-place')}
        className="absolute bottom-24 right-5 h-14 w-14 items-center justify-center rounded-full bg-indigo-500 shadow-lg"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}
