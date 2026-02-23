import { listCuisines } from '@/lib/services/cuisines';
import { listNeighborhoods } from '@/lib/services/neighborhoods';
import { getRandomPlace } from '@/lib/services/places';
import type { Cuisine, Neighborhood, Place } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

export default function RandomScreen() {
  const [pick, setPick] = useState<Place | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | undefined>();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | undefined>();

  const loadFilters = useCallback(async () => {
    try {
      const [c, n] = await Promise.all([listCuisines(), listNeighborhoods()]);
      setCuisines(c);
      setNeighborhoods(n);
    } catch (e) {
      console.error('Failed to load filters:', e);
    }
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  const handleSpin = async () => {
    setSpinning(true);
    setHasSpun(true);
    try {
      const result = await getRandomPlace({
        cuisine: selectedCuisine,
        neighborhood: selectedNeighborhood,
      });
      setPick(result);
    } catch (e) {
      console.error('Failed to get random place:', e);
      setPick(null);
    } finally {
      setSpinning(false);
    }
  };

  const openMaps = () => {
    if (pick?.mapsUrl) {
      Linking.openURL(pick.mapsUrl).catch(() =>
        Alert.alert('Error', 'Could not open maps link.'),
      );
    }
  };

  const openReel = () => {
    if (pick?.reelUrl) {
      Linking.openURL(pick.reelUrl).catch(() =>
        Alert.alert('Error', 'Could not open reel link.'),
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pb-3 pt-14">
        <Text className="text-2xl font-bold text-gray-900">Random Place</Text>
        <Text className="mt-1 text-sm text-gray-400">
          Can't decide? Let fate pick a place from your list!
        </Text>
      </View>

      {/* Filters */}
      <View className="bg-white px-5 pb-4 pt-2">
        <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          Optionally narrow it down
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {cuisines.map((c) => (
            <Pressable
              key={c.$id}
              onPress={() =>
                setSelectedCuisine(selectedCuisine === c.name ? undefined : c.name)
              }
              className={`rounded-full px-4 py-2 ${selectedCuisine === c.name ? 'bg-indigo-500' : 'bg-gray-100'}`}
            >
              <Text
                className={`text-sm font-medium ${selectedCuisine === c.name ? 'text-white' : 'text-gray-600'}`}
              >
                {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 mt-2"
        >
          {neighborhoods.map((n) => (
            <Pressable
              key={n.$id}
              onPress={() =>
                setSelectedNeighborhood(
                  selectedNeighborhood === n.name ? undefined : n.name,
                )
              }
              className={`rounded-full px-4 py-2 ${selectedNeighborhood === n.name ? 'bg-indigo-500' : 'bg-gray-100'}`}
            >
              <Text
                className={`text-sm font-medium ${selectedNeighborhood === n.name ? 'text-white' : 'text-gray-600'}`}
              >
                {n.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Result area */}
      <View className="flex-1 items-center justify-center px-6">
        {spinning ? (
          <View className="items-center">
            <ActivityIndicator size="large" color="#6366f1" />
            <Text className="mt-4 text-base text-gray-400">Picking...</Text>
          </View>
        ) : pick ? (
          <View className="w-full rounded-3xl border border-gray-100 bg-white p-6">
            <View className="mb-4 items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <Ionicons name="restaurant" size={28} color="#6366f1" />
              </View>
            </View>
            <Text className="text-center text-2xl font-bold text-gray-900">
              {pick.name}
            </Text>
            <View className="mt-2 flex-row items-center justify-center gap-2">
              <Text className="text-sm text-gray-500">{pick.cuisine}</Text>
              <Text className="text-gray-300">•</Text>
              <Text className="text-sm text-gray-500">{pick.neighborhood}</Text>
            </View>
            {pick.notes && (
              <Text className="mt-3 text-center text-sm text-gray-400">
                {pick.notes}
              </Text>
            )}

            {/* Action links */}
            <View className="mt-5 flex-row justify-center gap-4">
              {pick.mapsUrl && (
                <Pressable
                  onPress={openMaps}
                  className="flex-row items-center rounded-full bg-indigo-50 px-5 py-2.5"
                >
                  <Ionicons name="map-outline" size={16} color="#6366f1" />
                  <Text className="ml-2 text-sm font-medium text-indigo-600">
                    Open Maps
                  </Text>
                </Pressable>
              )}
              {pick.reelUrl && (
                <Pressable
                  onPress={openReel}
                  className="flex-row items-center rounded-full bg-pink-50 px-5 py-2.5"
                >
                  <Ionicons name="play-circle-outline" size={16} color="#ec4899" />
                  <Text className="ml-2 text-sm font-medium text-pink-600">
                    Watch Reel
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : hasSpun ? (
          <View className="items-center">
            <Ionicons name="sad-outline" size={48} color="#d1d5db" />
            <Text className="mt-4 text-center text-base text-gray-400">
              No places match your filters.{'\n'}Try removing a filter or add more
              places!
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <Ionicons name="dice-outline" size={64} color="#d1d5db" />
            <Text className="mt-4 text-center text-base text-gray-400">
              Tap the button to pick a random place{'\n'}from your "Want to go"
              list!
            </Text>
          </View>
        )}
      </View>

      {/* Spin button */}
      <View className="px-6 pb-10">
        <Pressable
          onPress={handleSpin}
          disabled={spinning}
          className="items-center rounded-2xl bg-indigo-500 py-4"
          style={{ opacity: spinning ? 0.6 : 1 }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="dice" size={20} color="#fff" />
            <Text className="text-base font-semibold text-white">
              {pick ? 'Spin Again' : 'Spin the Wheel'}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}