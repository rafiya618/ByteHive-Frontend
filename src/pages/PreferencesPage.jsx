import { useEffect, useState } from "react";
import { useAuth } from "../context/auth";
import axios from "axios";
import Layout from "../components/Layout/Layout";

export default function PreferencesPage() {
  const { auth } = useAuth();
  const [prefs, setPrefs] = useState(null);
  const [activeChannel, setActiveChannel] = useState("push"); // 👈 Push by default

  useEffect(() => {
    if (!auth?.user?._id) return;
    axios
      .get(`http://localhost:3002/preferences/${auth?.user?._id}`)
      .then((res) => {
        setPrefs(res.data);
        console.log("res.data", res.data);
      });
  }, [auth]);

  const updatePrefs = async (newPrefs) => {
    setPrefs(newPrefs);
    await axios.put(
      `http://localhost:3002/preferences/${auth.user._id}`,
      newPrefs
    );
  };

  if (!prefs) return <div className="text-center mt-20">Loading...</div>;

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Notification Preferences
        </h1>

        {/* Tabs for Push / Email */}
        <div className="flex justify-center gap-4 mb-6">
          {["push", "email"].map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeChannel === ch
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-[#0F0E2E] text-gray-300 hover:bg-purple-500/30"
              }`}
            >
              {ch.charAt(0).toUpperCase() + ch.slice(1)}
            </button>
          ))}
        </div>

        {/* Active Channel Section */}
        <div className="bg-[#1A1842]/60 backdrop-blur-md shadow-lg rounded-2xl p-6">
          {/* Global for selected channel */}
          <div className="flex items-center justify-between bg-[#0F0E2E] p-4 rounded-xl shadow-md mb-6">
            <span className="capitalize font-medium text-lg">
              Enable {activeChannel} Notifications
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.global[activeChannel]}
                onChange={(e) =>
                  updatePrefs({
                    ...prefs,
                    global: {
                      ...prefs.global,
                      [activeChannel]: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-500 rounded-full peer peer-checked:bg-purple-500 transition-colors shadow-inner"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6 peer-checked:shadow-[0_0_10px_2px_rgba(168,85,247,0.7)]"></div>
            </label>
          </div>

          {/* Per-type preferences always visible */}
          <div className="grid gap-6 grid-cols-1">
            {Object.keys(prefs.perType).map((type) => (
              <div
                key={type}
                className={`bg-[#0F0E2E] p-5 rounded-xl shadow-md transition-shadow ${
                  prefs.global[activeChannel]
                    ? "hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <h3 className="capitalize font-medium mb-3 text-lg text-purple-300">
                  {type}
                </h3>

                <label className="flex items-center gap-2">
                  <span>{activeChannel}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.perType[type][activeChannel]}
                      disabled={!prefs.global[activeChannel]} // 👈 disable when global off
                      onChange={(e) =>
                        updatePrefs({
                          ...prefs,
                          perType: {
                            ...prefs.perType,
                            [type]: {
                              ...prefs.perType[type],
                              [activeChannel]: e.target.checked,
                            },
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-500 rounded-full peer peer-checked:bg-purple-500 transition-colors shadow-inner"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6 peer-checked:shadow-[0_0_10px_2px_rgba(168,85,247,0.7)]"></div>
                  </label>
                </label>
              </div>
            ))}
          </div>

          {!prefs.global[activeChannel] && (
            <p className="text-center text-gray-400 italic mt-4">
              Turn on global {activeChannel} to enable these preferences.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
