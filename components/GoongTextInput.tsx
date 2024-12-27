import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocationStore } from "@/store";

const goongKeyApi = process.env.EXPO_PUBLIC_GOONG_API_KEY;

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const GoongTextInput = ({ apiKey, onSelect }: any) => {
  const [input, setInput] = useState("");
  const [predictions, setPredictions] = useState([]);

  const { setDestinationLocation } = useLocationStore();

  const fetchPredictions = async (text: any) => {
    if (text.length < 3) return; // Chỉ tìm kiếm khi input >= 3 ký tự
    const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${apiKey}&input=${text}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Error fetching places", error);
    }
  };

  const debouncedFetchPredictions = useRef(
    debounce(fetchPredictions, 2000),
  ).current;

  const handleSelect = (place: any) => {
    setInput(place.description);
    setPredictions([]);

    const fetchPlaceDetails = async (placeId: string) => {
      const url = `https://rsapi.goong.io/geocode?place_id=${placeId}&api_key=${goongKeyApi}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        // Kiểm tra dữ liệu trả về
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          const geometry = result.geometry;

          // Kiểm tra nếu có geometry và location
          if (geometry && geometry.location) {
            const { lat, lng } = geometry.location;
            console.log("latitude: ", lat, "longitude: ", lng);
            // Cập nhật vào store của Zustand
            setDestinationLocation({
              latitude: lat,
              longitude: lng,
              address: place.description,
            });

            // Sau khi đã cập nhật địa điểm, gọi onSelect(place) để chuyển màn hình
            if (onSelect) onSelect(place);
          } else {
            console.error("Location data is missing.");
          }
        } else {
          console.error("No results found for place details.");
        }
      } catch (error) {
        console.error("Error fetching place details", error);
      }
    };
    fetchPlaceDetails(place.place_id);
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholderTextColor={"#ccc"}
        placeholder="Search for a location"
        value={input}
        onChangeText={(text) => {
          setInput(text);
          debouncedFetchPredictions(text);
        }}
      />
      {predictions.length > 0 && (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item)}>
              <Text style={styles.suggestion}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default GoongTextInput;
