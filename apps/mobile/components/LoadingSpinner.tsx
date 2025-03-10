import { ActivityIndicator, View } from 'react-native';
import { createStyles } from "@/assets/styles/Stylesheet";
import { Colors } from '@/assets/styles/Colors'

export default function LoadingSpinner() {
  const styles = createStyles();

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
};
