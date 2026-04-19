import { Text, View, StyleSheet } from "react-native";

export default function MyRentalsScreen() {
  return (
    <View style={styles.container}>
      <Text>My Rentals</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
