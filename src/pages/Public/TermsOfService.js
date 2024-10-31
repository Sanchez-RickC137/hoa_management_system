import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';




const TermsOfService = () => {
  const { isDarkMode } = useTheme();

  const sections = [
    {
      title: "1. General Use",
      content: [
        "The Summit Ridge HOA website provides information and services to our homeowners and residents. Access to certain areas may require an account.",
        "You agree to use this website in accordance with all applicable laws and regulations. You will not use the website for any unlawful purpose or in a way that could damage, disable, or impair it."
      ]
    },
    {
      title: "2. User Accounts",
      content: [
        "To access certain features, you must register and create an account. You are responsible for maintaining the confidentiality of your account information.",
        "You agree to notify us immediately of any unauthorized use of your account or any security breach. We are not liable for any loss or damage resulting from your failure to safeguard your account information."
      ]
    },
    {
      title: "3. Payments",
      content: [
        "Payment of HOA dues, fines, or other fees may be processed through our website. You agree that all payments are subject to verification and may incur transaction fees.",
        "Payments are final and non-refundable unless otherwise specified in HOA policies or by board approval."
      ]
    },
    {
      title: "4. Intellectual Property",
      content: [
        "All content, logos, images, and other materials on this website are the property of Summit Ridge HOA or its licensors. You may not copy, distribute, or modify any content without prior permission.",
        "Unauthorized use of any content on this site may violate copyright, trademark, and other laws."
      ]
    },
    {
      title: "5. Privacy and Data Security",
      content: [
        "Our Privacy Policy explains how we handle and protect your personal information. By using our site, you consent to our collection and use of data as described in the Privacy Policy."
      ]
    },
    {
      title: "6. Disclaimer of Warranties",
      content: [
        "This website is provided on an \"as-is\" and \"as-available\" basis. Summit Ridge HOA makes no warranties, expressed or implied, and disclaims all other warranties, including but not limited to implied warranties of merchantability or fitness for a particular purpose."
      ]
    },
    {
      title: "7. Limitation of Liability",
      content: [
        "Summit Ridge HOA is not liable for any damages arising from your use of the website, including direct, indirect, incidental, or consequential damages."
      ]
    },
    {
      title: "8. Changes to Terms",
      content: [
        "We may update these Terms of Service from time to time. We encourage you to review this page periodically. Continued use of the site after changes implies acceptance of the new terms."
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'}`}>
      <div className="container mx-auto px-4 py-12">
        <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-lg p-8`}>
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Summit Ridge HOA - Terms of Service
          </h1>
          
          <p className={`mb-6 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Effective Date: October 1, 2023
          </p>

          <div className={`prose max-w-none ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            <p className="mb-6">
              Welcome to the Summit Ridge HOA website. By accessing or using our website, you agree to comply with the following Terms of Service. 
              If you do not agree with any of these terms, please do not use our site.
            </p>

            {sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}

            <div className="mt-8 pt-6 border-t border-gray-300">
              <p>
                If you have questions about these terms, please contact us at{' '}
                <a 
                  href="mailto:info@summitridgehoa.com" 
                  className={`${isDarkMode ? 'text-darkblue-light hover:text-darkblue-dark' : 'text-greenblack-light hover:text-greenblack-dark'}`}
                >
                  info@summitridgehoa.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;