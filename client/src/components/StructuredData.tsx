interface StructuredDataProps {
  type: 'calculator' | 'article' | 'website';
  title: string;
  description: string;
  url?: string;
  calculatorType?: string;
  category?: string;
}

export default function StructuredData({ 
  type, 
  title, 
  description, 
  url, 
  calculatorType,
  category 
}: StructuredDataProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "name": title,
      "description": description,
      "url": currentUrl,
      "publisher": {
        "@type": "Organization",
        "name": "FlooringCalc Pro",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      }
    };

    switch (type) {
      case 'calculator':
        return {
          ...baseData,
          "@type": "WebApplication",
          "applicationCategory": "BusinessApplication",
          "applicationSubCategory": "Calculator",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "Material quantity calculations",
            "Cost estimation",
            "Installation guidance",
            "Waste percentage calculations"
          ],
          "about": {
            "@type": "Thing",
            "name": calculatorType || "Flooring Calculator",
            "category": category || "Construction Tools"
          }
        };
      
      case 'article':
        return {
          ...baseData,
          "@type": "Article",
          "articleSection": "Flooring Guides",
          "wordCount": description.length,
          "datePublished": new Date().toISOString(),
          "dateModified": new Date().toISOString(),
          "author": {
            "@type": "Organization",
            "name": "FlooringCalc Pro"
          }
        };
      
      case 'website':
        return {
          ...baseData,
          "@type": "WebSite",
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        };
      
      default:
        return baseData;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
}