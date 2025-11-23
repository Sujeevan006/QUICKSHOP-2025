import { useTheme } from '@/context/ThemeContext';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

// Import the components for each tab
import CategoriesList from '@/components/CategoriesList';
import OffersList from '@/components/OffersList';
import ProductsList from '@/components/ProductsList';

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const theme = useTheme();
  const layout = Dimensions.get('window');

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'products', title: 'Products' },
    { key: 'categories', title: 'Categories' },
    { key: 'offers', title: 'Offers' },
  ]);

  useEffect(() => {
    if (params.tab) {
      const initialIndex = routes.findIndex((r) => r.key === params.tab);
      if (initialIndex !== -1) setIndex(initialIndex);
    }
  }, [params.tab]);

  // Map the keys to your imported components
  const renderScene = SceneMap({
    products: ProductsList,
    categories: CategoriesList,
    offers: OffersList,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: theme.primary, height: 3, borderRadius: 1.5 }}
          style={{ 
            backgroundColor: theme.surface, 
            elevation: 0, 
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
          renderLabel={({ route, focused, color }) => (
            <Text style={{ color, fontWeight: '600', textTransform: 'capitalize' }}>
              {route.title}
            </Text>
          )}
          activeColor={theme.primary}
          inactiveColor={theme.textSecondary}
          pressColor={theme.background}
        />
      )}
    />
  );
}
