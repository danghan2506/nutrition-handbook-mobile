import { useCssElement } from "react-native-css";
import React from "react";
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

export const TextInput = React.forwardRef<
  RNTextInput,
  WithClassName<React.ComponentProps<typeof RNTextInput>>
>(function TextInput(props, ref) {
  return useCssElement(RNTextInput, { ...props, ref }, { className: "style" });
});

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