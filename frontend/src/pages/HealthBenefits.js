import React, { useState } from 'react';

const WellnessBenefits = () => {
  const [activeTab, setActiveTab] = useState('fasting');

  const fastingBenefits = [
    {
      title: "Weight Management & Fat Loss",
      description: "Supports sustainable weight loss by limiting caloric intake and enhancing fat metabolism."
    },
    {
      title: "Improved Insulin Sensitivity",
      description: "Enhances the body’s response to insulin, reducing blood sugar spikes and diabetes risk."
    },
    {
      title: "Cellular Autophagy",
      description: "Stimulates cellular repair by breaking down damaged components during fasting periods."
    },
    {
      title: "Reduced Inflammation",
      description: "Lowers systemic inflammation, contributing to better immune and cardiovascular health."
    },
    {
      title: "Brain Health Boost",
      description: "Supports cognitive function and mental clarity by increasing BDNF and reducing oxidative stress."
    },
    {
      title: "Heart Health",
      description: "May help lower blood pressure and improve cholesterol levels, reducing heart disease risk."
    },
    {
      title: "Longevity",
      description: "Engages protective cellular mechanisms linked to extended lifespan and healthy aging."
    },
    {
      title: "Metabolic Flexibility",
      description: "Improves the body's ability to efficiently switch between carbohydrate and fat metabolism."
    },
    {
      title: "Hormonal Balance",
      description: "Can support hormonal regulation including growth hormone, cortisol, and insulin levels."
    },
    {
      title: "Digestive Rest",
      description: "Gives the digestive system a break, promoting gut health and repair."
    }
  ];

  const yogaBenefits = [
    {
      title: "Increased Flexibility",
      description: "Gradual stretching improves joint range and muscle elasticity."
    },
    {
      title: "Stress Reduction",
      description: "Activates relaxation response, lowering cortisol and improving mood."
    },
    {
      title: "Improved Strength & Balance",
      description: "Enhances muscle tone, posture, and core stability."
    },
    {
      title: "Better Sleep",
      description: "Supports deeper, more restful sleep through nervous system regulation."
    },
    {
      title: "Breathing Efficiency",
      description: "Improves lung capacity and oxygen intake via pranayama."
    },
    {
      title: "Pain Relief",
      description: "Alleviates common pain conditions through mindful movement and alignment."
    },
    {
      title: "Mental Well-being",
      description: "Reduces anxiety and depression, fostering emotional resilience."
    },
    {
      title: "Postural Alignment",
      description: "Corrects poor posture and strengthens the spine."
    },
    {
      title: "Concentration & Focus",
      description: "Enhances attention and awareness through meditative movement."
    },
    {
      title: "Heart Health",
      description: "Boosts circulation and reduces blood pressure."
    }
  ];

  const walkingBenefits = [
    {
      title: "Heart Health",
      description: "Improves cardiovascular fitness and reduces stroke risk."
    },
    {
      title: "Weight Maintenance",
      description: "Burns calories, supports metabolism, and aids in healthy weight."
    },
    {
      title: "Joint & Bone Strength",
      description: "Improves bone density and reduces arthritis symptoms."
    },
    {
      title: "Mood Improvement",
      description: "Releases endorphins, reducing stress and enhancing emotional well-being."
    },
    {
      title: "Immune Boost",
      description: "Enhances immune response with consistent activity."
    },
    {
      title: "Sleep Quality",
      description: "Helps regulate sleep cycles and promotes deeper rest."
    },
    {
      title: "Blood Sugar Control",
      description: "Improves glucose regulation and supports diabetes prevention."
    },
    {
      title: "Digestive Function",
      description: "Stimulates digestion and reduces bloating."
    },
    {
      title: "Brain Function",
      description: "Supports cognitive health and reduces risk of dementia."
    },
    {
      title: "Longevity",
      description: "Regular walking is associated with increased lifespan and vitality."
    }
  ];

  const tabData = {
    fasting: {
      title: "Intermittent Fasting",
      subtitle: "Ancient Practice, Modern Science",
      benefits: fastingBenefits,
      description: "Intermittent fasting involves alternating between periods of eating and fasting, offering a variety of health benefits backed by modern science.",
      warning: "Consult your doctor before starting fasting, especially if you have health conditions."
    },
    yoga: {
      title: "Yoga Practice",
      subtitle: "Unity of Mind, Body, and Spirit",
      benefits: yogaBenefits,
      description: "Yoga combines movement, breathing, and meditation to enhance physical, mental, and emotional well-being.",
      warning: "Start gradually and consider professional guidance if you're new or have existing injuries."
    },
    walking: {
      title: "Regular Walking",
      subtitle: "Simple Steps to Better Health",
      benefits: walkingBenefits,
      description: "Walking is an easy and effective way to stay healthy, benefiting your heart, mind, and body."
      ,
      warning: "Wear supportive shoes and stay hydrated during long walks. Increase intensity over time."
    }
  };

  const currentData = tabData[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Complete Wellness Guide</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how fasting, yoga, and walking can elevate your health through science-backed benefits.
          </p>
        </div>

        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-2xl p-2 shadow-lg">
          {Object.entries(tabData).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-3 mx-1 my-1 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {data.title}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <h2 className="text-4xl font-bold mb-2">{currentData.title}</h2>
            <p className="text-xl opacity-90 mb-4">{currentData.subtitle}</p>
            <p className="text-lg opacity-80 leading-relaxed">{currentData.description}</p>
          </div>

          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Health Benefits</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {currentData.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-gray-100"
                >
                  <div className="flex items-start mb-3">
                    <div className="flex-shrink-0 w-3 h-3 mt-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3" />
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {benefit.title}
                    </h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Notice:</h4>
              <p className="text-yellow-800 leading-relaxed">{currentData.warning}</p>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
              <h4 className="font-semibold text-gray-900 mb-3">Getting Started:</h4>
              <div className="text-gray-700 leading-relaxed">
                {activeTab === 'fasting' && (
                  <p>Start with shorter fasting periods like 12:12 or 14:10 and increase based on comfort. Stay hydrated and avoid overly restrictive methods early on.</p>
                )}
                {activeTab === 'yoga' && (
                  <p>Try beginner routines online or in classes. Focus on consistency over intensity. Use props for support and avoid pushing through pain.</p>
                )}
                {activeTab === 'walking' && (
                  <p>Start with 10–15 minute walks, building up to 30 minutes daily. Maintain good posture and wear comfortable shoes.</p>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-8 p-6 bg-white rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Begin Your Wellness Journey?</h3>
            <p className="text-gray-600 mb-4">Combining fasting, yoga, and walking can synergize their effects and lead to holistic health improvements.</p>
            <p className="text-sm text-gray-500">Consistency is more important than perfection. Start small, keep going, and celebrate your progress.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessBenefits;
