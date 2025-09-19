import { Link } from 'expo-router';
import { Box, Heading, Pressable, Text } from '@gluestack-ui/themed';

export default function ModalScreen() {
  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      px="$6"
      bg="$backgroundLight0"
      _dark={{ bg: '$backgroundDark950' }}
    >
      <Heading size="2xl">This is a modal</Heading>
      <Link
        href="/(tabs)/(home)"
        dismissTo
        asChild
      >
        <Pressable
          mt="$6"
          px="$4"
          py="$3"
        >
          <Text
            color="$primary500"
            fontWeight="$medium"
          >
            Go to home screen
          </Text>
        </Pressable>
      </Link>
    </Box>
  );
}
