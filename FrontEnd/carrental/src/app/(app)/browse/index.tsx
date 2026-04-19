import { Text, View, StyleSheet } from "react-native";

export default function BrowseScreen() {
  return (
    <View style={styles.container}>
      <Text>Browse</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
