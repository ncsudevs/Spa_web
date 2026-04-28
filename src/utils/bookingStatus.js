export function getBookingWorkflowStatus(booking) {
  return booking?.workflowStatus || booking?.status || "UNKNOWN";
}

export function getBookingWorkflowLabel(booking) {
  return booking?.workflowStatusLabel || getBookingWorkflowStatus(booking);
}

export function getBookingStatusBadgeLabels(booking) {
  return {
    CHECKED_IN: "CHECKED IN",
    CONFIRMED: "SCHEDULED",
    COMPLETED: "SERVICE DONE",
    PENDING: "PENDING",
    CANCELLED: "CANCELLED",
    [getBookingWorkflowStatus(booking)]: getBookingWorkflowLabel(booking).toUpperCase(),
  };
}

export function getBookingStatusOptions() {
  return [
    { value: "PENDING", label: "Pending - waiting processing" },
    { value: "CONFIRMED", label: "Confirmed - paid and scheduled" },
    { value: "COMPLETED", label: "Completed - service finished" },
    { value: "CANCELLED", label: "Cancelled" },
  ];
}
