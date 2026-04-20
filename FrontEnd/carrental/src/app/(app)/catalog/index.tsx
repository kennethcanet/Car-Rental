import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/shared/theme";

export default function CatalogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Catalog</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.pageBg },
  text: { fontSize: 16, color: colors.textSecondary },
});
