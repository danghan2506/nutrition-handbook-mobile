import { useCssElement } from "react-native-css";
import type React from "react";
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  View as RNView,
} from "react-native";

type WithClassName<T> = T & { className?: string };

export function View(props: WithClassName<React.ComponentProps<typeof RNView>>) {
  return useCssElement(RNView, props, { className: "style" });
}

export function Text(props: WithClassName<React.ComponentProps<typeof RNText>>) {
  return useCssElement(RNText, props, { className: "style" });
}

export function Pressable(
  props: WithClassName<React.ComponentProps<typeof RNPressable>>,
) {
  return useCssElement(RNPressable, props, { className: "style" });
}

export function TextInput(
  props: WithClassName<React.ComponentProps<typeof RNTextInput>>,
) {
  return useCssElement(RNTextInput, props, { className: "style" });
}

export function ScrollView(
  props: WithClassName<
    React.ComponentProps<typeof RNScrollView> & {
      contentContainerClassName?: string;
    }
  >,
) {
  return useCssElement(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
}