import { createStyles } from "@/assets/styles/Stylesheet";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "react-native";

export default function Settings() {
  const styles = createStyles();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <Text>Coming soon...</Text>
    </ParallaxScrollView>
  );
}
