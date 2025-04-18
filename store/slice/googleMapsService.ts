// // src/services/googleMapsService.ts
// import { getAxiosInstance } from "@/axios/axiosinstance";
// import Constants from "expo-constants";

// // Define your Google Maps API key
// const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

// export interface LocationData {
//   address: string;
//   city: string;
//   postalCode: string;
//   latitude: number;
//   longitude: number;
// }

// export const googleMapsService = {
//   /**
//    * Fetch address suggestions based on input query
//    */
//   async fetchAddressSuggestions(query: string): Promise<LocationData[]> {
//     try {
//       const axios = getAxiosInstance();
//       // Use Google Places Autocomplete API for address suggestions
//       const res = await axios.get(
//         `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
//         {
//           params: {
//             input: query,
//             key: GOOGLE_MAPS_API_KEY,
//             types: "address",
//           },
//         }
//       );

//       if (!res.data.predictions || res.data.status !== "OK") {
//         throw new Error(
//           res.data.error_message || "Failed to fetch suggestions"
//         );
//       }

//       // For each prediction, get place details to get coordinates
//       const placesDetailsPromises = res.data.predictions.map(
//         async (prediction: any) => {
//           const detailsRes = await axios.get(
//             `https://maps.googleapis.com/maps/api/place/details/json`,
//             {
//               params: {
//                 place_id: prediction.place_id,
//                 fields: "geometry,address_component,formatted_address",
//                 key: GOOGLE_MAPS_API_KEY,
//               },
//             }
//           );

//           if (
//             !detailsRes.data.result ||
//             detailsRes.data.status !== "OK" ||
//             !detailsRes.data.result.geometry
//           ) {
//             return null;
//           }

//           const result = detailsRes.data.result;
//           const addressComponents = result.address_components || [];

//           // Extract city and postal code from address components
//           let city = "";
//           let postalCode = "";

//           addressComponents.forEach((component: any) => {
//             if (
//               component.types.includes("locality") ||
//               component.types.includes("administrative_area_level_2")
//             ) {
//               city = component.long_name;
//             }
//             if (component.types.includes("postal_code")) {
//               postalCode = component.long_name;
//             }
//           });

//           return {
//             address: result.formatted_address,
//             latitude: result.geometry.location.lat,
//             longitude: result.geometry.location.lng,
//             city,
//             postalCode,
//           };
//         }
//       );

//       const placesDetails = await Promise.all(placesDetailsPromises);
//       return placesDetails.filter((place) => place !== null) as LocationData[];
//     } catch (error: any) {
//       console.error("Error fetching address suggestions:", error);
//       throw new Error(error.message || "Failed to fetch address suggestions");
//     }
//   },

//   /**
//    * Reverse geocode coordinates to address
//    */
//   async reverseGeocode(
//     latitude: number,
//     longitude: number
//   ): Promise<{
//     address: string;
//     city: string;
//     postalCode: string;
//   }> {
//     try {
//       const axios = getAxiosInstance();
//       const res = await axios.get(
//         `https://maps.googleapis.com/maps/api/geocode/json`,
//         {
//           params: {
//             latlng: `${latitude},${longitude}`,
//             key: GOOGLE_MAPS_API_KEY,
//           },
//         }
//       );

//       if (!res.data.results || res.data.status !== "OK") {
//         throw new Error(res.data.error_message || "Failed to reverse geocode");
//       }

//       const result = res.data.results[0];
//       const addressComponents = result.address_components || [];

//       // Extract city and postal code from address components
//       let city = "";
//       let postalCode = "";

//       addressComponents.forEach((component: any) => {
//         if (
//           component.types.includes("locality") ||
//           component.types.includes("administrative_area_level_2")
//         ) {
//           city = component.long_name;
//         }
//         if (component.types.includes("postal_code")) {
//           postalCode = component.long_name;
//         }
//       });

//       return {
//         address: result.formatted_address,
//         city,
//         postalCode,
//       };
//     } catch (error: any) {
//       console.error("Error in reverse geocoding:", error);
//       throw new Error(error.message || "Failed to reverse geocode");
//     }
//   },
// };

// src/services/googleMapsService.ts
import { getAxiosInstance } from "@/axios/axiosinstance";

// Define your Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyB8s9qKa8kx8AHQU3dXK3xbbKiMCxwNR9Q";

console.log(GOOGLE_MAPS_API_KEY);

export interface LocationData {
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export const googleMapsService = {
  /**
   * Fetch address suggestions based on input query
   */
  async fetchAddressSuggestions(query: string): Promise<LocationData[]> {
    try {
      const axios = getAxiosInstance();
      // Use Google Places Autocomplete API for address suggestions
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: query,
            key: GOOGLE_MAPS_API_KEY,
            types: "address",
          },
        }
      );

      if (!res.data.predictions || res.data.status !== "OK") {
        throw new Error(
          res.data.error_message || "Failed to fetch suggestions"
        );
      }

      // For each prediction, get place details to get coordinates
      const placesDetailsPromises = res.data.predictions.map(
        async (prediction: any) => {
          const detailsRes = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json`,
            {
              params: {
                place_id: prediction.place_id,
                fields: "geometry,address_component,formatted_address",
                key: GOOGLE_MAPS_API_KEY,
              },
            }
          );

          if (
            !detailsRes.data.result ||
            detailsRes.data.status !== "OK" ||
            !detailsRes.data.result.geometry
          ) {
            return null;
          }

          const result = detailsRes.data.result;
          const addressComponents = result.address_components || [];

          // Extract city and postal code from address components
          let city = "";
          let postalCode = "";

          addressComponents.forEach((component: any) => {
            if (
              component.types.includes("locality") ||
              component.types.includes("administrative_area_level_2")
            ) {
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
        }
      );

      const placesDetails = await Promise.all(placesDetailsPromises);
      return placesDetails.filter((place) => place !== null) as LocationData[];
    } catch (error: any) {
      console.error("Error fetching address suggestions:", error);
      throw new Error(error.message || "Failed to fetch address suggestions");
    }
  },

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{
    address: string;
    city: string;
    postalCode: string;
  }> {
    try {
      const axios = getAxiosInstance();
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${latitude},${longitude}`,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (!res.data.results || res.data.status !== "OK") {
        throw new Error(res.data.error_message || "Failed to reverse geocode");
      }

      const result = res.data.results[0];
      const addressComponents = result.address_components || [];

      // Extract city and postal code from address components
      let city = "";
      let postalCode = "";

      addressComponents.forEach((component: any) => {
        if (
          component.types.includes("locality") ||
          component.types.includes("administrative_area_level_2")
        ) {
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
      throw new Error(error.message || "Failed to reverse geocode");
    }
  },
};
