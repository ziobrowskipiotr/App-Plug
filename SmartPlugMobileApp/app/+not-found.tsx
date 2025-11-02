import { Link, Stack } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! Not Found" }} />
      <View className="flex-1 items-center justify-center bg-[#121212] px-6">
        <Text className="text-white text-2xl font-bold mb-4">
          This screen doesn't exist.
        </Text>
        <Link href="/" asChild>
          <TouchableOpacity className="mt-4 px-4 py-2 bg-[#7C3AED] rounded-lg">
            <Text className="text-white font-semibold">Go to home screen</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}
