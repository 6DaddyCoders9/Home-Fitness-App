import React, { useState, useEffect } from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { images } from "../../constants";
import EmptyState from "../../components/EmptyState";
import useAppwrite from "../../lib/useAppwrite";
import { getBodyParts } from "../../lib/appwrite";
import BodyPartsList from "../../components/BodyPartsList";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";

const Home = () => {
  const { user } = useGlobalContext(); // Access global user context
  const { data: bodyParts, refetch, isLoading } = useAppwrite(getBodyParts); // Fetch classes

  const [refreshing, setRefreshing] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);

  useEffect(() => {
    // Load selected body part from AsyncStorage on component mount
    const loadSelectedBodyPart = async () => {
      try {
        const storedBodyPart = await AsyncStorage.getItem("selectedBodyPart");
        if (storedBodyPart && storedBodyPart.trim()) {
          setSelectedBodyPart(storedBodyPart);
        } else {
          setSelectedBodyPart(null); // Handle case where no body part is selected
        }
      } catch (error) {
        console.error("Failed to load selected body part", error);
      }
    };

    loadSelectedBodyPart();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch(); // Refresh body parts list
    setRefreshing(false);
  };

  const handleSelectBodyPart = async (bodyPartId) => {
    // Store the selected body part in AsyncStorage
    try {
      await AsyncStorage.setItem("selectedBodyPart", bodyPartId);
      setSelectedBodyPart(bodyPartId);
      // Navigate to the body parts page for the selected body part
      router.push(`/bodyParts/${bodyPartId}`);
    } catch (error) {
      console.error("Failed to store selected body part", error);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        key="flatlist" // Use a key to force re-render if needed
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-black-100">
                  Welcome Back,
                </Text>
                <Text className="text-2xl font-psemibold text-sky-500">
                  {user?.username}
                </Text>
              </View>
              <View className="-mt-10">
                <Image
                  source={images.logoSmall}
                  className="w-[75px] -top-40"
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text className="text-xl font-psemibold text-sky-400 -top-80 -mb-80">
              Select which muscle you want to workout today!
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Exercises Found"
            subtitle="There are no exercises available at the moment."
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        numColumns={2} // Set number of columns to 2
        data={bodyParts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <BodyPartsList
              bodyParts={[item]}
              onSelectBodyParts={handleSelectBodyPart}
            />
          </View>
        )}
        ListFooterComponent={
          isLoading ? (
            <Text className="text-white pt-20 mx-5">Loading...</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    margin: 8,
  },
});

export default Home;
