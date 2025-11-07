import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { DocumentsHeaderProps } from './types';

export function DocumentsHeader({
  navigation,
  back,
  options,
  route,
}: NativeStackHeaderProps & DocumentsHeaderProps) {
  const title = useMemo(() => {
    if (typeof options.headerTitle === 'string') {
      return options.headerTitle;
    }
    return options.title ?? route.name;
  }, [options.headerTitle, options.title, route.name]);

  const handleBack = () => {
    if (back) {
      navigation.goBack();
    }
  };

  return (
    <View className="bg-primary-600">
      <View className=" bg-primary-600 px-6 pb-4 pt-4">
        <View className="flex-row items-center justify-between">
          {back ? (
            <Pressable
              accessibilityLabel="Volver"
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center"
              android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
              onPress={handleBack}
            >
              <MaterialIcons
                name="arrow-back"
                size={26}
                color="#ffffff"
              />
            </Pressable>
          ) : (
            <View className="h-10 w-10" />
          )}

          <Text
            className="flex-1 text-center text-xl font-semibold text-white"
            numberOfLines={1}
          >
            {title}
          </Text>

          <View className="h-10 w-10" />
        </View>
      </View>
    </View>
  );
}
