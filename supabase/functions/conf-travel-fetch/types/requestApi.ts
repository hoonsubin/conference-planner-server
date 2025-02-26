import { z } from "npm:zod";

const ConferenceEventFetchSchema = z.object({
  eventTags: z.string().min(3),
  city: z.string(),
  country: z.string(),
  fullAdr: z.string(),
  fromWhen: z.optional(z.string().time()),
});

export type ConferenceEventFetch = z.infer<typeof ConferenceEventFetchSchema>;

const FlightItineraryFetchSchema = z.object({
  conferenceCity: z.string(),
  conferenceCountry: z.string(),
  departCity: z.string(),
  departCountry: z.string(),
  fromWhen: z.optional(z.string().time()),
});

export type FlightItineraryFetchSchema = z.infer<typeof FlightItineraryFetchSchema>;
