import { View, Text, TextInput } from "react-native";
import { useLocationStore } from "@/store";
import RideLayout from "@/components/RideLayout";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";

const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setUserLocation,
    setDestinationLocation,
  } = useLocationStore();
  return (
    <RideLayout title={"Ride"}>
      <View className="my-3">
        <Text className={"text-lg font-JakartaSemiBold mb-3"}>From</Text>
        <TextInput
          className={"border p-3 rounded-2xl"}
          value={userAddress!}
          editable={false}
        />
      </View>

      <View className="my-3">
        <Text className={"text-lg font-JakartaSemiBold mb-3"}>To</Text>
        <TextInput
          className={"border p-3 rounded-2xl"}
          value={destinationAddress!}
          editable={false}
        />
      </View>
      <CustomButton
        title={"Find now"}
        onPress={() => router.push("/confirm-ride")}
        className={"mt-5"}
      />
    </RideLayout>
  );
};

export default FindRide;
