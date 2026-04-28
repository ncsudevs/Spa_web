import {
  BOOKING_STATUS_OPTIONS,
  BOOKING_WORKFLOW_BADGE_LABELS,
} from "../constants/bookingStatus";

export function getBookingWorkflowStatus(booking) {
  return booking?.workflowStatus || booking?.status || "UNKNOWN";
}

export function getBookingWorkflowLabel(booking) {
  return booking?.workflowStatusLabel || getBookingWorkflowStatus(booking);
}

export function getBookingStatusBadgeLabels(booking) {
  return {
    ...BOOKING_WORKFLOW_BADGE_LABELS,
    [getBookingWorkflowStatus(booking)]: getBookingWorkflowLabel(booking).toUpperCase(),
  };
}

export function getBookingStatusOptions() {
  return BOOKING_STATUS_OPTIONS;
}
