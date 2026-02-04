// src/components/SEO.js - Reusable SEO component
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  url = 'https://www.fastandyoga.com',
  image = 'https://www.fastandyoga.com/og-image.jpg',
  type = 'website',
  children 
}) => {
  const siteTitle = 'FastAndYoga';
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - Intermittent Fasting & Yoga App`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="FastAndYoga Team" />
      
      {children}
    </Helmet>
  );
};

export default SEO;

// Example usage in pages/HealthBenefits.js:
/*
import SEO from '../components/SEO';

const HealthBenefits = () => {
  return (
    <>
      <SEO 
        title="Health Benefits of Intermittent Fasting"
        description="Discover the science-backed health benefits of intermittent fasting. Learn how fasting can improve metabolism, brain function, and longevity."
        keywords="intermittent fasting benefits, health benefits, weight loss, metabolism, longevity, brain health"
        url="https://www.fastandyoga.com/health-benefits"
      />
      
      <div>
        Your health benefits content here...
      </div>
    </>
  );
};
*/

// Example usage in pages/YogaExercises.js:
/*
import SEO from '../components/SEO';

const YogaExercises = () => {
  return (
    <>
      <SEO 
        title="Free Yoga Exercises & Guided Sessions"
        description="Practice yoga with our free guided sessions. From beginner to advanced poses, find the perfect yoga routine for your fitness level."
        keywords="yoga exercises, yoga poses, guided yoga, free yoga, yoga for beginners, yoga routines"
        url="https://www.fastandyoga.com/yoga-exercises"
      />
      
      <div>
        Your yoga exercises content here...
      </div>
    </>
  );
};
*/

// Example usage in components/BMRCalculator.js:
/*
import SEO from '../components/SEO';

const BMRCalculator = () => {
  return (
    <>
      <SEO 
        title="Free BMR Calculator - Calculate Your Basal Metabolic Rate"
        description="Calculate your BMR (Basal Metabolic Rate) for free. Determine how many calories you burn at rest and optimize your fasting schedule."
        keywords="BMR calculator, basal metabolic rate, calorie calculator, metabolism calculator, weight loss calculator"
        url="https://www.fastandyoga.com/bmr-calculator"
      />
      
      <div>
        Your BMR calculator content here...
      </div>
    </>
  );
};
*/
