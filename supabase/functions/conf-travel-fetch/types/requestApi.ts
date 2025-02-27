import { z } from "npm:zod";

export const ConferenceEventFetchSchema = z.object({
  eventTags: z.string().min(3),
  city: z.string(),
  country: z.string(),
  fromWhen: z.optional(z.string().datetime()),
});

export type ConferenceEventFetch = z.infer<typeof ConferenceEventFetchSchema>;

export const FlightItineraryFetchSchema = z.object({
  conferenceCity: z.string(),
  conferenceCountry: z.string(),
  departCity: z.string(),
  departCountry: z.string(),
  fromWhen: z.string().datetime(),
});

export type FlightItineraryFetch = z.infer<typeof FlightItineraryFetchSchema>;
