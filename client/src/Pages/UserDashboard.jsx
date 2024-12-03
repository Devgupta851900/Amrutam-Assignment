import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  PlusCircle, 
  ChevronRight, 
  Clock 
} from 'lucide-react';

// Simulated API calls (replace with actual backend fetch)
const fetchAllRoutines = async () => {
  // TODO: Replace with actual backend fetch
  return [
    {
      _id: "674f4a56b009e88dcc7c24c6",
      title: "3 Week Comprehensive Hair Care Routine",
      description: "A holistic approach to hair health and maintenance. Learn professional techniques for hair care, understand your hair type, and develop a personalized routine.",
      difficulty: "Intermediate",
      duration: "21 days",
      image: "/api/placeholder/400/250?text=Hair+Care"
    },
    {
      _id: "routine2",
      title: "30 Day Fitness Challenge",
      description: "Complete body transformation program designed to improve strength, endurance, and overall fitness through progressive workouts.",
      difficulty: "Advanced",
      duration: "30 days",
      image: "/api/placeholder/400/250?text=Fitness+Challenge"
    }
  ];
};

const RoutineCard = ({ 
  routine, 
  isJoined = false, 
  progress = null, 
  onJoin 
}) => {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      {/* Image */}
      <div className="relative">
        <img 
          src={routine.image} 
          alt={routine.title} 
          className="w-full h-48 object-cover"
        />
        {isJoined && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
            Joined
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-indigo-800">
            {routine.title}
          </h3>
          {isJoined ? (
            <CheckCircle className="text-green-500" />
          ) : (
            <PlusCircle className="text-blue-500" />
          )}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {routine.description}
        </p>

        {/* Progress or Join Section */}
        {isJoined && progress ? (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{width: `${progress.overallProgress.progressPercentage}%`}}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="mr-2 text-indigo-500" size={16} />
                {progress.overallProgress.completedDays} / {progress.overallProgress.totalDays} days
              </div>
              <span className="text-green-600">
                {progress.overallProgress.progressPercentage}% Complete
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <span className="mr-2">{routine.difficulty}</span>
              <span className="mr-2">•</span>
              <span>{routine.duration}</span>
            </div>
            <button 
              onClick={() => onJoin(routine._id)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center"
            >
              Join 
              <ChevronRight className="ml-2" size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const UserDashboard = ({ userData, routinesProgress }) => {
  const [availableRoutines, setAvailableRoutines] = useState([]);
  const [userRoutines, setUserRoutines] = useState([]);

  useEffect(() => {
    const loadRoutines = async () => {
      const allRoutines = await fetchAllRoutines();
      
      // Filter out routines user has already joined
      const filteredRoutines = allRoutines.filter(
        routine => !userData.user.routines.includes(routine._id)
      );

      setAvailableRoutines(filteredRoutines);
      
      // Match user's joined routines with their progress
      const joinedRoutines = routinesProgress.map(progress => {
        const routineDetails = allRoutines.find(r => r._id === progress.routineId);
        return {
          ...routineDetails,
          ...progress,
          link: `/routine/${progress.routineId}`
        };
      });
      
      setUserRoutines(joinedRoutines);
    };

    loadRoutines();
  }, [userData, routinesProgress]);

  const handleJoinRoutine = (routineId) => {
    // TODO: Implement actual join routine logic
    alert(`Joining routine with ID: ${routineId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-indigo-800 mb-8 animate-fade-in">
          My Routines Dashboard
        </h1>

        {/* Joined Routines Section */}
        {userRoutines.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
              Your Active Routines
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRoutines.map(routine => (
                <Link 
                  to={routine.link} 
                  key={routine.routineId}
                  className="block"
                >
                  <RoutineCard 
                    routine={routine}
                    isJoined={true}
                    progress={routine}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Available Routines Section */}
        <section>
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            Discover New Routines
          </h2>
          {availableRoutines.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
              No new routines available at the moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRoutines.map(routine => (
                <RoutineCard 
                  key={routine._id}
                  routine={routine}
                  onJoin={handleJoinRoutine}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;