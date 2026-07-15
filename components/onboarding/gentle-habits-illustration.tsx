import type { LucideIcon } from 'lucide-react-native';
import BedSingle from 'lucide-react-native/icons/bed-single';
import GlassWater from 'lucide-react-native/icons/glass-water';
import Soup from 'lucide-react-native/icons/soup';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type GentleHabitsIllustrationProps = {
  activities: readonly [string, string, string];
};

type ActivityNodeProps = {
  Icon: LucideIcon;
  color: string;
  label: string;
  positionClassName: string;
  widthClassName?: string;
};

function ActivityNode({
  Icon,
  color,
  label,
  positionClassName,
  widthClassName = 'w-28',
}: ActivityNodeProps) {
  return (
    <View className={`absolute items-center ${widthClassName} ${positionClassName}`}>
      <View className="size-[78px] items-center justify-center rounded-full border border-ink-navy/5 bg-surface shadow-sm">
        <Icon color={color} size={38} strokeWidth={2} />
      </View>
      <Text className="mt-[9px] font-sans text-[13px] font-bold leading-4 text-ink-navy" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function GentleHabitsIllustration({ activities }: GentleHabitsIllustrationProps) {
  return (
    <View
      accessibilityLabel="Ba thói quen được nối theo một vòng nhịp: ăn đúng bữa, uống đủ nước và nghỉ ngơi đúng lúc"
      className="relative h-[302px] w-full max-w-[348px] self-center overflow-hidden rounded-[28px] bg-peach">
      <View className="absolute -right-[18px] -top-5 h-20 w-[106px] rotate-[8deg] bg-sunrise-wash opacity-55" />

      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} viewBox="0 0 348 302">
        <Circle
          cx="174"
          cy="129"
          r="102"
          fill="none"
          stroke="#BFC3BE"
          strokeDasharray="4 9"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
      </Svg>

      <ActivityNode
        Icon={Soup}
        color="#747D8C"
        label={activities[0]}
        positionClassName="left-[118px] top-[14px]"
      />
      <ActivityNode
        Icon={GlassWater}
        color="#76ADD0"
        label={activities[1]}
        positionClassName="left-[29px] top-[150px]"
      />
      <ActivityNode
        Icon={BedSingle}
        color="#858D9A"
        label={activities[2]}
        positionClassName="right-4 top-[150px]"
        widthClassName="w-[138px]"
      />
    </View>
  );
}