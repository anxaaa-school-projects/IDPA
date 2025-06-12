import { Colors } from "@/assets/styles/Colors";
import { createStyles } from "@/assets/styles/Stylesheet";
import React, { PropsWithChildren, ReactElement } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

const MAX_HEADER_HEIGHT = 180;
const MIN_HEADER_HEIGHT = 120;
const IMAGE_LEFT_MARGIN = 24;
const IMAGE_BOTTOM_MARGIN = 10;

type Props = PropsWithChildren<{
  headerImage: ReactElement<Image["props"]>;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const styles = createStyles();
  const colorScheme = useColorScheme() ?? "light";
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollOffset.value,
      [0, MAX_HEADER_HEIGHT],
      [MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT],
      { extrapolateRight: "clamp" }
    ),
    overflow: "hidden",
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollOffset.value,
      [0, MAX_HEADER_HEIGHT],
      [1, 0.6],
      { extrapolateRight: "clamp" }
    );

    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [0, MAX_HEADER_HEIGHT],
            [0, -20],
            { extrapolateRight: "clamp" }
          ),
        },
        { scale },
      ],
    };
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.body}>
        <Animated.View
          style={[
            parallaxScrollViewStyles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}
        >
          <Animated.View
            style={[parallaxScrollViewStyles.imageWrapper, imageAnimatedStyle]}
          >
            {headerImage}
          </Animated.View>
        </Animated.View>

        <Animated.ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          scrollIndicatorInsets={{ bottom }}
          contentContainerStyle={{
            paddingBottom: bottom,
            paddingTop: MAX_HEADER_HEIGHT + 10,
            flexGrow: 1,
          }}
        >
          <View style={parallaxScrollViewStyles.content}>{children}</View>
        </Animated.ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const parallaxScrollViewStyles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    justifyContent: "flex-end",
    alignItems: "flex-start",

    // iOS shadow
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,

    // Android shadow
    elevation: 5,
    backgroundColor: "white",
  },
  imageWrapper: {
    marginLeft: IMAGE_LEFT_MARGIN,
    marginBottom: IMAGE_BOTTOM_MARGIN,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 16,
    overflow: "hidden",
  },
});
