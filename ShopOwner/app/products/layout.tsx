import { Stack } from 'expo-router';
import React from 'react';

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Products & Offers',
        }}
      />
      {/* The following screens will be presented as transparent modals */}
      <Stack.Screen
        name="add-product"
        options={{
          presentation: 'transparentModal',
          headerShown: false, // We will create a custom header inside the modal
        }}
      />
      <Stack.Screen
        name="add-offer"
        options={{
          presentation: 'transparentModal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="manage-category"
        options={{
          presentation: 'transparentModal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
