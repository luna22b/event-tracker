import { useEffect, useState } from "react";

import LoadingSpinner from "./LoadingSpinner";
import type { Restaurant } from "#/types/restaurant";

type Props = {
  restaurants: Restaurant[];
  loading: boolean;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  updateRestaurantWait: (
    id: number,
    wait_time: number,
    report_count?: number,
    confidence?: string,
    last_updated?: string,
  ) => void;
};

const RestaurantList = ({
  restaurants,
  loading,
  onSelectRestaurant,
  updateRestaurantWait,
}: Props) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("active");
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL;

    if (!wsUrl || restaurants.length === 0) {
      return;
    }

    const sockets: WebSocket[] = [];

    restaurants.slice(0, visibleCount).forEach((restaurant) => {
      const socket = new WebSocket(`${wsUrl}/ws/restaurants/${restaurant.id}`);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.restaurant_id !== restaurant.id) {
            return;
          }

          updateRestaurantWait(
            restaurant.id,
            data.wait_time,
            data.report_count,
            data.confidence,
            data.last_updated,
          );
        } catch {}
      };

      sockets.push(socket);
    });

    return () => {
      sockets.forEach((socket) => {
        socket.close();
      });
    };
  }, [restaurants, visibleCount, updateRestaurantWait]);

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence?.toLowerCase()) {
      case "high":
        return "bg-emerald-500/10 text-emerald-400";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400";
      case "low":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  const sortedRestaurants = [...restaurants]
    .filter((restaurant) =>
      restaurant.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sort === "confidence") {
        const confidenceScore = {
          high: 3,
          medium: 2,
          low: 1,
        };

        return (
          (confidenceScore[b.confidence as keyof typeof confidenceScore] ?? 0) -
          (confidenceScore[a.confidence as keyof typeof confidenceScore] ?? 0)
        );
      }

      if (sort === "wait") {
        return (b.report_count ?? 0) - (a.report_count ?? 0);
      }

      if (sort === "distance") {
        return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      }

      return (b.report_count ?? 0) - (a.report_count ?? 0);
    });

  const visibleRestaurants = sortedRestaurants.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="flex w-full justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 text-center">
        <p className="text-lg text-zinc-400">
          Enable location or enter a postal code to view nearby restaurants.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Choose a search option above to find restaurants in your area.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="mb-6 mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search restaurants..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(10);
          }}
          className="w-full max-w-sm rounded-lg border border-zinc-700 bg-black px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-500"
        />

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setVisibleCount(10);
          }}
          className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none sm:w-auto"
        >
          <option className="bg-black text-white" value="active">
            Active
          </option>

          <option className="bg-black text-white" value="confidence">
            Confidence
          </option>

          <option className="bg-black text-white" value="distance">
            Closest
          </option>

          <option className="bg-black text-white" value="wait">
            Reports
          </option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => onSelectRestaurant(restaurant)}
            className="w-full cursor-pointer rounded-2xl border border-zinc-800 p-4 transition hover:border-emerald-500/50 hover:bg-zinc-900"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-white">
                  {restaurant.name}
                </h2>

                <p className="mt-1 truncate text-sm text-zinc-400">
                  {restaurant.address || "Address unavailable"}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  {restaurant.cuisine && (
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                      {restaurant.cuisine}
                    </span>
                  )}

                  {restaurant.report_count !== undefined &&
                    restaurant.report_count > 0 && (
                      <span className="text-xs text-zinc-500">
                        {restaurant.report_count} reports
                      </span>
                    )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Wait
                </p>

                <p className="text-2xl font-bold text-emerald-400">
                  {restaurant.wait_time != null
                    ? `${restaurant.wait_time}m`
                    : "--"}
                </p>

                {restaurant.wait_time != null && restaurant.confidence && (
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${getConfidenceColor(
                      restaurant.confidence,
                    )}`}
                  >
                    {restaurant.confidence}
                  </span>
                )}

                {restaurant.last_updated && (
                  <p className="mt-1 text-xs text-zinc-500">Updated recently</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {visibleRestaurants.length === 0 && (
          <p className="col-span-full mb-20 text-center text-zinc-500">
            No restaurants match your search.
          </p>
        )}
      </div>

      {visibleCount < sortedRestaurants.length && (
        <div className="mb-8 mt-6 flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="cursor-pointer rounded-xl border border-zinc-700 px-6 py-2 text-sm text-white transition hover:bg-zinc-900"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
