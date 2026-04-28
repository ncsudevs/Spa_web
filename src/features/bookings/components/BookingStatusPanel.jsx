import AppButton from "../../../shared/components/AppButton";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";

export default function BookingStatusPanel({
  booking,
  workflowLabel,
  workflowHint,
  readyForCompletion,
  canToggleCheckIn,
  canDelete,
  busyKey,
  statusOptions,
  isStatusDisabled,
  onStatusChange,
  onCheckInChange,
  onDelete,
}) {
  return (
    <aside className="w-full max-w-sm rounded-[24px] border border-stone-200 p-4 lg:w-[360px]">
      <p className="text-sm text-stone-500">Total</p>
      <p className="text-2xl font-semibold text-rose-600">
        {formatCurrency(booking.totalAmount)}
      </p>

      <div className="mt-5 space-y-3">
        <label className="block text-sm font-semibold text-stone-900">
          Booking status action
        </label>
        <select
          value={booking.status}
          onChange={(e) => onStatusChange(booking.id, e.target.value)}
          disabled={busyKey === `status-${booking.id}`}
          className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
        >
          {statusOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={isStatusDisabled(booking, option.value)}
            >
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-stone-500">{workflowHint}</p>

        <AppButton
          variant={booking.isCheckedIn ? "ghost" : "secondary"}
          className="w-full"
          onClick={() => onCheckInChange(booking, !booking.isCheckedIn)}
          disabled={!canToggleCheckIn || busyKey === `checkin-${booking.id}`}
        >
          {booking.isCheckedIn ? "Undo check-in" : "Mark checked in"}
        </AppButton>

        <div className="rounded-2xl bg-stone-50 p-4 text-xs text-stone-600">
          <p>Payment: {booking.paymentStatus}</p>
          <p className="mt-1">Workflow stage: {workflowLabel}</p>
          <p className="mt-1">Stored status: {booking.status}</p>
          <p className="mt-1">
            Check-in:{" "}
            {booking.isCheckedIn
              ? booking.checkedInAt
                ? `Yes at ${formatDateTime(booking.checkedInAt)}`
                : "Yes"
              : "No"}
          </p>
          <p className="mt-1">
            Staffing: {booking.isFullyStaffed ? "Complete" : "Incomplete"}
          </p>
          <p className="mt-1">
            Ready for completion: {readyForCompletion ? "Yes" : "No"}
          </p>
        </div>

        {canDelete ? (
          <AppButton
            variant="danger"
            className="w-full"
            onClick={() => onDelete(booking.id, booking.bookingCode)}
            disabled={busyKey === `delete-${booking.id}`}
          >
            Delete booking
          </AppButton>
        ) : null}
      </div>
    </aside>
  );
}
