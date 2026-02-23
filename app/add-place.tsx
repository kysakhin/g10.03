import { PLACE_STATUS } from '@/lib/constants';
import { ensureCuisine, listCuisines } from '@/lib/services/cuisines';
import { ensureNeighborhood, listNeighborhoods } from '@/lib/services/neighborhoods';
import { createPlace, getPlace, updatePlace } from '@/lib/services/places';
import type { Cuisine, Neighborhood, PlaceFormData } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddPlaceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);

  const [form, setForm] = useState<PlaceFormData>({
    name: '',
    reelUrl: '',
    thumbnailUrl: '',
    mapsUrl: '',
    cuisine: '',
    neighborhood: '',
    status: PLACE_STATUS.WANT_TO_GO,
    rating: '',
    notes: '',
  });

  const loadDropdownData = useCallback(async () => {
    try {
      const [c, n] = await Promise.all([listCuisines(), listNeighborhoods()]);
      setCuisines(c);
      setNeighborhoods(n);
    } catch (e) {
      console.error('Failed to load dropdown data:', e);
    }
  }, []);

  useEffect(() => {
    async function init() {
      await loadDropdownData();
      if (isEditing && id) {
        try {
          const place = await getPlace(id);
          setForm({
            name: place.name,
            reelUrl: place.reelUrl ?? '',
            thumbnailUrl: place.thumbnailUrl ?? '',
            mapsUrl: place.mapsUrl ?? '',
            cuisine: place.cuisine,
            neighborhood: place.neighborhood,
            status: place.status,
            rating: place.rating?.toString() ?? '',
            notes: place.notes ?? '',
          });
        } catch (e) {
          Alert.alert('Error', 'Failed to load place details.');
          router.back();
        }
      }
      setInitialLoading(false);
    }
    init();
  }, [id, isEditing, router, loadDropdownData]);

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Required', 'Please enter a name.');
    if (!form.cuisine.trim()) return Alert.alert('Required', 'Please enter a cuisine.');
    if (!form.neighborhood.trim())
      return Alert.alert('Required', 'Please enter a neighborhood.');

    setLoading(true);
    try {
      // Ensure cuisine and neighborhood exist in lookup tables
      await Promise.all([
        ensureCuisine(form.cuisine),
        ensureNeighborhood(form.neighborhood),
      ]);

      if (isEditing && id) {
        await updatePlace(id, form);
      } else {
        await createPlace(form);
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCuisines = cuisines.filter((c) =>
    c.name.toLowerCase().includes(form.cuisine.toLowerCase()),
  );
  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.name.toLowerCase().includes(form.neighborhood.toLowerCase()),
  );

  if (initialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={24}
        >
          <Text className="mb-6 text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Place' : 'Add Place'}
          </Text>

          {/* Name */}
          <Label text="Name" required />
          <TextInput
            className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
            placeholder="e.g. Truffles"
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholderTextColor="#9ca3af"
          />

          {/* Cuisine — with dropdown */}
          <Label text="Cuisine" required />
          <View className="relative mb-4">
            <TextInput
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              placeholder="e.g. Italian"
              value={form.cuisine}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, cuisine: v }));
                setShowCuisineDropdown(true);
              }}
              onFocus={() => setShowCuisineDropdown(true)}
              onBlur={() => setTimeout(() => setShowCuisineDropdown(false), 200)}
              placeholderTextColor="#9ca3af"
            />
            {showCuisineDropdown && filteredCuisines.length > 0 && (
              <View className="absolute left-0 right-0 top-14 z-10 max-h-40 rounded-xl border border-gray-200 bg-white shadow-lg">
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {filteredCuisines.map((c) => (
                    <Pressable
                      key={c.$id}
                      className="border-b border-gray-100 px-4 py-3"
                      onPress={() => {
                        setForm((f) => ({ ...f, cuisine: c.name }));
                        setShowCuisineDropdown(false);
                      }}
                    >
                      <Text className="text-base text-gray-700">{c.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Neighborhood — with dropdown */}
          <Label text="Neighborhood" required />
          <View className="relative mb-4">
            <TextInput
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              placeholder="e.g. Indiranagar"
              value={form.neighborhood}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, neighborhood: v }));
                setShowNeighborhoodDropdown(true);
              }}
              onFocus={() => setShowNeighborhoodDropdown(true)}
              onBlur={() => setTimeout(() => setShowNeighborhoodDropdown(false), 200)}
              placeholderTextColor="#9ca3af"
            />
            {showNeighborhoodDropdown && filteredNeighborhoods.length > 0 && (
              <View className="absolute left-0 right-0 top-14 z-10 max-h-40 rounded-xl border border-gray-200 bg-white shadow-lg">
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {filteredNeighborhoods.map((n) => (
                    <Pressable
                      key={n.$id}
                      className="border-b border-gray-100 px-4 py-3"
                      onPress={() => {
                        setForm((f) => ({ ...f, neighborhood: n.name }));
                        setShowNeighborhoodDropdown(false);
                      }}
                    >
                      <Text className="text-base text-gray-700">{n.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Reel URL */}
          <Label text="Instagram Reel URL" />
          <TextInput
            className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
            placeholder="https://www.instagram.com/reel/..."
            value={form.reelUrl}
            onChangeText={(v) => setForm((f) => ({ ...f, reelUrl: v }))}
            keyboardType="url"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />

          {/* Google Maps Link */}
          <Label text="Google Maps Link" />
          <TextInput
            className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
            placeholder="https://maps.app.goo.gl/..."
            value={form.mapsUrl}
            onChangeText={(v) => setForm((f) => ({ ...f, mapsUrl: v }))}
            keyboardType="url"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />

          {/* Status Toggle */}
          <Label text="Status" />
          <View className="mb-4 flex-row gap-3">
            <StatusChip
              label="Want to go"
              active={form.status === PLACE_STATUS.WANT_TO_GO}
              onPress={() => setForm((f) => ({ ...f, status: PLACE_STATUS.WANT_TO_GO }))}
            />
            <StatusChip
              label="Visited"
              active={form.status === PLACE_STATUS.VISITED}
              onPress={() => setForm((f) => ({ ...f, status: PLACE_STATUS.VISITED }))}
            />
          </View>

          {/* Rating (only when visited) */}
          {form.status === PLACE_STATUS.VISITED && (
            <>
              <Label text="Rating (1–5)" />
              <View className="mb-4 flex-row gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => setForm((f) => ({ ...f, rating: String(n) }))}
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        Number(form.rating) >= n ? '#6366f1' : '#f3f4f6',
                    }}
                  >
                    <Ionicons
                      name="star"
                      size={18}
                      color={Number(form.rating) >= n ? '#fff' : '#d1d5db'}
                    />
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Notes */}
          <Label text="Notes" />
          <TextInput
            className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
            placeholder="Any thoughts..."
            value={form.notes}
            onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={loading}
            className="items-center rounded-xl bg-indigo-500 py-4"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">
                {isEditing ? 'Save Changes' : 'Add Place'}
              </Text>
            )}
          </Pressable>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Small Components ─────────────────────────────────────────────────────────

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text className="mb-1.5 text-sm font-medium text-gray-600">
      {text}
      {required && <Text className="text-red-400"> *</Text>}
    </Text>
  );
}

function StatusChip({
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
      className={`rounded-full px-5 py-2.5 ${active ? 'bg-indigo-500' : 'bg-gray-100'}`}
    >
      <Text
        className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-600'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
