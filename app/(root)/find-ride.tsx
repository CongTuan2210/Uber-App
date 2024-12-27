import { View, Text } from "react-native";
import { useLocationStore } from "@/store";
import RideLayout from "@/components/RideLayout";

const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setUserLocation,
    setDestinationLocation,
  } = useLocationStore();
  return (
    <RideLayout>s
      <Text>Hello</Text>
      <Text>GUTBAI</Text>
    </RideLayout>
  );
};

export default FindRide;
