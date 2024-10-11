import { getUserAvailibility } from "@/actions/availibility";
import { defaultAvailability } from "./data";
import AvailabilityForm from "./_components/availability-form";

const AvailibilityPage = async () => {
  const availability = await getUserAvailibility();

  return <AvailabilityForm initialData={availability || defaultAvailability} />;
};

export default AvailibilityPage;
