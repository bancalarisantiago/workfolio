import { Stack } from 'expo-router';

import { DocumentsHeader } from '@/components/layout/documents/DocumentsHeader';

export default function DocumentsStack() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="upload"
        options={{
          header: (props) => <DocumentsHeader {...props} />,
          title: 'Enviar documento',
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          header: (props) => <DocumentsHeader {...props} />,
          title: 'Detalles',
        }}
      />
    </Stack>
  );
}
