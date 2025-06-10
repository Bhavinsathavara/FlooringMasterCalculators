import { useState } from 'react';
import { CheckCircle, Smartphone, Shield, Zap, ArrowRight, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CalculatorCard from '@/components/CalculatorCard';
import SEOHead from '@/components/SEOHead';
import { calculators, getCalculatorsByCategory } from '@/lib/calculatorData';
import QuickNav from '@/components/QuickNav';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const filteredCalculators = getCalculatorsByCategory(activeCategory);

  const categories = [
    { id: 'all', label: 'All Calculators' },
    { id: 'basic', label: 'Basic Calculations' },
    { id: 'materials', label: 'Material Types' },
    { id: 'advanced', label: 'Advanced Tools' },
  ];

  const keyFeatures = [
    { icon: CheckCircle, text: '40+ Calculators', color: 'text-secondary' },
    { icon: Smartphone, text: 'Mobile Optimized', color: 'text-secondary' },
    { icon: Shield, text: 'Industry Trusted', color: 'text-secondary' },
    { icon: Zap, text: 'Instant Results', color: 'text-secondary' },
  ];

  const howToSteps = [
    {
      number: '1',
      title: 'Enter Measurements',
      description: 'Input your room dimensions, material specifications, and project requirements with our guided forms.',
      bgColor: 'bg-blue-100',
      textColor: 'text-primary',
    },
    {
      number: '2',
      title: 'Select Options',
      description: 'Choose material type, installation method, and additional features relevant to your specific project.',
      bgColor: 'bg-green-100',
      textColor: 'text-secondary',
    },
    {
      number: '3',
      title: 'Get Results',
      description: 'Receive instant, accurate calculations with detailed breakdowns and professional recommendations.',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
  ];

  const benefits = [
    {
      icon: '🎯',
      title: 'Precision Accuracy',
      description: 'Industry-standard formulas ensure calculations are accurate to within 1% margin of error.',
      bgColor: 'bg-blue-100',
      iconColor: 'text-primary',
    },
    {
      icon: '⏰',
      title: 'Save Time',
      description: 'Complete complex calculations in seconds instead of hours of manual computation.',
      bgColor: 'bg-green-100',
      iconColor: 'text-secondary',
    },
    {
      icon: '💰',
      title: 'Reduce Costs',
      description: 'Minimize material waste and over-ordering with precise quantity calculations.',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Use on-site with any device - calculations work perfectly on phones and tablets.',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      icon: '🎓',
      title: 'Educational',
      description: 'Learn while you calculate with detailed explanations and industry tips.',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      icon: '🛡️',
      title: 'Professional Grade',
      description: 'Developed with input from experienced contractors and flooring professionals.',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
  ];

  return (
    <>
      <SEOHead
        title="Professional Flooring Calculators - 40+ Free Tools for Contractors & Homeowners"
        description="Professional flooring calculators with 40+ specialized tools. Calculate costs, materials, square footage, waste percentage, and more. Free, accurate, and easy-to-use for contractors and DIY projects."
        keywords={[
          'flooring calculator',
          'flooring cost calculator',
          'square footage calculator',
          'tile calculator',
          'hardwood calculator',
          'vinyl flooring calculator',
          'flooring estimator',
          'construction calculator',
        ]}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="gradient-bg text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Professional Flooring<br />
                <span className="text-blue-200">Calculators Suite</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                40+ specialized calculators for accurate flooring estimates. Save time, reduce waste, and increase profitability with our professional-grade tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#calculators">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4">
                    <ArrowRight className="mr-2" size={20} />
                    Start Calculating
                  </Button>
                </a>
                <a href="#how-to-use">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4">
                    <Play className="mr-2" size={20} />
                    How It Works
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Strip */}
        <section className="bg-white py-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              {keyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-center space-x-2">
                  <feature.icon className={`${feature.color} text-xl`} size={24} />
                  <span className="font-semibold text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator Categories */}
        <section id="calculators" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Calculator</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional-grade calculators for every flooring project. From basic square footage to complex pattern layouts.
              </p>
            </div>

            {/* Quick Navigation for Popular Calculators */}
            <QuickNav />

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  variant={activeCategory === category.id ? 'default' : 'outline'}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary text-white hover:bg-blue-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                  }`}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Calculator Grid */}
            <div className="calculator-grid">
              {filteredCalculators.map((calculator) => (
                <CalculatorCard key={calculator.id} calculator={calculator} />
              ))}

              {/* More Calculators Card */}
              <Card className="calculator-card bg-gradient-to-br from-primary to-blue-700 text-white shadow-lg border border-gray-200 fade-in">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Plus className="text-4xl text-blue-200 mb-4 mx-auto" size={48} />
                    <h3 className="text-xl font-bold mb-2">40+ Professional Tools</h3>
                    <p className="text-blue-100 mb-4">Complete calculator suite for every flooring project type</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-100 mb-4">
                      <div>• Stone & Marble</div>
                      <div>• Carpet & Rugs</div>
                      <div>• Concrete & Epoxy</div>
                      <div>• Cork & Bamboo</div>
                      <div>• Trim & Molding</div>
                      <div>• Subfloor & Prep</div>
                    </div>
                    <Button variant="ghost" className="text-white border-white hover:bg-white hover:text-primary">
                      Explore All Tools <ArrowRight className="ml-1" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section id="how-to-use" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How to Use Our Calculators</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get accurate results in 3 simple steps. Our calculators are designed for both professionals and DIY enthusiasts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howToSteps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className={`${step.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <span className={`text-2xl font-bold ${step.textColor}`}>{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose FlooringCalc Pro</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Trusted by contractors, architects, and homeowners for accurate flooring calculations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className={`${benefit.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <span className="text-xl">{benefit.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
