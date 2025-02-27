import { DateTime } from "npm:luxon";
import type { PerplexityApiReq } from "../types/index.ts";
import { appConfig } from "../config/index.ts";

const systemPrompt = `Only output the JSON list data without other messages.
Find at least 10 items per topic for all requests. If there is no item, output an empty JSON array.
If you could not find a value for a specific property, say 'TBA'.
Do not format the JSON string. This means never add "\`\`\`" or "\`\`\`json". `;

// we create a type descriptor here so that we can dynamically change the objects we expect from the LLM. This pattern only works with string props.
const eventListTypeDescriptor = {
  name: "Name of the event",
  eventDescription:
    "A comprehensive description of the event, agenda, the target audience, and what to expect from it",
  eventUrl:
    "The URL of the official event page, or a link to where user can read about the event. Never make this a TBA.",
  venueAddressCountry:
    "Just the name of the country where the conference event is taking place.",
  venueAddressCity:
    "Just the name of the city where the conference event is taking place.",
  venueAddressStreet:
    "Just the street address where the conference event is taking place.",
  eventStartDate:
    "ISO standard time (year, month, day, time) of when the event starts",
  eventEndDate:
    "ISO standard time (year, month, day, time) of when the event officially ends. If there is none, just say `TBA`",
  // thumbnail: "the URL to an image from the event",
};

export type FetchedEventListType = typeof eventListTypeDescriptor;

const getEventListPrompt = (
  confType: string,
  country: string,
  city: string,
  startDate: string,
) =>
  `Create a list of conferences and events regarding ${confType} or other related topics near ${country}, ${city} from ${startDate} and onwards.

The output should be a JSON data with the following properties:
${JSON.stringify(eventListTypeDescriptor)}
Limit the output to 5 items per request.
`;

const transportListTypeDescriptor = {
  name: "The name of the booking website where the user can book this flight",
  flightNo: "The flight number that will be used to search the current flight",
  airline: "The name of the airline company for this flight",
  bookingLink:
    "A URL string to the airplane booking site. This can be either the official website or a third-party booking website.",
  deportAddressCountry:
    "The name of the country where the deporting airport is in.",
  deportAddressCity: "The name of the city where the deporting airport is in.",
  deportAddressStreet: "The full street address of the deporting airport.",
  arrivalAddressCountry:
    "The name of the country where the arriving airport is in.",
  arrivalAddressCity: "The name of the city where the arrival airport is in.",
  arrivalAddressStreet: "The full street address of the arriving airport.",
  departTime:
    "ISO standard time (year, month, day, time) of when the user should depart from the deporting country.",
  arrivalTime:
    "ISO standard time (year, month, day, time) of when the user will be arriving at the destination airport.",
};

export type FetchedTransportListType = typeof transportListTypeDescriptor;

const getFlightOptionsPrompt = (
  destCity: string,
  destCountry: string,
  departCity: string,
  departCountry: string,
  startDate: string, // ISO datetime string
) =>
  `I want to travel to ${destCity}, ${destCountry} from ${departCity}, ${departCountry} on ${startDate}.
Search for all flight options departing from ${departCity}, ${departCountry} around ${startDate} or other the closest time, including layovers.

The output should be a structure JSON array string with the following properties per item:
${JSON.stringify(transportListTypeDescriptor)}
Limit the output to 3-5 items per request.
`;

const perplexityApiReqTemplate: PerplexityApiReq = {
  model: appConfig.perplexityModel,
  messages: [], // this will be overwritten with the functions below
  top_p: 0.9,
  return_images: false,
  return_related_questions: false,
  search_recency_filter: "week",
  stream: false,
  presence_penalty: 0,
  frequency_penalty: 0.1,
  max_tokens: 4000,
  temperature: 0.1,
};

export const fetchEventsApiPayload = (
  eventTags: string,
  country: string,
  city: string,
  when: string,
) => {
  return {
    ...perplexityApiReqTemplate,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: getEventListPrompt(eventTags, country, city, when),
      },
    ],
  } as PerplexityApiReq;
};

export const fetchFlightsApiPayload = (
  destCity: string,
  destCountry: string,
  departCity: string,
  departCountry: string,
  arrivalTime: string, // ISO datetime string
) => {
  return {
    ...perplexityApiReqTemplate,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: getFlightOptionsPrompt(
          destCity,
          destCountry,
          departCity,
          departCountry,
          arrivalTime,
        ),
      },
    ],
  } as PerplexityApiReq;
};
