import { PLACE_STATUS } from '@/lib/constants';
import type { Place } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

interface PlaceCardProps {
  place: Place;
  onPress?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  compact?: boolean;
}

export default function PlaceCard({
  place,
  onPress,
  onDelete,
  onToggleStatus,
  compact = false,
}: PlaceCardProps) {
  const isVisited = place.status === PLACE_STATUS.VISITED;

  const openMaps = () => {
    if (place.mapsUrl) {
      Linking.openURL(place.mapsUrl).catch(() =>
        Alert.alert('Error', 'Could not open the maps link.'),
      );
    }
  };

  const openReel = () => {
    if (place.reelUrl) {
      Linking.openURL(place.reelUrl).catch(() =>
        Alert.alert('Error', 'Could not open the reel link.'),
      );
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      {/* Header row */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            {place.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <View className="flex-row items-center">
              <Ionicons name="restaurant-outline" size={13} color="#6b7280" />
              <Text className="ml-1 text-sm text-gray-500">{place.cuisine}</Text>
            </View>
            <Text className="text-gray-300">•</Text>
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={13} color="#6b7280" />
              <Text className="ml-1 text-sm text-gray-500">{place.neighborhood}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Rating (if visited) */}
      {isVisited && place.rating && (
        <View className="mt-2 flex-row items-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <Ionicons
              key={n}
              name="star"
              size={14}
              color={n <= place.rating! ? '#f59e0b' : '#e5e7eb'}
            />
          ))}
          {place.notes ? (
            <Text className="ml-2 flex-1 text-xs text-gray-400" numberOfLines={1}>
              {place.notes}
            </Text>
          ) : null}
        </View>
      )}

      {/* Action row */}
      {!compact && (
        <View className="mt-3 flex-row items-center gap-4 border-t border-gray-50 pt-3">
          {place.mapsUrl && (
            <Pressable onPress={openMaps} className="flex-row items-center">
              <Ionicons name="map-outline" size={16} color="#6366f1" />
              <Text className="ml-1 text-sm font-medium text-indigo-500">
                Maps
              </Text>
            </Pressable>
          )}
          {place.reelUrl && (
            <Pressable onPress={openReel} className="flex-row items-center">
              <Ionicons name="play-circle-outline" size={16} color="#6366f1" />
              <Text className="ml-1 text-sm font-medium text-indigo-500">
                Reel
              </Text>
            </Pressable>
          )}
          <View className="flex-1" />
          {onToggleStatus && (
            <Pressable onPress={onToggleStatus}
              className={`flex-row items-center px-3 py-1.5 rounded-full border ${isVisited ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
            >
              <Ionicons
                name={isVisited ? 'checkmark-circle' : 'add-circle-outline'}
                size={16}
                color="#6b7280"
              />
              <Text className={`ml-1.5 text-xs font-semibold ${isVisited ? 'text-green-700' : 'text-gray-600'}`}>
                {isVisited ? 'Visited' : 'Want to go'}
              </Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={onDelete}>
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}
