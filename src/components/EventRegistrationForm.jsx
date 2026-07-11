import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const EventRegistrationForm = () => {
  const [arrivalDate, setArrivalDate] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [travelMode, setTravelMode] = useState("");

  // Generate 12-hour time options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const minutes = Array.from({ length: 61 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  const periods = ["AM", "PM"];

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-[#0A3287]">
          Event Registration
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Please fill in your travel details
        </p>

        <form className="space-y-6">
          {/* Arrival */}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold block mb-2">Arrival Date</label>

              <DatePicker
                selected={arrivalDate}
                onChange={(date) => setArrivalDate(date)}
                placeholderText="dd/MM/yyyy"
                dateFormat="dd/MM/yyyy"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Departure Time</label>

              <div className="grid grid-cols-3 gap-3">
                {/* Hour */}
                <select className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Hour</option>

                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>

                {/* Minute */}
                <select className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Minute</option>

                  {minutes.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>

                {/* AM / PM */}
                <select className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">AM/PM</option>

                  {periods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Departure */}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold block mb-2">Departure Date</label>

              <DatePicker
                selected={departureDate}
                onChange={(date) => setDepartureDate(date)}
                placeholderText="dd/MM/yyyy"
                dateFormat="dd/MM/yyyy"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Departure Time</label>

              <div className="grid grid-cols-3 gap-3">
                {/* Hour */}
                <select className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Hour</option>

                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>

                {/* Minute */}
                <select className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Minute</option>

                  {minutes.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>

                {/* AM / PM */}
                <select className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">AM/PM</option>

                  {periods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Travel Mode */}

          <div>
            <label className="font-semibold block mb-2">
              Arrival Mode of Travel
            </label>

            <select
              value={travelMode}
              onChange={(e) => setTravelMode(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="">Select Travel Mode</option>
              <option value="Train">Train</option>
              <option value="Bus">Bus</option>
              <option value="Own Vehicle">Own Vehicle</option>
            </select>
          </div>

          {/* Dynamic Travel Details */}

          {travelMode === "Bus" && (
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Bus Name"
                className="border rounded-lg px-4 py-3"
              />

              <input
                type="text"
                placeholder="Bus Agency"
                className="border rounded-lg px-4 py-3"
              />
            </div>
          )}

          {travelMode === "Train" && (
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Train Name / Number"
                className="border rounded-lg px-4 py-3"
              />

              <input
                type="text"
                placeholder="Coach Number"
                className="border rounded-lg px-4 py-3"
              />
            </div>
          )}

          {travelMode === "Own Vehicle" && (
            <input
              type="text"
              placeholder="Vehicle Number"
              className="w-full border rounded-lg px-4 py-3 uppercase"
            />
          )}

          {/* Accommodation */}

          <div>
            <label className="font-semibold block mb-2">
              Accommodation Required
            </label>

            <select className="w-full border rounded-lg px-4 py-3">
              <option>Select Option</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          {/* Family Members */}

          <div>
            <label className="font-semibold block mb-2">
              Number of Family Members
            </label>

            <select className="w-full border rounded-lg px-4 py-3">
              <option>Select Members</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
          </div>

          <button className="w-full bg-[#0A3287] hover:bg-blue-900 text-white py-3 rounded-lg font-semibold transition">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};
