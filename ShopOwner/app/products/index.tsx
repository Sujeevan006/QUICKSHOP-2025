import { themes } from '@/context/ThemeContext';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

// Import the components for each tab
import CategoriesList from '@/components/CategoriesList';
import OffersList from '@/components/OffersList';
import ProductsList from '@/components/ProductsList';

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();

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
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: themes.dark.primary }}
          style={{ backgroundColor: themes.dark.surface }}
          labelStyle={{ color: themes.dark.text, fontWeight: '600' }}
          activeColor={themes.dark.primary}
          inactiveColor={themes.dark.textSecondary}
        />
      )}
    />
  );
}
