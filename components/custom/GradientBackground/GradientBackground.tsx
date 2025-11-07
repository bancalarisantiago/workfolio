import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import { cn } from '@/lib/cn';

const PRIMARY = '#0C6DD9';
const SECONDARY = '#2C7BEA';
const ACCENT = '#ffffff';

type GradientBackgroundProps = {
  children: ReactNode;
  className?: string;
};

export function GradientBackground({ children, className }: GradientBackgroundProps) {
  return (
    <View className={cn('flex-1 overflow-hidden', className)}>
      <Svg style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        <Defs>
          <SvgLinearGradient
            id="softGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <Stop
              offset="0%"
              stopColor={PRIMARY}
              stopOpacity={1}
            />
            <Stop
              offset="55%"
              stopColor={SECONDARY}
              stopOpacity={0.9}
            />
            <Stop
              offset="100%"
              stopColor={ACCENT}
              stopOpacity={0.95}
            />
          </SvgLinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#softGradient)"
        />
      </Svg>

      <View className="flex-1">{children}</View>
    </View>
  );
}
