import axios from "axios";
import Constants from "expo-constants";

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY ?? "default_value";

export interface LocationData {
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export interface DirectionsResult {
  distance: string;
  duration: string;
  polyline: { latitude: number; longitude: number }[];
  steps?: {
    instruction: string;
    point: { latitude: number; longitude: number };
  }[];
}

export const googleMapsService = {
  async fetchAddressSuggestions(query: string): Promise<LocationData[]> {
    try {
      const res = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
        params: {
          input: query,
          key: GOOGLE_MAPS_API_KEY,
          types: "address",
        },
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.data.predictions || res.data.status !== "OK") {
        throw new Error(res.data.error_message || "Failed to fetch suggestions");
      }

      const placesDetailsPromises = res.data.predictions.map(async (prediction: any) => {
        const detailsRes = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
          params: {
            place_id: prediction.place_id,
            fields: "geometry,address_component,formatted_address",
            key: GOOGLE_MAPS_API_KEY,
          },
          headers: {
            Accept: "application/json",
          },
        });

        if (!detailsRes.data.result || detailsRes.data.status !== "OK" || !detailsRes.data.result.geometry) {
          return null;
        }

        const result = detailsRes.data.result;
        const addressComponents = result.address_components || [];
        let city = "";
        let postalCode = "";

        addressComponents.forEach((component: any) => {
          if (component.types.includes("locality") || component.types.includes("administrative_area_level_2")) {
            city = component.long_name;
          }
          if (component.types.includes("postal_code")) {
            postalCode = component.long_name;
          }
        });

        return {
          address: result.formatted_address,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          city,
          postalCode,
        };
      });

      const placesDetails = await Promise.all(placesDetailsPromises);
      return placesDetails.filter((place) => place !== null) as LocationData[];
    } catch (error: any) {
      console.error("Error fetching address suggestions:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw new Error(error.message || "Failed to fetch address suggestions");
    }
  },

  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{
    address: string;
    city: string;
    postalCode: string;
  }> {
    try {
      const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: GOOGLE_MAPS_API_KEY,
        },
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.data.results || res.data.status !== "OK") {
        throw new Error(res.data.error_message || "Failed to reverse geocode");
      }

      const result = res.data.results[0];
      const addressComponents = result.address_components || [];
      let city = "";
      let postalCode = "";

      addressComponents.forEach((component: any) => {
        if (component.types.includes("locality") || component.types.includes("administrative_area_level_2")) {
          city = component.long_name;
        }
        if (component.types.includes("postal_code")) {
          postalCode = component.long_name;
        }
      });

      return {
        address: result.formatted_address,
        city,
        postalCode,
      };
    } catch (error: any) {
      console.error("Error in reverse geocoding:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw new Error(error.message || "Failed to reverse geocode");
    }
  },

  async getDirections(originLat: number, originLng: number, destLat: number, destLng: number): Promise<DirectionsResult> {
    try {
      const res = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
        params: {
          origin: `${originLat},${originLng}`,
          destination: `${destLat},${destLng}`,
          key: GOOGLE_MAPS_API_KEY,
          mode: "driving",
        },
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.data.routes || res.data.status !== "OK") {
        throw new Error(res.data.error_message || "Failed to get directions");
      }

      const route = res.data.routes[0];
      const leg = route.legs[0];

      const polylinePoints = this.decodePolyline(route.overview_polyline.points);

      const steps = leg.steps?.map((step: any) => {
        const stepPolyline = this.decodePolyline(step.polyline.points);
        const middlePoint = stepPolyline[Math.floor(stepPolyline.length / 2)];

        return {
          instruction: step.html_instructions.replace(/<[^>]*>/g, ""),
          point: middlePoint || stepPolyline[0],
        };
      });

      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        polyline: polylinePoints,
        steps,
      };
    } catch (error: any) {
      console.error("Error getting directions:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw new Error(error.message || "Failed to get directions");
    }
  },

  async getDistanceMatrix(originLat: number, originLng: number, destLat: number, destLng: number): Promise<{ distance: string; duration: string }> {
    try {
      const res = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
        params: {
          origins: `${originLat},${originLng}`,
          destinations: `${destLat},${destLng}`,
          key: GOOGLE_MAPS_API_KEY,
          mode: "driving",
        },
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.data.rows || res.data.status !== "OK") {
        throw new Error(res.data.error_message || "Failed to get distance matrix");
      }

      const element = res.data.rows[0].elements[0];
      if (element.status !== "OK") {
        throw new Error("Route not available");
      }

      return {
        distance: element.distance.text,
        duration: element.duration.text,
      };
    } catch (error: any) {
      console.error("Error getting distance matrix:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw new Error(error.message || "Failed to get distance matrix");
    }
  },

  async getRouteInfo(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<
    DirectionsResult & {
      distanceMatrix: { distance: string; duration: string };
    }
  > {
    try {
      const [directions, distanceMatrix] = await Promise.all([this.getDirections(originLat, originLng, destLat, destLng), this.getDistanceMatrix(originLat, originLng, destLat, destLng)]);

      return {
        ...directions,
        distanceMatrix,
      };
    } catch (error: any) {
      console.error("Error getting route info:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw new Error(error.message || "Failed to get route info");
    }
  },

  decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
    const poly: { latitude: number; longitude: number }[] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return poly;
  },
};
