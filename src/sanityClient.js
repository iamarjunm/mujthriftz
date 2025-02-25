import sanityClient from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = sanityClient({
  projectId: "d1luwhf2",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "sk5lmkmudjr9cPzJaKL6FrJKre4ykhEwYhX9oVfQnO5nbCUXDRAmwZskz2YPyRNgqmaK5KU97XK1PFQtgC9uT3vrm2dOkdNhH925sfWCJY6YK4rJo66Y3vJTVHdYlqakhuReoTFfWajy4BXmWMIpyTLORoz9PeZKvKaq8BFOj0uvzjRURElT", // Ensure the token is inside double quotes
  useCdn: false,
});

const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);
