import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import MainText from "#/components/MainText";
import Navbar from "#/components/Navbar";
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
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="flex flex-col items-center px-4">
        <MainText setRestaurants={setRestaurants} setLoading={setLoading} />

        <RestaurantList
          restaurants={restaurants}
          loading={loading}
          onSelectRestaurant={setSelectedRestaurant}
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
