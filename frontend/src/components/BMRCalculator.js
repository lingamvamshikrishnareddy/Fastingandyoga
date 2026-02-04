import React, { useState } from 'react';
import { Calculator, Activity, TrendingUp, Clock, Target, Flame, Heart, Moon } from 'lucide-react';

const ComprehensiveHealthCalculator = () => {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [weightGoal, setWeightGoal] = useState('maintain');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateMETCalories = (met, weight, duration) => {
    // MET formula: METs × weight in kg × time in hours
    return Math.round(met * weight * (duration / 60));
  };

  const calculateComprehensiveMetrics = (age, weight, height, gender, activityLevel, weightGoal) => {
    // BMR Calculation using Mifflin-St Jeor Equation (more accurate than Harris-Benedict)
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Activity multipliers for TDEE (Total Daily Energy Expenditure)
    const activityMultipliers = {
      sedentary: 1.2,      // Little to no exercise
      lightly_active: 1.375, // Light exercise 1-3 days/week
      moderately_active: 1.55, // Moderate exercise 3-5 days/week
      very_active: 1.725,   // Hard exercise 6-7 days/week
      extremely_active: 1.9  // Very hard exercise, physical job
    };

    const tdee = bmr * activityMultipliers[activityLevel];

    // Weight goal calorie adjustments
    let targetCalories = tdee;
    let weeklyWeightChange = 0;
    
    switch(weightGoal) {
      case 'lose_aggressive':
        targetCalories = tdee - 1000; // 2 lbs/week
        weeklyWeightChange = -0.9; // kg
        break;
      case 'lose_moderate':
        targetCalories = tdee - 750; // 1.5 lbs/week
        weeklyWeightChange = -0.7;
        break;
      case 'lose_gradual':
        targetCalories = tdee - 500; // 1 lb/week
        weeklyWeightChange = -0.45;
        break;
      case 'maintain':
        targetCalories = tdee;
        weeklyWeightChange = 0;
        break;
      case 'gain_gradual':
        targetCalories = tdee + 500; // 1 lb/week
        weeklyWeightChange = 0.45;
        break;
      case 'gain_moderate':
        targetCalories = tdee + 750; // 1.5 lbs/week
        weeklyWeightChange = 0.7;
        break;
    }

    // Ensure minimum calorie intake for safety
    const minCalories = gender === 'male' ? 1500 : 1200;
    if (targetCalories < minCalories) {
      targetCalories = minCalories;
    }

    // Walking calculations with stride length
    const strideLength = gender === 'male' 
      ? height * 0.415 // cm
      : height * 0.413; // cm
    
    const strideLengthM = strideLength / 100;
    
    // Age and BMI-based fitness factors
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    let ageFactor = 1.0;
    if (age < 30) ageFactor = 1.2;
    else if (age < 50) ageFactor = 1.0;
    else if (age < 65) ageFactor = 0.85;
    else ageFactor = 0.7;
    
    let bmiFactor = 1.0;
    if (bmi < 18.5) bmiFactor = 0.8;
    else if (bmi <= 24.9) bmiFactor = 1.0;
    else if (bmi <= 29.9) bmiFactor = 0.85;
    else bmiFactor = 0.7;
    
    const recommendedSteps = Math.round(8000 * ageFactor * bmiFactor);
    const walkingDistanceKm = (recommendedSteps * strideLengthM) / 1000;
    
    // Exercise calorie calculations (30-minute sessions)
    const exerciseCalories = {
      walking: {
        light: calculateMETCalories(2.5, weight, 30), // Casual walking
        moderate: calculateMETCalories(3.5, weight, 30), // Brisk walking
        fast: calculateMETCalories(4.5, weight, 30) // Power walking
      },
      running: {
        light: calculateMETCalories(6.0, weight, 30), // 5 mph jogging
        moderate: calculateMETCalories(8.3, weight, 30), // 6 mph running
        fast: calculateMETCalories(11.5, weight, 30) // 8 mph running
      },
      yoga: {
        gentle: calculateMETCalories(2.0, weight, 30), // Gentle yoga
        hatha: calculateMETCalories(2.5, weight, 30), // Hatha yoga
        power: calculateMETCalories(4.0, weight, 30) // Power yoga
      },
      stretching: {
        light: calculateMETCalories(1.8, weight, 30), // Light stretching
        moderate: calculateMETCalories(2.3, weight, 30) // Active stretching
      }
    };

    // Intermittent fasting calculations
    const fastingProtocols = {
      '16_8': {
        name: '16:8 Method',
        fastingHours: 16,
        eatingWindow: 8,
        description: 'Fast for 16 hours, eat within 8 hours',
        caloriesBurned: Math.round(bmr * 0.1), // Estimated metabolic boost
      },
      '18_6': {
        name: '18:6 Method',
        fastingHours: 18,
        eatingWindow: 6,
        description: 'Fast for 18 hours, eat within 6 hours',
        caloriesBurned: Math.round(bmr * 0.12),
      },
      '20_4': {
        name: '20:4 (Warrior Diet)',
        fastingHours: 20,
        eatingWindow: 4,
        description: 'Fast for 20 hours, eat within 4 hours',
        caloriesBurned: Math.round(bmr * 0.15),
      }
    };

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      weeklyWeightChange,
      bmi: Math.round(bmi * 10) / 10,
      recommendedSteps,
      walkingDistanceKm: Math.round(walkingDistanceKm * 100) / 100,
      strideLength: Math.round(strideLength),
      exerciseCalories,
      fastingProtocols
    };
  };

  const handleCalculate = () => {
    if (!age || !weight || !height) return;
    
    setLoading(true);

    setTimeout(() => {
      const metrics = calculateComprehensiveMetrics(
        parseInt(age), 
        parseFloat(weight), 
        parseFloat(height), 
        gender,
        activityLevel,
        weightGoal
      );
      
      setResults(metrics);
      setLoading(false);
    }, 800);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi <= 24.9) return { category: 'Normal', color: 'text-green-600' };
    if (bmi <= 29.9) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="h-8 w-8 mr-3" />
              <h2 className="text-3xl font-bold">Comprehensive Health Calculator</h2>
            </div>
            <p className="text-center text-indigo-100 max-w-3xl mx-auto">
              Get personalized BMR, calorie requirements, and activity recommendations based on your unique profile
            </p>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    min="0"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter your weight"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    min="0"
                    max="300"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Enter your height"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    min="0"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="sedentary">Sedentary (desk job)</option>
                    <option value="lightly_active">Lightly Active</option>
                    <option value="moderately_active">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                    <option value="extremely_active">Extremely Active</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight Goal
                  </label>
                  <select
                    value={weightGoal}
                    onChange={(e) => setWeightGoal(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="lose_aggressive">Lose Weight Fast (2 lbs/week)</option>
                    <option value="lose_moderate">Lose Weight Moderate (1.5 lbs/week)</option>
                    <option value="lose_gradual">Lose Weight Gradual (1 lb/week)</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain_gradual">Gain Weight Gradual (1 lb/week)</option>
                    <option value="gain_moderate">Gain Weight Moderate (1.5 lbs/week)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={loading || !age || !weight || !height}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-medium hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Calculating Your Health Profile...
                  </div>
                ) : (
                  'Calculate Complete Health Profile'
                )}
              </button>
            </div>

            {results && (
              <div className="mt-10 space-y-6">
                {/* Basic Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">BMR</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {results.bmr}
                    </div>
                    <p className="text-sm text-gray-600">calories/day at rest</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                    <div className="flex items-center mb-3">
                      <Target className="h-5 w-5 text-purple-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">Daily Calories</h3>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {results.targetCalories}
                    </div>
                    <p className="text-sm text-gray-600">for your goal</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                    <div className="flex items-center mb-3">
                      <Heart className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">BMI</h3>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {results.bmi}
                    </div>
                    <p className={`text-sm font-medium ${getBMICategory(results.bmi).color}`}>
                      {getBMICategory(results.bmi).category}
                    </p>
                  </div>
                </div>

                {/* Walking Recommendations */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-100">
                  <div className="flex items-center mb-4">
                    <Activity className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Personalized Walking Plan</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-green-600">{results.recommendedSteps.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Recommended Steps</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">{results.walkingDistanceKm} km</div>
                      <div className="text-sm text-gray-600">Walking Distance</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">{results.strideLength} cm</div>
                      <div className="text-sm text-gray-600">Your Stride Length</div>
                    </div>
                  </div>
                </div>

                {/* Exercise Calorie Burns */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                  <div className="flex items-center mb-4">
                    <Flame className="h-6 w-6 text-orange-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Exercise Calorie Burns (30 minutes)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Walking</h4>
                      <ul className="space-y-1 text-sm">
                        <li>Light: {results.exerciseCalories.walking.light} cal</li>
                        <li>Moderate: {results.exerciseCalories.walking.moderate} cal</li>
                        <li>Fast: {results.exerciseCalories.walking.fast} cal</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Running</h4>
                      <ul className="space-y-1 text-sm">
                        <li>Jogging: {results.exerciseCalories.running.light} cal</li>
                        <li>Running: {results.exerciseCalories.running.moderate} cal</li>
                        <li>Fast: {results.exerciseCalories.running.fast} cal</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Yoga</h4>
                      <ul className="space-y-1 text-sm">
                        <li>Gentle: {results.exerciseCalories.yoga.gentle} cal</li>
                        <li>Hatha: {results.exerciseCalories.yoga.hatha} cal</li>
                        <li>Power: {results.exerciseCalories.yoga.power} cal</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Stretching</h4>
                      <ul className="space-y-1 text-sm">
                        <li>Light: {results.exerciseCalories.stretching.light} cal</li>
                        <li>Active: {results.exerciseCalories.stretching.moderate} cal</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Intermittent Fasting */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                  <div className="flex items-center mb-4">
                    <Moon className="h-6 w-6 text-indigo-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Intermittent Fasting Options</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(results.fastingProtocols).map(([key, protocol]) => (
                      <div key={key} className="bg-white p-4 rounded-xl shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-2">{protocol.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{protocol.description}</p>
                        <div className="text-lg font-bold text-indigo-600">
                          +{protocol.caloriesBurned} cal
                        </div>
                        <div className="text-xs text-gray-500">estimated daily boost</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Progress Tracker */}
                {results.weeklyWeightChange !== 0 && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                    <div className="flex items-center mb-4">
                      <Clock className="h-6 w-6 text-emerald-600 mr-2" />
                      <h3 className="text-xl font-semibold text-gray-900">Expected Progress</h3>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-2">
                        {results.weeklyWeightChange > 0 ? '+' : ''}{results.weeklyWeightChange} kg/week
                      </div>
                      <p className="text-sm text-gray-600">
                        Following your calorie target of {results.targetCalories} calories per day
                      </p>
                    </div>
                  </div>
                )}

                {/* Health Tips */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Health Tips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <h4 className="font-semibold mb-2">Nutrition Tips:</h4>
                      <ul className="space-y-1">
                        <li>• Eat protein at every meal (0.8-1g per kg body weight)</li>
                        <li>• Stay hydrated (35ml per kg body weight daily)</li>
                        <li>• Time carbs around workouts for better energy</li>
                        <li>• Include healthy fats (20-30% of total calories)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Exercise Tips:</h4>
                      <ul className="space-y-1">
                        <li>• Start with walking and gradually increase intensity</li>
                        <li>• Include strength training 2-3 times per week</li>
                        <li>• Yoga helps with flexibility and stress management</li>
                        <li>• Listen to your body and rest when needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveHealthCalculator;