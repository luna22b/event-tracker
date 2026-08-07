import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import MainText from "#/components/MainText";
import RestaurantList from "#/components/RestaurantList";
import RestaurantModal from "#/components/RestaurantModal";
import type { Restaurant } from "#/types/restaurant";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const updateRestaurantWait = (
    id: number,
    wait_time: number,
    report_count?: number,
    confidence?: string,
    last_updated?: string,
  ) => {
    setRestaurants((currentRestaurants) =>
      currentRestaurants.map((restaurant) =>
        restaurant.id === id
          ? {
              ...restaurant,
              wait_time,
              report_count,
              confidence,
              last_updated,
            }
          : restaurant,
      ),
    );

    setSelectedRestaurant((currentRestaurant) => {
      if (!currentRestaurant || currentRestaurant.id !== id) {
        return currentRestaurant;
      }

      return {
        ...currentRestaurant,
        wait_time,
        report_count,
        confidence,
        last_updated,
      };
    });
  };

  return (
    <div>
      <main>
        <MainText
          setRestaurants={setRestaurants}
          setLoading={setLoading}
          loading={loading}
        />

        <RestaurantList
          restaurants={restaurants}
          loading={loading}
          onSelectRestaurant={setSelectedRestaurant}
          updateRestaurantWait={updateRestaurantWait}
        />
      </main>

      {selectedRestaurant && (
        <RestaurantModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          updateRestaurantWait={updateRestaurantWait}
        />
      )}
    </div>
  );
}

export default Home;
