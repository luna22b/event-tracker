import { useEffect, useState } from "react";
import axios from "axios";
import type { Restaurant } from "#/types/restaurant";

type Props = {
  restaurant: Restaurant;
  onClose: () => void;
  updateRestaurantWait: (
    id: number,
    wait_time: number,
    report_count?: number,
    confidence?: string,
    last_updated?: string,
  ) => void;
};

const RestaurantModal = ({
  restaurant,
  onClose,
  updateRestaurantWait,
}: Props) => {
  const waitTimes = [5, 10, 15, 20, 30, 45];

  const [currentWait, setCurrentWait] = useState<number | null>(
    restaurant.wait_time ?? null,
  );

  const [reportCount, setReportCount] = useState(restaurant.report_count ?? 0);

  const [confidence, setConfidence] = useState<string | null>(
    restaurant.confidence ?? null,
  );

  const [lastUpdated, setLastUpdated] = useState<string | null>(
    restaurant.last_updated ?? null,
  );

  const fetchCurrentWait = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wait-reports/current/${restaurant.id}`,
      );

      const data = response.data;

      setCurrentWait(data.wait_time);
      setReportCount(data.report_count);
      setConfidence(data.confidence);
      setLastUpdated(data.last_updated);

      updateRestaurantWait(
        restaurant.id,
        data.wait_time,
        data.report_count,
        data.confidence,
        data.last_updated,
      );
    } catch {}
  };

  useEffect(() => {
    fetchCurrentWait();
  }, [restaurant.id]);

  useEffect(() => {
    const socket = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/ws/restaurants/${restaurant.id}`,
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.restaurant_id !== restaurant.id) {
        return;
      }

      setCurrentWait(data.wait_time);
      setReportCount(data.report_count);
      setConfidence(data.confidence);
      setLastUpdated(data.last_updated);

      updateRestaurantWait(
        restaurant.id,
        data.wait_time,
        data.report_count,
        data.confidence,
        data.last_updated,
      );
    };

    return () => {
      socket.close();
    };
  }, [restaurant.id]);

  const handleWaitReport = async (minutes: number) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/wait-reports/create`,
        {
          restaurant_id: restaurant.id,
          wait_minutes: minutes,
        },
      );
    } catch {}
  };

  const confidenceColor =
    confidence === "high"
      ? "text-emerald-400"
      : confidence === "medium"
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div>
      {restaurant.name}

      <p className="mt-3 text-zinc-400">
        {restaurant.address || "Address unavailable"}
      </p>

      <p className="text-zinc-500">{restaurant.cuisine || "Unknown cuisine"}</p>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Report current wait time</h3>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {waitTimes.map((time) => (
            <button
              key={time}
              onClick={() => handleWaitReport(time)}
              className="rounded-xl border border-zinc-700 px-3 py-2 transition hover:bg-zinc-800"
            >
              {time} min
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-zinc-900 p-4">
        <p className="text-sm text-zinc-400">Current wait time</p>

        <p className="mt-1 text-3xl font-bold">
          {currentWait !== null ? `${currentWait} min` : "No reports yet"}
        </p>

        <div className="mt-3 space-y-1 text-sm">
          {confidence && (
            <p className={`font-semibold ${confidenceColor}`}>
              {confidence.toUpperCase()} confidence
            </p>
          )}

          <p className="text-zinc-400">{reportCount} reports</p>

          {lastUpdated && <p className="text-zinc-500">Updated recently</p>}
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-6 w-full rounded-xl border border-zinc-700 px-4 py-3 transition hover:bg-zinc-800"
      >
        Close
      </button>
    </div>
  );
};

export default RestaurantModal;
