import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home,
  Waves,
  Trees,
  PlayCircle,
  Volleyball,
  Flower2,
  Tent,
  CalendarDays,
  Clock,
  Mail,
  Phone,
  Info
} from 'lucide-react';

const AmenitySection = ({ title, icon: Icon, children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`mb-12 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Icon size={28} className={`${isDarkMode ? 'text-darkblue-light' : 'text-greenblack-light'}`} />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey'}`}>
        {children}
      </div>
    </div>
  );
};

const FeatureList = ({ items }) => (
  <ul className="list-disc pl-6 space-y-2 mt-4">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const InfoBox = ({ title, content }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-darkblue-dark bg-opacity-30' : 'bg-greenblack-light bg-opacity-10'}`}>
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <Info size={16} />
        {title}
      </h4>
      <p>{content}</p>
    </div>
  );
};

const Amenities = () => {
  const { isDarkMode } = useTheme();

  const specialEvents = [
    "Summer BBQ & Pool Party: Celebrate summer with neighbors, food, and fun by the pool.",
    "Fall Festival: A family-friendly event with games, a pumpkin patch, and seasonal treats.",
    "Movie Nights on the Lawn: Join us for outdoor movie screenings under the stars.",
    "Holiday Decorating Contest: Spread holiday cheer and compete for the best-decorated home."
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} rounded-lg shadow-lg`}>
      <div className="container mx-auto px-6 py-12">
        <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-lg p-8`}>
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              Amenities at Summit Ridge
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              Welcome to the Amenities section! Summit Ridge is proud to offer a variety of facilities and outdoor spaces designed 
              to enrich the lives of our residents and provide a welcoming atmosphere for relaxation, recreation, and community connection.
            </p>
          </div>

          {/* Clubhouse */}
          <AmenitySection title="Clubhouse" icon={Home}>
            <p>Our community clubhouse is the heart of Summit Ridge, available for social gatherings, HOA meetings, and private events.</p>
            <FeatureList items={[
              "Multi-Purpose Rooms: Ideal for hosting parties, family gatherings, or even community classes and workshops.",
              "Lounge Area: A cozy space to relax, read, or chat with neighbors.",
              "Kitchenette: Equipped with basic appliances for your events."
            ]} />
            <InfoBox 
              title="Reservations"
              content="Residents can reserve the clubhouse for private events by contacting the HOA office or using the online reservation system."
            />
          </AmenitySection>

          {/* Swimming Pool */}
          <AmenitySection title="Swimming Pool" icon={Waves}>
            <p>Summit Ridge's sparkling swimming pool is the perfect place to cool off, exercise, or spend a sunny afternoon with family and friends.</p>
            <FeatureList items={[
              "Lap Lanes: Designated lanes for lap swimming during designated hours.",
              "Children's Wading Area: A shallow section for young children to play safely.",
              "Poolside Loungers & Umbrellas: Comfortable seating for relaxation and shade."
            ]} />
            <InfoBox 
              title="Pool Hours"
              content="Open daily, 8 AM - 8 PM. Lifeguards are on duty during peak hours in the summer."
            />
            <InfoBox 
              title="Safety Reminders"
              content="For everyone's safety, please follow posted pool rules and supervise children at all times."
            />
          </AmenitySection>

          {/* Parks & Trails */}
          <AmenitySection title="Parks & Trails" icon={Trees}>
            <p>Summit Ridge is known for its beautifully landscaped parks and nature trails.</p>
            <FeatureList items={[
              "Picnic Areas: Shaded tables and grills for outdoor dining.",
              "Scenic Walking Trails: Paved and natural paths perfect for walking, jogging, or biking.",
              "Dog-Friendly Spaces: Designated areas for pets to enjoy the outdoors (leash required)."
            ]} />
            <InfoBox 
              title="Hours"
              content="Our trails and green spaces are open from dawn to dusk, providing a peaceful retreat right in your backyard."
            />
          </AmenitySection>

          {/* Playground */}
          <AmenitySection title="Playground" icon={PlayCircle}>
            <p>Our family-friendly playground is equipped with safe, modern equipment and is designed for children of all ages.</p>
            <FeatureList items={[
              "Climbing Structures and Slides: Plenty of variety to keep kids entertained.",
              "Shaded Seating for Parents: Comfortable benches and shaded spots nearby.",
              "Safety Flooring: Impact-resistant surfaces to help prevent injuries."
            ]} />
            <InfoBox 
              title="Safety Note"
              content="For everyone's enjoyment, please ensure that children are supervised and use equipment as intended."
            />
          </AmenitySection>

          {/* Tennis & Basketball Courts */}
          <AmenitySection title="Tennis & Basketball Courts" icon={Volleyball}>
            <p>For those who enjoy staying active, our tennis and volleyball courts are a popular choice among residents.</p>
            <FeatureList items={[
              "Tennis Courts: Two full-size courts with well-maintained surfaces, nets, and shaded seating for spectators.",
              "Volleyball Court: A full-court setup, perfect for a friendly game with neighbors."
            ]} />
            <InfoBox 
              title="Court Hours"
              content="Open from 7 AM to 9 PM. Courts are first-come, first-served, but residents can reserve a court in advance for special occasions or group activities."
            />
          </AmenitySection>

          {/* Community Garden */}
          <AmenitySection title="Community Garden" icon={Flower2}>
            <p>Our community garden offers a tranquil space for residents to grow flowers, vegetables, and herbs.</p>
            <FeatureList items={[
              "Individual Plot Reservations: Residents can reserve garden plots on an annual basis.",
              "Community Toolshed: Access to gardening tools and supplies (feel free to bring your own as well)."
            ]} />
            <InfoBox 
              title="Events"
              content="Join us for spring planting day, seasonal gardening workshops, and the annual garden showcase!"
            />
          </AmenitySection>

          {/* Event Lawn & Picnic Pavilion */}
          <AmenitySection title="Event Lawn & Picnic Pavilion" icon={Tent}>
            <p>Located near the clubhouse, our event lawn and picnic pavilion provide the perfect setup for outdoor gatherings and seasonal events.</p>
            <FeatureList items={[
              "Family Picnic Pavilion: Large pavilion with picnic tables and BBQ grills.",
              "Event Lawn: Open green space ideal for concerts, community gatherings, and outdoor games."
            ]} />
            <InfoBox 
              title="Reservations"
              content="Residents may book these spaces for private events by contacting the HOA office or using the online booking system."
            />
          </AmenitySection>

          {/* Special Events */}
          <AmenitySection title="Special Events and Community Activities" icon={CalendarDays}>
            <p>At Summit Ridge, our amenities come to life through various events and activities organized by the HOA throughout the year. Some of our annual favorites include:</p>
            <FeatureList items={specialEvents} />
          </AmenitySection>

          {/* Contact Information */}
          <div className={`mt-12 p-6 rounded-lg ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? ' text-darkolive' : 'text-darkblue-light'}`}>
              Amenity Access & Reservations
            </h2>
            <p className="mb-4">
              Many of our amenities can be reserved online through the Summit Ridge HOA portal. 
              For more information on access, scheduling, and guidelines, please log in to your account or contact the HOA office.
            </p>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-2">
                <Mail size={20} />
                <a href="mailto:info@summitridgehoa.com" className="hover:underline">
                  info@summitridgehoa.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={20} />
                <span>(123) 456-7890</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Amenities;