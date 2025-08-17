import React from "react";

export default function CourtFields({ courts, setCourts, timeSlots }) {
  const addCourt = () => {
    setCourts([...courts, { name: "", type: "", price: "", timeSlots }]);
  };

  const updateCourt = (index, field, value) => {
    const updatedCourts = [...courts];
    updatedCourts[index][field] = value;
    setCourts(updatedCourts);
  };

  const removeCourt = (index) => {
    setCourts(courts.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Courts</h3>
      {courts.map((court, index) => (
        <div key={index} className="border p-4 mb-2 rounded">
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="font-semibold block mb-1">Court Name</label>
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={court.name}
                onChange={(e) => updateCourt(index, "name", e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="font-semibold block mb-1">Court Type</label>
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={court.type}
                onChange={(e) => updateCourt(index, "type", e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="font-semibold block mb-1">Price</label>
              <input
                type="number"
                className="border p-2 rounded w-full"
                value={court.price}
                onChange={(e) => updateCourt(index, "price", e.target.value)}
                required
              />
            </div>
            <button onClick={() => removeCourt(index)} className="bg-red-500 text-white px-3 py-1 rounded mt-6">
              Remove
            </button>
          </div>

          {/* Display time slots */}
          <div className="mt-2">
            <h4 className="font-semibold mb-1">Available Time Slots</h4>
            <div className="grid grid-cols-3 gap-2">
              {court.timeSlots.map((slot, i) => (
                <span key={i} className="bg-gray-200 p-1 rounded text-center">
                  {slot}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button onClick={addCourt} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
        + Add Court
      </button>
    </div>
  );
}
