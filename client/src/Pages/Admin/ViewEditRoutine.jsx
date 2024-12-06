/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { getRoutine } from "../../utils/api";
import { addWeekToRoutine, deleteWeekFromRoutine, updateWeek, updateDay } from "../../utils/api";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, User, ChevronDown, ChevronUp, Edit, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { AppContext } from "../../utils/contextAPI";
// import { uploadImageToCloudinary } from "../../utils/cloudinary";

const ViewEditRoutine = () => {
  const [routine, setRoutine] = useState(null);
  const [error, setError] = useState(null);
  const [openWeeks, setOpenWeeks] = useState({});
  const [openDays, setOpenDays] = useState({});
  const [editing, setEditing] = useState({}); // Tracks editing state for sections
  const [formData, setFormData] = useState({}); // Stores form data for edits
  const { loading, setLoading } = useContext(AppContext);

  const location = useLocation();
  const routineId = location.pathname.split("/").at(-1);

  const navigate = useNavigate();

  const fetchRoutine = async () => {
    try {
      setLoading(true);
      const response = await getRoutine(routineId);
      setRoutine(response.data.routine);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Failed to load routine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutine();
  }, [location.pathname]);

  const toggleWeek = (index) => {
    setOpenWeeks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleDay = (weekIndex, dayIndex) => {
    setOpenDays((prev) => ({
      ...prev,
      [`${weekIndex}-${dayIndex}`]: !prev[`${weekIndex}-${dayIndex}`],
    }));
  };

  const handleEditToggle = (key) => {
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file) => {
    try {
    //   const response = await uploadImageToCloudinary(file);
    const response = "Hello"
      return response.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed. Please try again.");
      return null;
    }
  };

  const handleUpdateWeek = async (weekId, data) => {
    try {
      setLoading(true);
      await updateWeek(routineId, weekId, data);
      toast.success("Week updated successfully!");
      await fetchRoutine();
      setEditing({});
    } catch (error) {
      console.error("Failed to update week:", error);
      toast.error("Failed to update week. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDay = async (weekId, dayId, data) => {
    try {
      setLoading(true);
      await updateDay(routineId, weekId, dayId, data);
      toast.success("Day updated successfully!");
      await fetchRoutine();
      setEditing({});
    } catch (error) {
      console.error("Failed to update day:", error);
      toast.error("Failed to update day. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeek = async (newWeekData) => {
    try {
      setLoading(true);
      await addWeekToRoutine(routineId, newWeekData);
      toast.success("Week added successfully!");
      await fetchRoutine();
    } catch (error) {
      console.error("Failed to add week:", error);
      toast.error("Failed to add week. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeek = async (weekId) => {
    try {
      setLoading(true);
      await deleteWeekFromRoutine(routineId, weekId);
      toast.success("Week deleted successfully!");
      await fetchRoutine();
    } catch (error) {
      console.error("Failed to delete week:", error);
      toast.error("Failed to delete week. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-2xl text-gray-500">
          Loading your routine...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg max-w-md mx-auto mt-10 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-24 px-4 py-8 max-w-7xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md"
      >
        Back
      </button>

      {routine && (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white flex justify-between items-center">
            <div className="p-8">
              <h1 className="text-4xl font-extrabold mb-2">
                {editing.title ? (
                  <input
                    value={formData.title || routine.title}
                    onChange={(e) =>
                      handleFormChange("title", e.target.value)
                    }
                    className="bg-gray-200 rounded p-2 w-full"
                  />
                ) : (
                  routine.title
                )}
              </h1>
              <button
                onClick={() =>
                  editing.title
                    ? handleUpdateWeek(routine._id, { title: formData.title })
                    : handleEditToggle("title")
                }
                className="text-blue-500 underline"
              >
                {editing.title ? "Save" : "Edit"}
              </button>
            </div>
          </div>
          {/* Render Weeks and Days with Edit Options */}
          {routine?.data?.weeks?.map((week, index) => (
            <div key={index}>
              {/* Week Section */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewEditRoutine;
