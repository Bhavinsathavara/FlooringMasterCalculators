import { ReactNode } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SEOHead from './SEOHead';
import Breadcrumb from './Breadcrumb';
import { calculators, getCalculatorsByCategory } from '@/lib/calculatorData';

interface CalculatorProps {
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords?: string[];
  children: ReactNode;
  category?: 'basic' | 'materials' | 'advanced';
}

export default function Calculator({ 
  title, 
  description, 
  metaTitle, 
  metaDescription, 
  keywords, 
  children,
  category = 'basic'
}: CalculatorProps) {
  return (
    <>
      <SEOHead 
        title={metaTitle}
        description={metaDescription}
        keywords={keywords}
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={[
            { label: 'Calculators', href: '/' },
            { label: title }
          ]} />
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{description}</p>
          </div>

          {/* Calculator Content */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>

          {/* How to Use Section */}
          <Card className="mt-8 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">How to Use This Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enter Values</h3>
                  <p className="text-gray-600 text-sm">Input your measurements and project specifications accurately.</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-secondary">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Select Options</h3>
                  <p className="text-gray-600 text-sm">Choose material types and installation methods relevant to your project.</p>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-yellow-600">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Get Results</h3>
                  <p className="text-gray-600 text-sm">Receive detailed calculations and professional recommendations.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="mt-8 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Why Use Our Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Professional Accuracy</h4>
                    <p className="text-gray-600 text-sm">Industry-standard formulas ensure precise calculations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <div className="w-4 h-4 bg-secondary rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Time Saving</h4>
                    <p className="text-gray-600 text-sm">Get instant results instead of manual calculations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Cost Optimization</h4>
                    <p className="text-gray-600 text-sm">Minimize waste and reduce project costs.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Calculators Section */}
          <Card className="mt-8 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Related Calculators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCalculatorsByCategory(category).slice(0, 6).map((calc) => (
                  <Link key={calc.id} href={calc.route}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{calc.icon}</div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{calc.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{calc.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6">
                <Link href="/">
                  <Button variant="outline" className="bg-primary text-white hover:bg-blue-700">
                    View All Calculators
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
