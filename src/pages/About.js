import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Users,
  Home,
  MessageSquare,
  Calendar,
  Shield,
  Layout,
  Award,
  Waves,
  Tent,
  PlayCircle,
  UserCheck,
  BookOpen,
  HandHeart,
  Globe
} from 'lucide-react';

const AboutSection = ({ title, children, icon: Icon }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`mb-12 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon size={24} className={`${isDarkMode ? 'text-darkblue-light' : 'text-greenblack-light'}`} />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
};

const AmenityCard = ({ title, description, icon: Icon }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey'} flex flex-col items-start`}>
      <Icon size={24} className="mb-3" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const ServiceCard = ({ title, description, icon: Icon }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`flex gap-4 p-6 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey'}`}>
      <Icon size={24} className="flex-shrink-0 mt-1" />
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

const About = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} rounded-lg shadow-lg`}>
      <div className="container mx-auto px-6 py-12">
        <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-lg p-8`}>
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              About Summit Ridge HOA
            </h1>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              Welcome to Summit Ridge HOA, where our mission is simple: to foster a thriving, harmonious community where all residents can enjoy the beauty and amenities of our neighborhood.
            </p>
          </div>

          {/* Mission Section */}
          <AboutSection title="Our Mission" icon={Award}>
            <p className="mb-4">
              We're committed to creating an environment where our residents feel at home, with well-maintained amenities, transparent communication, and proactive community services. Our board of dedicated volunteers works tirelessly to provide essential services, enforce standards, and ensure our community remains a beautiful, safe, and enjoyable place for everyone.
            </p>
          </AboutSection>

          {/* Services Section */}
          <AboutSection title="What We Do" icon={Layout}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ServiceCard
                icon={Home}
                title="Community Management"
                description="From managing upkeep in shared spaces to planning community improvements, we work to keep our neighborhood clean, safe, and welcoming."
              />
              <ServiceCard
                icon={Shield}
                title="Property Value Protection"
                description="We establish and enforce guidelines that help maintain property values, ensuring our community is always a desirable place to live."
              />
              <ServiceCard
                icon={MessageSquare}
                title="Communication & Transparency"
                description="Regular updates, community announcements, and an active online portal make it easy for homeowners to stay informed and connected."
              />
              <ServiceCard
                icon={Calendar}
                title="Social Events & Activities"
                description="We host and organize various social events throughout the year, such as neighborhood block parties, seasonal gatherings, and volunteer opportunities."
              />
            </div>
          </AboutSection>

          {/* Amenities Section */}
          <AboutSection title="Our Amenities" icon={Layout}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <AmenityCard
                icon={Layout}
                title="Clubhouse"
                description="Available for events, meetings, and private functions."
              />
              <AmenityCard
                icon={Waves}
                title="Swimming Pool"
                description="A central spot for relaxation and exercise, with seasonal hours and safety regulations."
              />
              <AmenityCard
                icon={Tent}
                title="Parks & Trails"
                description="Well-maintained green spaces for walking, picnicking, and enjoying nature."
              />
              <AmenityCard
                icon={PlayCircle}
                title="Playground & Recreation"
                description="Designed for families and kids, perfect for play and community interaction."
              />
            </div>
          </AboutSection>

          {/* Board, Operations, and Involvement Sections */}
          <AboutSection title="Meet Our Board" icon={Users}>
            <p className="mb-4">
              Our HOA board consists of dedicated community members who volunteer their time and effort to ensure Summit Ridge runs smoothly. From reviewing neighborhood improvement projects to managing financial budgets, our board members are here to serve you.
            </p>
          </AboutSection>

          <AboutSection title="How We Operate" icon={BookOpen}>
            <p className="mb-4">
              Summit Ridge HOA operates under a set of Covenants, Conditions, and Restrictions (CC&Rs) along with Rules and Regulations created to maintain the quality and character of our neighborhood. Our approach to enforcement is always considerate, balancing the needs of individual residents with the wellbeing of the community as a whole.
            </p>
          </AboutSection>

          <AboutSection title="Get Involved" icon={HandHeart}>
            <p className="mb-4">
              Summit Ridge thrives on resident involvement. Homeowners are encouraged to participate in board meetings, volunteer for community committees, and attend our annual HOA meetings where we discuss community projects, upcoming events, and key topics impacting our neighborhood.
            </p>
          </AboutSection>

          <AboutSection title="Stay Connected" icon={Globe}>
            <p className="mb-4">
              With the Summit Ridge HOA online portal, staying connected has never been easier. Our website provides homeowners with access to key information, announcements, community calendars, payment processing for dues, and much more. We also offer a secure messaging system, making it simple for you to communicate with board members or other residents.
            </p>
          </AboutSection>
        </div>
      </div>
    </div>
  );
};

export default About;