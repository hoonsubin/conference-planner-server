import * as llmPrompts from "./prompts.ts";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { appConfig } from "../config/index.ts";
import {
  Attendee,
  ConferenceEvent,
  FlightItinerary,
  Location,
  PerplexityApiRes,
} from "../types/index.ts";
import stripJsonComments from "npm:strip-json-comments";
import { DateTime } from "luxon";

export const perplexityApiInst = (apiKey: string) => {
  const apiInst = axios.create({
    baseURL: appConfig.perplexityEndpoint,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 60000,
  });

  return apiInst;
};

export const fetchFlightSchedule = async (
  api: AxiosInstance,
  eventStartDate: number,
  venueLoc: Location,
  attendeeLoc: Location,
  flightArrivalTime?: DateTime, // defaults to the conference start day if none
) => {
  const arrivalTime = flightArrivalTime || eventStartDate;

  const newReq = llmPrompts.fetchFlightsApiPayload(
    venueLoc,
    attendeeLoc,
    arrivalTime,
  );

  try {
    // todo: handle timeout errors or when the AI cannot find any results
    // send the prompts to the LLM API
    const res: AxiosResponse<PerplexityApiRes> = await api.post(
      "/chat/completions",
      newReq,
    );

    const resData = res.data;

    if (resData) {
      console.log(resData.choices[0].message.content);

      // clean the response to be a proper JSON string
      const cleanJsonString = stripJsonComments(
        resData.choices[0].message.content
          .replaceAll("```", "")
          .replaceAll("json", "")
          .replaceAll("\n", ""),
      );

      console.log(cleanJsonString);

      const transportOptionObj: llmPrompts.FetchedTransportListType[] = JSON
        .parse(cleanJsonString);

      //return transportOptionObj;
      return transportOptionObj.map((i) => {
        return {
          id: crypto.randomUUID(),
          flightNo: i.flightNo,
          airline: i.airline,
          bookingLink: i.bookingLink,
          departAddress: {
            //todo: fix these
            city: i.deportAddressCity,
            country: i.deportAddressCountry,
            fullAddr: i.deportAddressStreet,
          },
          arrivalAddress: {
            city: i.arrivalAddressCity,
            country: i.arrivalAddressCountry,
            fullAddr: i.arrivalAddressStreet,
          },
          departTime: DateTime.fromISO(i.departTime),
          arrivalTime: DateTime.fromISO(i.arrivalTime),
        };
      }) as FlightItinerary[];
    } else {
      throw new Error(
        "Error with the response. Status: " + res.status.toString(),
      );
    }
  } catch (err) {
    // todo: retry the API call if the result was not desirable.
    console.error(err);

    return [];
  }
};

export const fetchConferenceList = async (
  api: AxiosInstance,
  eventTags: string,
  location: Location,
  when: DateTime = DateTime.now(),
) => {
  if (!eventTags) {
    throw new Error("No event tag was provided");
  }
  if (!location) {
    throw new Error("No event location was provided");
  }

  // create a prompt for the LLM
  const newReq = llmPrompts.fetchEventsApiPayload(eventTags, location, when);

  console.log(`Sending the following request\n${JSON.stringify(newReq)}`);
  try {
    // todo: handle timeout errors or when the AI cannot find any results
    // send the prompts to the LLM API
    const res: AxiosResponse<PerplexityApiRes> = await api.post(
      "/chat/completions",
      newReq,
    );
    const resData = res.data;

    if (resData) {
      // clean the response to be a proper JSON string
      const cleanJsonString = stripJsonComments(
        resData.choices[0].message.content
          .replaceAll("```", "")
          .replaceAll("json", "")
          .replaceAll("\n", ""),
      );

      console.log(
        `Sanitized ${resData.choices[0].message.content} to ${cleanJsonString}`,
      );

      // make sure to remove the comments before parsing
      const eventObj: llmPrompts.FetchedEventListType[] = JSON.parse(
        cleanJsonString,
      );

      // although we can easily modify FetchedEventListType to look like Event,
      return eventObj.map((i) => {
        return {
          id: crypto.randomUUID(),
          name: i.name,
          eventDescription: i.eventDescription,
          venueAddress: {
            city: i.venueAddressCity,
            country: i.venueAddressCountry,
            fullAddr: i.venueAddressStreet,
          },
          eventUrl: i.eventUrl,
          eventStartDate: i.eventStartDate.match("TB")
            ? DateTime.fromISO(i.eventStartDate)
            : i.eventStartDate,
          eventEndDate: i.eventEndDate.match("TB")
            ? DateTime.fromISO(i.eventEndDate)
            : i.eventStartDate,
          //thumbnail: i.thumbnail,
        } as ConferenceEvent; // todo: fix this
      });
    } else {
      throw new Error(
        "Error with the response. Status: " + res.status.toString(),
      );
    }
  } catch (err) {
    // todo: retry the API call if the result was not desirable.
    console.error(err);

    return [];
  }
};
