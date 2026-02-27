import PlaceCard from '@/components/PlaceCard';
import { PLACE_STATUS } from '@/lib/constants';
import { listCuisines } from '@/lib/services/cuisines';
import { listNeighborhoods } from '@/lib/services/neighborhoods';
import { listPlacesFiltered, markAsVisited, updatePlace } from '@/lib/services/places';
import type { Cuisine, Neighborhood, Place } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function SearchScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | undefined>();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  const loadFilters = useCallback(async () => {
    try {
      const [c, n] = await Promise.all([listCuisines(), listNeighborhoods()]);
      setCuisines(c);
      setNeighborhoods(n);
    } catch (e) {
      console.error('Failed to load filters:', e);
    }
  }, []);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPlacesFiltered({
        cuisine: selectedCuisine,
        neighborhood: selectedNeighborhood,
        status: selectedStatus as any,
      });
      setPlaces(data);
    } catch (e) {
      console.error('Failed to load places:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedCuisine, selectedNeighborhood, selectedStatus]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  // Client-side text filter on top of Appwrite query filters
  const filteredPlaces = places.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.cuisine.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      (p.notes?.toLowerCase().includes(q) ?? false)
    );
  });

  const clearFilters = () => {
    setSelectedCuisine(undefined);
    setSelectedNeighborhood(undefined);
    setSelectedStatus(undefined);
    setSearch('');
  };

  const hasFilters = selectedCuisine || selectedNeighborhood || selectedStatus || search;

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
        <Text className="text-2xl font-bold text-gray-900">Search</Text>
      </View>

      {/* Search bar */}
      <View className="bg-white px-5">
        <View className="flex-row items-center rounded-xl bg-gray-100 px-4 py-2.5">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            className="ml-2 flex-1 text-base text-gray-900"
            placeholder="Search by name, cuisine, area..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9ca3af"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filter chips */}
      <View className="bg-white min-h-16">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5 py-3 gap-2"
        >
          {/* Status chips */}
          <FilterChip
            label="Want to go"
            active={selectedStatus === PLACE_STATUS.WANT_TO_GO}
            onPress={() =>
              setSelectedStatus(
                selectedStatus === PLACE_STATUS.WANT_TO_GO ? undefined : PLACE_STATUS.WANT_TO_GO,
              )
            }
          />
          <FilterChip
            label="Visited"
            active={selectedStatus === PLACE_STATUS.VISITED}
            onPress={() =>
              setSelectedStatus(
                selectedStatus === PLACE_STATUS.VISITED ? undefined : PLACE_STATUS.VISITED,
              )
            }
          />
          <View className="mx-1 w-px bg-gray-200 self-stretch" />
          {/* Cuisine chips */}
          {cuisines.map((c) => (
            <FilterChip
              key={c.$id}
              label={c.name}
              active={selectedCuisine === c.name}
              onPress={() => setSelectedCuisine(selectedCuisine === c.name ? undefined : c.name)}
            />
          ))}
          <View className="mx-1 w-px bg-gray-200 self-stretch" />
          {/* Neighborhood chips */}
          {neighborhoods.map((n) => (
            <FilterChip
              key={n.$id}
              label={n.name}
              active={selectedNeighborhood === n.name}
              onPress={() =>
                setSelectedNeighborhood(selectedNeighborhood === n.name ? undefined : n.name)
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Clear filters */}
      {hasFilters && (
        <Pressable onPress={clearFilters} className="flex-row items-center bg-white px-5 pb-2">
          <Ionicons name="close" size={14} color="#6366f1" />
          <Text className="ml-1 text-sm font-medium text-indigo-500">Clear filters</Text>
        </Pressable>
      )}

      {/* Results */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : filteredPlaces.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons name="search-outline" size={48} color="#d1d5db" />
          <Text className="mt-4 text-center text-base text-gray-400">
            {hasFilters ? 'No places match your filters.' : 'Start searching!'}
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
              onPress={() => router.push({ pathname: '/add-place' as any, params: { id: item.$id } })}
              onToggleStatus={() => handleToggleStatus(item)}
            />
          )}
        />
      )}
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3.5 py-3.5 flex justify-center items-center ${active ? 'bg-indigo-500' : 'bg-gray-100'}`}
    >
      <Text
        className={`text-xs font-medium ${active ? 'text-white' : 'text-gray-600'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}