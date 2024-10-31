import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PrivacyPolicy = () => {
  const { isDarkMode } = useTheme();

  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "Account Information: When you register on our website, we may collect your name, address, email, phone number, and other relevant account details.",
        "Payment Information: If you pay HOA dues or fines through our site, we may collect payment details for processing transactions. Payment information is handled securely and not stored on our servers.",
        "Website Usage Data: We may collect information on how you use our website, including pages viewed, time spent, and interactions, to improve our services."
      ]
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "To Manage HOA Services: We use your information to provide services, respond to requests, and manage your HOA account.",
        "For Communication: We may send emails or notifications about important HOA updates, announcements, and community news.",
        "To Improve the Website: We use website usage data to enhance user experience and optimize our services."
      ]
    },
    {
      title: "3. Sharing Your Information",
      content: [
        "We do not sell, rent, or trade your personal information to third parties. We may share data with trusted service providers (e.g., payment processors) who assist us in operating the website. All third parties are required to protect your data according to this policy."
      ]
    },
    {
      title: "4. Data Security",
      content: [
        "We implement appropriate technical and organizational measures to protect your data from unauthorized access, alteration, or destruction. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security."
      ]
    },
    {
      title: "5. Cookies",
      content: [
        "Our website uses cookies to improve functionality and enhance user experience. Cookies are small text files stored on your device that help us understand website usage. You can disable cookies in your browser settings, though this may limit your ability to use certain features."
      ]
    },
    {
      title: "6. Your Rights",
      content: [
        "You have the right to access, update, or delete your personal information. You may contact us at info@summitridgehoa.com to request changes to your data."
      ]
    },
    {
      title: "7. Policy Changes",
      content: [
        "We may update this Privacy Policy periodically to reflect changes in our practices. We encourage you to review this page occasionally for the latest information on our privacy practices."
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'}`}>
      <div className="container mx-auto px-4 py-12">
        <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-lg p-8`}>
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Summit Ridge HOA - Privacy Policy
          </h1>
          
          <p className={`mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Effective Date: October 1, 2023
          </p>

          <div className={`prose max-w-none ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            <p className="mb-6">
              Summit Ridge HOA ("we," "our," or "us") respects your privacy and is committed to protecting the personal information 
              you share with us. This Privacy Policy explains how we collect, use, and safeguard your data.
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
                If you have questions about this Privacy Policy, please contact us at{' '}
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

export default PrivacyPolicy;