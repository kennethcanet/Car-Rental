import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/shared/theme";

export default function LocationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Locations</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.pageBg },
  text: { fontSize: 16, color: colors.textSecondary },
});
