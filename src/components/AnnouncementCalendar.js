import React, { useMemo, useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { useTheme } from '../contexts/ThemeContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const AnnouncementCalendar = ({ announcements, onEventClick }) => {
  const { isDarkMode } = useTheme();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [view, setView] = useState('month');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width < 768) {
        setView('agenda');
      } else {
        setView('month');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const locales = {
    'en-US': require('date-fns/locale/en-US')
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  const events = useMemo(() => {
    return announcements
      .filter(a => a.TYPE === 'EVENT' && a.EVENT_DATE)
      .map(a => ({
        id: a.ANNOUNCEMENT_ID,
        title: a.TITLE,
        start: new Date(a.EVENT_DATE),
        end: a.EVENT_END_DATE ? new Date(a.EVENT_END_DATE) : new Date(a.EVENT_DATE),
        location: a.EVENT_LOCATION,
        resource: a
      }));
  }, [announcements]);

  const formats = {
    agendaDateFormat: 'MMM d',
    agendaHeaderFormat: ({ start, end }) =>
      `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`,
    dayFormat: 'EEE M/d',
    dayHeaderFormat: 'MMM d',
    monthHeaderFormat: 'MMMM yyyy'
  };

  return (
    <div className="flex flex-col">
      <h2 className={`text-xl md:text-2xl font-semibold mb-2 md:mb-4 text-center text-tanish-dark ${
        windowWidth < 768 ? 'mt-2' : ''
      }`}>
        Events Calendar
      </h2>
      <div className={`
        announcement-calendar
        relative
        min-h-[400px] h-[calc(100vh-400px)] md:h-[600px]
        mt-2 md:mt-0
        rounded-lg
        overflow-hidden
      `}>
        <style>
          {`
            .rbc-calendar {
              background-color: #2B2F2D !important;
              color: #E5E1D8 !important;
            }
            
            .rbc-toolbar {
              padding: ${windowWidth < 768 ? '0.25rem' : '0.75rem'} !important;
              margin-bottom: ${windowWidth < 768 ? '0.5rem' : '1rem'} !important;
              border-radius: 0.5rem;
              flex-direction: ${windowWidth < 768 ? 'column' : 'row'};
              gap: ${windowWidth < 768 ? '0.25rem' : '0.5rem'};
              justify-content: space-between !important;
              min-height: ${windowWidth < 768 ? 'auto' : '48px'};
            }

            .rbc-toolbar-label {
              text-align: left !important;
              flex: 1 !important;
              margin: 0 0.5rem !important;
              font-size: ${windowWidth < 768 ? '0.875rem' : '1rem'} !important;
            }

            .rbc-btn-group {
              display: flex !important;
              gap: 0.25rem !important;
            }

            .rbc-toolbar button {
              padding: ${windowWidth < 768 ? '0.25rem 0.5rem' : '0.5rem 1rem'} !important;
              font-size: ${windowWidth < 768 ? '0.75rem' : '0.875rem'} !important;
              color: #2B2F2D !important;  /* Dark text color */
              background-color: #E5E1D8 !important;  /* Light background */
              border: 1px solid #354856 !important;
            }
            
            .rbc-toolbar button:hover {
               background-color: #c8c4bc !important;  /* Slightly darker on hover */
            }
              
            .rbc-toolbar button.rbc-active {
              background-color: #4B7F52 !important;  /* Use green for active state */
              color: #E5E1D8 !important;  /* Light text for contrast */
            }

            .rbc-toolbar button.rbc-active:hover {
              background-color: #3d6642 !important;  /* Darker green on hover */
            }

            .rbc-month-view,
            .rbc-agenda-view table {
              border: 1px solid #354856 !important;
              background-color: #2B2F2D !important;
              border-radius: 0.5rem;
              overflow: hidden;
            }

            .rbc-month-row,
            .rbc-day-bg {
              border-color: #354856 !important;
            }

            .rbc-off-range-bg {
              background-color: rgba(53, 72, 86, 0.4) !important;
            }

            .rbc-off-range {
              color: #6B7280 !important;
            }

            .rbc-today {
              background-color: #354856 !important;
            }

            .rbc-header {
              background-color: #354856 !important;
              color: #E5E1D8 !important;
              padding: ${windowWidth < 768 ? '0.25rem' : '0.75rem'};
              font-weight: bold;
              font-size: ${windowWidth < 768 ? '0.75rem' : '0.875rem'};
            }

            .rbc-event {
              background-color: #4B7F52 !important;
              border: none !important;
              border-radius: 0.25rem;
              color: #E5E1D8 !important;
            }

            .rbc-agenda-view {
              margin: 0;
              border: none;
              border-radius: 0.5rem;
              overflow: hidden;
            }

            .rbc-agenda-empty {
              color: #E5E1D8 !important;
              background-color: #2B2F2D !important;
              padding: 1rem;
              text-align: center;
            }

            .rbc-agenda-table {
              font-size: ${windowWidth < 768 ? '0.875rem' : '1rem'} !important;
            }

            .rbc-agenda-date-cell,
            .rbc-agenda-time-cell,
            .rbc-agenda-event-cell {
              padding: ${windowWidth < 768 ? '0.5rem' : '0.75rem'} !important;
              font-size: ${windowWidth < 768 ? '0.875rem' : '1rem'} !important;
              color: #E5E1D8 !important;
            }

            .rbc-agenda-view table thead {
              font-size: ${windowWidth < 768 ? '0.75rem' : '0.875rem'} !important;
              background-color: #354856 !important;
            }

            .rbc-agenda-view table tbody > tr {
              height: ${windowWidth < 768 ? 'auto' : '48px'} !important;
            }
          `}
        </style>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={(event) => onEventClick(event.resource)}
          view={view}
          onView={setView}
          views={windowWidth < 768 ? ['agenda'] : ['month', 'agenda']}
          formats={formats}
          defaultView={windowWidth < 768 ? 'agenda' : 'month'}
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

export default AnnouncementCalendar;