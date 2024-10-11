"use client";

import { getUserEvent } from "@/actions/events";
import EventCard from "@/components/event-card";
import { Suspense } from "react";
import "./style.css";

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <span className="text-lg text-blue-500">Loading Events</span>
          <span className="dots text-lg text-blue-500"></span>
        </div>
      }
    >
      <Events />
    </Suspense>
  );
}

const Events = async () => {
  const { events, userName } = await getUserEvent();

  if (events.length === 0) {
    return <p>You haven&aspos; created any events yet {userName}.</p>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} username={userName} />
      ))}
    </div>
  );
};
