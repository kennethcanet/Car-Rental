import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "@/shared/theme";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder="Search vehicles..."
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.borderEmphasis,
    borderRadius: radius.sm,
    paddingLeft: 12,
  },
  icon: { fontSize: 14, marginRight: 4 },
  input: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
