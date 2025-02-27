export * from "./perplexityApiResponse.ts";

export interface ConferenceEvent {
  id: string;
  name: string;
  thumbnail?: string;
  venueAddress: Location;
  eventStartDate: number, // epoch seconds
  eventEndDate?: number, // epoch seconds
  eventDescription: string;
  eventUrl: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  departLocation: Location;
}

export interface Budget {
  minBudget: number;
  maxBudget: number;
  currencySymbol: string;
}

export interface FlightItinerary {
  id: string;
  flightNo: string;
  airline: string;
  bookingLink: string;
  departAddress: Location;
  arrivalAddress: Location;
  departTime: number, // epoch seconds
  arrivalTime: number, // epoch seconds
}

export interface AttendeeItinerary {
  eventId: string;
  attendeeId: string;
  flightIds: string[];
  budget?: Budget;
}

export interface LikedEvents {
  savedEvents: ConferenceEvent[];
}

export interface SavedItinerary {
  savedItinerary: AttendeeItinerary[];
}

export interface Location {
  city: string;
  country: string;
  fullAddr: string; // street address
}
