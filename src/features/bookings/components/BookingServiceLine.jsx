import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import StaffAssignmentPanel from "./StaffAssignmentPanel";

export default function BookingServiceLine({
  item,
  canEditAssignments,
  busyKey,
  matchingStaff,
  getEditDraft,
  setEditDraft,
  createDraftState,
  setNewDraft,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
}) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="xl:max-w-md">
          <p className="font-semibold text-stone-900">{item.serviceName}</p>
          <p className="mt-1 text-sm text-stone-500">
            {item.categoryName || "Service"} - {formatDate(item.appointmentDate)} - {item.appointmentTime}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {item.quantity} x {formatCurrency(item.unitPrice)} = {formatCurrency(item.lineTotal)}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
                Assigned
              </p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">
                {item.assignedQuantity}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
                Unassigned
              </p>
              <p className="mt-1 text-lg font-semibold text-amber-700">
                {item.unassignedQuantity}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
                Staffing
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-900">
                {item.isFullyStaffed ? "Complete" : "Partial"}
              </p>
            </div>
          </div>

          {item.staffingWarning ? (
            <p className="mt-3 text-sm text-amber-700">{item.staffingWarning}</p>
          ) : null}
        </div>

        <StaffAssignmentPanel
          item={item}
          matchingStaff={matchingStaff}
          canEditAssignments={canEditAssignments}
          busyKey={busyKey}
          getEditDraft={getEditDraft}
          setEditDraft={setEditDraft}
          onUpdateAssignment={onUpdateAssignment}
          onDeleteAssignment={onDeleteAssignment}
          createDraftState={createDraftState}
          setNewDraft={setNewDraft}
          onAddAssignment={onAddAssignment}
        />
      </div>
    </div>
  );
}
