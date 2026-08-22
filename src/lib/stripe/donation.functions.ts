import { createServerFn } from "@tanstack/react-start";
import { createDonationCheckout, donationInput } from "./donation.server";

export const createDonationSession = createServerFn({ method: "POST" })
  .inputValidator((input) => donationInput.parse(input))
  .handler(async ({ data }) => createDonationCheckout(data));
