import AppButton from "../../../shared/components/AppButton";

export default function StaffAssignmentPanel({
  item,
  matchingStaff,
  canEditAssignments,
  busyKey,
  getEditDraft,
  setEditDraft,
  onUpdateAssignment,
  onDeleteAssignment,
  createDraftState,
  setNewDraft,
  onAddAssignment,
}) {
  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          Staff assignments
        </label>
        <span className="text-xs text-stone-500">
          Category matches: {matchingStaff.length}
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {item.staffAssignments?.length ? (
          item.staffAssignments.map((assignment) => {
            const draft = getEditDraft(assignment);
            const hasChanges =
              Number(draft.staffId) !== assignment.staffId ||
              Number(draft.assignedQuantity) !== assignment.assignedQuantity;
            const saveDisabled =
              !hasChanges ||
              !canEditAssignments ||
              busyKey === `save-assignment-${assignment.id}`;

            return (
              <div
                key={assignment.id}
                className="rounded-2xl border border-stone-200 bg-white p-3"
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_auto_auto]">
                  <select
                    value={draft.staffId || assignment.staffId}
                    onChange={(e) =>
                      setEditDraft(
                        assignment.id,
                        { staffId: e.target.value },
                        assignment,
                      )
                    }
                    disabled={!canEditAssignments}
                    className="rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    <option value="">Select staff</option>
                    {matchingStaff.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.fullName} - available {person.maxConcurrent}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={
                      draft.assignedQuantity ?? assignment.assignedQuantity
                    }
                    onChange={(e) =>
                      setEditDraft(
                        assignment.id,
                        { assignedQuantity: e.target.value },
                        assignment,
                      )
                    }
                    disabled={!canEditAssignments}
                    className="rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm disabled:bg-stone-100 disabled:text-stone-400"
                  />

                  <AppButton
                    variant="secondary"
                    onClick={() =>
                      onUpdateAssignment(item.detailId, assignment)
                    }
                    disabled={saveDisabled}
                  >
                    Save
                  </AppButton>

                  <AppButton
                    variant="danger"
                    onClick={() =>
                      onDeleteAssignment(item.detailId, assignment.id)
                    }
                    disabled={
                      !canEditAssignments ||
                      busyKey === `delete-assignment-${assignment.id}`
                    }
                  >
                    Remove
                  </AppButton>
                </div>

                <p className="mt-2 text-xs text-stone-500">
                  {assignment.staffName} is covering{" "}
                  {assignment.assignedQuantity} slot(s). Max concurrent:{" "}
                  {assignment.staffMaxConcurrent}.
                </p>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-3 text-sm text-stone-500">
            No staff assigned yet.
          </div>
        )}

        <div className="rounded-2xl border border-stone-200 bg-white p-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_auto]">
            <select
              value={createDraftState.staffId}
              onChange={(e) =>
                setNewDraft(item.detailId, {
                  staffId: e.target.value,
                })
              }
              disabled={!canEditAssignments}
              className="rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm disabled:bg-stone-100 disabled:text-stone-400"
            >
              <option value="">Select staff</option>
              {matchingStaff.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.fullName} - cap {person.maxConcurrent}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={createDraftState.assignedQuantity}
              onChange={(e) =>
                setNewDraft(item.detailId, {
                  assignedQuantity: e.target.value,
                })
              }
              disabled={!canEditAssignments}
              className="rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm disabled:bg-stone-100 disabled:text-stone-400"
            />

            <AppButton
              variant="secondary"
              onClick={() => onAddAssignment(item)}
              disabled={
                !canEditAssignments ||
                item.unassignedQuantity <= 0 ||
                busyKey === `create-assignment-${item.detailId}`
              }
            >
              Add assignment
            </AppButton>
          </div>

          <p className="mt-2 text-xs text-stone-500">
            {canEditAssignments
              ? item.unassignedQuantity > 0
                ? "Add staff quantity until the unassigned amount reaches zero."
                : "This service line is fully staffed."
              : item.paymentStatus !== "PAID"
                ? "Payment must be confirmed before staffing can be edited."
                : "Completed or cancelled bookings cannot be changed."}
          </p>
        </div>
      </div>
    </div>
  );
}
