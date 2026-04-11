import { useState } from "react";
import MapPicker from "./MapPicker";
import { markets } from "../data/markets";
import { useNavigate } from "react-router-dom";

type FormData = {
  crop: string;
  quantity: number;
  vehicle: string;
  location: any;
};

const vehicleRates: any = {
  tractor: 20,
  truck: 40,
  tataAce: 25,
};

export default function InputForm() {
  const [form, setForm] = useState<FormData>({
    crop: "",
    quantity: 0,
    vehicle: "",
    location: null,
  });

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!form.crop || !form.quantity || !form.vehicle || !form.location) {
      alert("Please fill all fields");
      return;
    }

    const calculated = markets.map((m) => {
      const revenue = m.price * form.quantity;
      const transport =
        m.distance * (vehicleRates[form.vehicle] || 20);
      const netProfit = revenue - transport;

      return {
        ...m,
        revenue,
        transport,
        netProfit,
      };
    });

    const best = calculated.reduce((prev, curr) =>
      curr.netProfit > prev.netProfit ? curr : prev
    );

    const minProfit = Math.min(
      ...calculated.map((m) => m.netProfit)
    );

    const savingsValue = best.netProfit - minProfit;

    const finalResults = calculated.map((m) => ({
      ...m,
      isBest: m.name === best.name,
    }));

    // ✅ STORE DASHBOARD DATA
    localStorage.setItem(
      "dashboardData",
      JSON.stringify(finalResults)
    );

    localStorage.setItem(
      "dashboardSavings",
      JSON.stringify(savingsValue)
    );

    // 🔥 ADD HISTORY FEATURE
    const historyEntry = {
      crop: form.crop,
      quantity: form.quantity,
      vehicle: form.vehicle,
      bestMarket: best.name,
      profit: best.netProfit,
      timestamp: new Date().toISOString(),
    };

    const existingHistory = JSON.parse(
      localStorage.getItem("history") || "[]"
    );

    const updatedHistory = [historyEntry, ...existingHistory].slice(0, 5);

    localStorage.setItem("history", JSON.stringify(updatedHistory));

    // Navigate
    navigate("/dashboard");
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🚜 Krishi Route Optimizer
      </h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Crop</label>
        <select
          className="w-full border p-3 rounded-lg"
          onChange={(e) =>
            setForm({ ...form, crop: e.target.value })
          }
        >
          <option value="">Select Crop</option>
          <option value="onion">Onion</option>
          <option value="wheat">Wheat</option>
          <option value="tomato">Tomato</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Quantity (quintals)
        </label>
        <input
          type="number"
          className="w-full border p-3 rounded-lg"
          placeholder="Enter quantity"
          onChange={(e) =>
            setForm({
              ...form,
              quantity: Number(e.target.value),
            })
          }
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Vehicle</label>
        <select
          className="w-full border p-3 rounded-lg"
          onChange={(e) =>
            setForm({ ...form, vehicle: e.target.value })
          }
        >
          <option value="">Select Vehicle</option>
          <option value="tractor">Tractor</option>
          <option value="truck">Truck</option>
          <option value="tataAce">Tata Ace</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Select Location 📍
        </label>
        <MapPicker
          setLocation={(loc: any) =>
            setForm({ ...form, location: loc })
          }
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
      >
        Calculate Best Profit
      </button>
    </div>
  );
}