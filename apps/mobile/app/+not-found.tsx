import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { createStyles } from "@/assets/styles/Stylesheet";

import { ThemedText } from '@/components/ThemedText';

export default function NotFoundScreen() {
  const styles = createStyles();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.notFoundContainer}>
        <ThemedText type="title">This screen does not exist.</ThemedText>
        <Link href="/" style={styles.notFoundLink}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </View>
    </>
  );
}
