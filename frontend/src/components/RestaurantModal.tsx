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

  const [submitting, setSubmitting] = useState(false);

  const updateWaitState = (data: {
    wait_time: number | null;
    report_count: number;
    confidence: string | null;
    last_updated: string | null;
  }) => {
    setCurrentWait(data.wait_time);
    setReportCount(data.report_count);
    setConfidence(data.confidence);
    setLastUpdated(data.last_updated);

    if (data.wait_time !== null) {
      updateRestaurantWait(
        restaurant.id,
        data.wait_time,
        data.report_count,
        data.confidence ?? undefined,
        data.last_updated ?? undefined,
      );
    }
  };

  const fetchCurrentWait = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wait-reports/current/${restaurant.id}`,
      );

      updateWaitState(response.data);
    } catch {}
  };

  useEffect(() => {
    let active = true;

    const loadWait = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/wait-reports/current/${restaurant.id}`,
        );

        if (!active) return;

        updateWaitState(response.data);
      } catch {
        if (!active) return;
      }
    };

    loadWait();

    return () => {
      active = false;
    };
  }, [restaurant.id]);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL;

    if (!wsUrl) {
      return;
    }

    const socket = new WebSocket(`${wsUrl}/ws/restaurants/${restaurant.id}`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.restaurant_id !== restaurant.id) {
          return;
        }

        updateWaitState(data);
      } catch {}
    };

    socket.onerror = () => {
      socket.close();
    };

    return () => {
      socket.close();
    };
  }, [restaurant.id]);

  const handleWaitReport = async (minutes: number) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/wait-reports/create`,
        {
          restaurant_id: restaurant.id,
          wait_minutes: minutes,
        },
      );

      await fetchCurrentWait();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const confidenceColor =
    confidence === "high"
      ? "text-emerald-400"
      : confidence === "medium"
        ? "text-yellow-400"
        : confidence === "low"
          ? "text-red-400"
          : "text-zinc-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-black p-6 text-white">
        <h2 className="text-2xl font-bold">{restaurant.name}</h2>

        <p className="mt-3 text-zinc-400">
          {restaurant.address || "Address unavailable"}
        </p>

        <p className="text-zinc-500">
          {restaurant.cuisine || "Unknown cuisine"}
        </p>

        <div className="mt-6">
          <h3 className="text-lg font-semibold">Report current wait time</h3>

          <div className="mt-3 grid grid-cols-3 gap-3">
            {waitTimes.map((time) => (
              <button
                key={time}
                disabled={submitting}
                onClick={() => handleWaitReport(time)}
                className="cursor-pointer rounded-xl border border-zinc-700 px-3 py-2 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="mt-6 w-full cursor-pointer rounded-xl border border-zinc-700 px-4 py-3 transition hover:bg-zinc-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RestaurantModal;
