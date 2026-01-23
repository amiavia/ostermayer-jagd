import { Stack } from 'expo-router';
import { colors } from '../../src/lib/constants';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.cream },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="caliber" />
      <Stack.Screen name="zero" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
