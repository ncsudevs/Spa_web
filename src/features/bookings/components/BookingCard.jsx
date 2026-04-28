import StatusBadge from "../../../shared/components/StatusBadge";
import { formatDateTime } from "../../../shared/utils/formatters";
import {
  getBookingStatusBadgeLabels,
  getBookingWorkflowLabel,
  getBookingWorkflowStatus,
} from "../utils/bookingWorkflow";
import BookingServiceLine from "./BookingServiceLine";
import BookingStatusPanel from "./BookingStatusPanel";

export default function BookingCard({
  booking,
  busyKey,
  canDelete,
  statusOptions,
  isStatusDisabled,
  getStaffOptions,
  getNewDraft,
  getEditDraft,
  setNewDraft,
  setEditDraft,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onStatusChange,
  onCheckInChange,
  onDelete,
}) {
  const workflowStatus = getBookingWorkflowStatus(booking);
  const workflowLabel = getBookingWorkflowLabel(booking);
  const canEditAssignments =
    booking.paymentStatus === "PAID" &&
    !["COMPLETED", "CANCELLED"].includes(booking.status);
  const canToggleCheckIn =
    booking.paymentStatus === "PAID" &&
    booking.status === "CONFIRMED";
  const readyForCompletion =
    booking.paymentStatus === "PAID" &&
    booking.isCheckedIn &&
    booking.isFullyStaffed &&
    booking.status === "CONFIRMED";
  const workflowHint = booking.isCheckedIn
    ? "This guest is checked in now. Keep the booking in Confirmed until the service is finished, then switch to Completed."
    : "Use Confirmed for paid and scheduled bookings. Move to Completed only after check-in and service finish.";

  return (
    <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-stone-900">
              {booking.bookingCode}
            </h2>
            <StatusBadge
              value={workflowStatus}
              labels={getBookingStatusBadgeLabels(booking)}
            />
            <StatusBadge value={booking.paymentStatus} />
          </div>

          <p className="mt-3 text-sm text-stone-600">
            {booking.fullName} - {booking.phone} - {booking.email}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Created at {formatDateTime(booking.createdAt)}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Workflow stage:{" "}
            <span className="font-medium text-stone-700">{workflowLabel}</span>
          </p>

          {booking.isGroupBooking ? (
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-violet-600">
              Group booking - {booking.groupSize} people
            </p>
          ) : null}

          {booking.staffingWarning ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {booking.staffingWarning}
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            {(booking.items || []).map((item) => (
              <BookingServiceLine
                key={item.detailId}
                item={item}
                canEditAssignments={canEditAssignments}
                busyKey={busyKey}
                matchingStaff={getStaffOptions(item.categoryId)}
                getEditDraft={getEditDraft}
                setEditDraft={setEditDraft}
                createDraftState={getNewDraft(item)}
                setNewDraft={setNewDraft}
                onAddAssignment={(detail) => onAddAssignment(booking.id, detail)}
                onUpdateAssignment={onUpdateAssignment}
                onDeleteAssignment={onDeleteAssignment}
              />
            ))}
          </div>
        </div>

        <BookingStatusPanel
          booking={booking}
          workflowLabel={workflowLabel}
          workflowHint={workflowHint}
          readyForCompletion={readyForCompletion}
          canToggleCheckIn={canToggleCheckIn}
          canDelete={canDelete}
          busyKey={busyKey}
          statusOptions={statusOptions}
          isStatusDisabled={isStatusDisabled}
          onStatusChange={onStatusChange}
          onCheckInChange={onCheckInChange}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
