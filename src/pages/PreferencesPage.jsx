import { useEffect, useState } from "react";
import { useAuth } from "../context/auth";
import axios from "axios";

export default function PreferencesPage() {
  const { auth } = useAuth();
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    if (!auth?.user?._id) return;
    axios.get(`http://localhost:3002/preferences/${auth?.user?._id}`).then(res => {
      setPrefs(res.data);
      console.log("res.data", res.data);
    });
  }, [auth]);

  const updatePrefs = async (newPrefs) => {
    setPrefs(newPrefs);
    await axios.put(`http://localhost:3002/preferences/${auth.user._id}`, newPrefs);
  };

  if (!prefs) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notification Preferences</h1>

      {/* Global Toggles */}
      <h2 className="font-semibold mb-2">Global Settings</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
          <span className="font-medium">In-App (Always On)</span>
          <span className="text-green-600 font-semibold">Enabled</span>
        </div>

        {["push", "email"].map((ch) => (
          <div
            key={ch}
            className="flex items-center justify-between bg-gray-100 p-3 rounded"
          >
            <span className="capitalize font-medium">{ch}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.global[ch]}
                onChange={(e) =>
                  updatePrefs({
                    ...prefs,
                    global: { ...prefs.global, [ch]: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Per-type */}
      <h2 className="font-semibold mt-6 mb-2">Per-Type Preferences</h2>
      <div className="space-y-4">
        {Object.keys(prefs.perType).map((type) => (
          <div key={type} className="border rounded p-3 bg-white shadow-sm">
            <h3 className="capitalize font-medium mb-2">{type}</h3>

            <div className="flex gap-6">
              {prefs.global.push && (
                <label className="flex items-center gap-2">
                  <span>Push</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.perType[type].push}
                      onChange={(e) =>
                        updatePrefs({
                          ...prefs,
                          perType: {
                            ...prefs.perType,
                            [type]: {
                              ...prefs.perType[type],
                              push: e.target.checked,
                            },
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </label>
                </label>
              )}

              {prefs.global.email && (
                <label className="flex items-center gap-2">
                  <span>Email</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.perType[type].email}
                      onChange={(e) =>
                        updatePrefs({
                          ...prefs,
                          perType: {
                            ...prefs.perType,
                            [type]: {
                              ...prefs.perType[type],
                              email: e.target.checked,
                            },
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </label>
                </label>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
