import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { HomeCategory } from "@/features/home/mockData";
import { HOME_CATEGORIES } from "@/features/home/mockData";
import { colors, radius } from "@/shared/theme";

interface Props {
  active: HomeCategory;
  onSelect: (category: HomeCategory) => void;
}

export function FilterChips({ active, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {HOME_CATEGORIES.map((cat) => {
        const isActive = cat === active;
        return (
          <Pressable
            key={cat}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(cat)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{cat}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.borderEmphasis,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: 13, color: colors.textSecondary },
  labelActive: { color: "#fff" },
});
