import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useDriverStore, useLocationStore } from "@/store";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useEffect, useState } from "react";
import { MarkerData, Driver } from "@/types/type";
import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { View, Text, ActivityIndicator } from "react-native";
import MapViewDirections from "react-native-maps-directions";

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const [coordinates, setCoordinates] = useState<any[]>([]);
  const goongAPIKey = process.env.EXPO_PUBLIC_GOONG_API_KEY;

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  useEffect(() => {
    if (
      userLatitude &&
      userLongitude &&
      destinationLatitude &&
      destinationLongitude
    ) {
      // Fetch directions from Goong API
      fetch(
        `https://rsapi.goong.io/Direction?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&vehicle=car&api_key=${goongAPIKey}`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (data && data.routes && data.routes[0]) {
            // Extract coordinates for the polyline
            const steps = data.routes[0].legs[0].steps;
            const newCoordinates = steps.map((step: any) => ({
              latitude: step.end_location.lat,
              longitude: step.end_location.lng,
            }));
            setCoordinates(newCoordinates);
          }
        })
        .catch((error) => {
          console.error("Error fetching directions:", error);
        });
    }
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  // if (!coordinates.length) {
  //   return (
  //     <View className="flex justify-center items-center w-full h-full">
  //       <ActivityIndicator size="large" color="#000" />
  //     </View>
  //   );
  // }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className={"w-full h-full rounded-2xl"}
      tintColor={"black"}
      // mapType={'mutedStandard'}
      mapType={"terrain"}
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle={"light"}
    >
      {markers.map((marker, index) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key={"destination"}
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title={"Destination"}
            image={icons.pin}
          />
          <Polyline
            coordinates={coordinates}
            strokeColor="#0286FF"
            strokeWidth={2}
          />
        </>
      )}
    </MapView>
  );
};
export default Map;
