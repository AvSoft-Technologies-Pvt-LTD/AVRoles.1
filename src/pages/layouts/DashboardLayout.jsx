import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader";

const DashboardLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role || "patient";
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-2 relative">
          {/* Loader: Centered in the main content area */}
          {loading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-white bg-opacity-70">
              <Loader />
            </div>
          )}

          {/* Outlet: Fades in/out based on loading state */}
          <div
            className={`transition-opacity duration-700 ${
              loading ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
