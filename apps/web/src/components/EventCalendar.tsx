import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import type { EventItem } from '../types';

export function EventCalendar({ events }: { events: EventItem[] }) {
  return (
    <div className="calendar-card">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        locale="pt-br"
        events={events.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.startsAt,
          end: event.endsAt
        }))}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
      />
    </div>
  );
}
