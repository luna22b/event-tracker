import { useState } from "react";
import axios from "axios";
import type { Restaurant } from "#/types/restaurant";

type MainTextProps = {
  setRestaurants: React.Dispatch<React.SetStateAction<Restaurant[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const MainText = ({ setRestaurants, setLoading }: MainTextProps) => {
  const [showPostalInput, setShowPostalInput] = useState(false);
  const [code, setCode] = useState("");
  const [distance, setDistance] = useState(10);

  const searchNearbyRestaurants = async (
    latitude: number,
    longitude: number,
  ) => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/locations/nearby`,
        {
          latitude,
          longitude,
          radius: distance * 1609,
        },
      );

      setRestaurants(response.data);
    } catch (error) {
      console.error(error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        searchNearbyRestaurants(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      () => {
        alert("Unable to get your location.");
      },
    );
  };

  const handleCode = async () => {
    if (!code.trim()) {
      alert("Please enter a postal code");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/locations/search`,
        {
          postal_code: code,
          radius: distance * 1609,
        },
      );

      setRestaurants(response.data);
    } catch (error) {
      console.error(error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center mt-20 text-white">
      <h1 className="text-4xl font-bold sm:text-5xl">
        Know the wait time before you go.
      </h1>

      <p className="mt-6 text-base text-zinc-400 sm:text-lg">
        Search for a place or discover nearby locations with live wait times.
      </p>

      <div className="mt-6 flex flex-col items-center">
        <label className="mb-2 text-sm text-zinc-400">
          Search distance: {distance} miles
        </label>

        <input
          type="range"
          min="1"
          max="10"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-64 accent-white"
        />
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          className="cursor-pointer rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-white transition hover:bg-zinc-900 disabled:opacity-50"
          onClick={handleLocation}
        >
          Enable Location
        </button>

        <span className="text-zinc-400">or</span>

        <button
          className="cursor-pointer rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-white transition hover:bg-zinc-900"
          onClick={() => setShowPostalInput(!showPostalInput)}
        >
          Enter Postal Code
        </button>
      </div>

      {showPostalInput && (
        <div className="mt-6 flex w-full max-w-sm gap-3">
          <input
            type="text"
            value={code}
            placeholder="Enter postal code"
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
            onChange={(e) => setCode(e.target.value)}
          />

          <button
            className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600"
            onClick={handleCode}
          >
            Search
          </button>
        </div>
      )}
    </div>
  );
};

export default MainText;
