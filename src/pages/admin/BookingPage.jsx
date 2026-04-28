import { useEffect, useMemo, useState } from "react";
import {
  createBookingDetailStaffAssignment,
  deleteBooking,
  deleteBookingDetailStaffAssignment,
  getBookings,
  updateBookingCheckIn,
  updateBookingDetailStaffAssignment,
  updateBookingStatus,
} from "../../api/bookingApi";
import { getStaff } from "../../api/staffApi";
import AppButton from "../../components/app/AppButton";
import StatusBadge from "../../components/shared/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../../utils/formatters";

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

function isStatusDisabled(booking, status) {
  if (status === booking.status) return false;
  if (status === "CONFIRMED" && booking.paymentStatus !== "PAID") return true;
  if (status === "COMPLETED") {
    return (
      booking.paymentStatus !== "PAID" ||
      !booking.isCheckedIn ||
      !booking.isFullyStaffed ||
      !["CONFIRMED", "COMPLETED"].includes(booking.status)
    );
  }
  if (status === "PENDING" && booking.paymentStatus === "PAID") return true;
  if (status === "CANCELLED" && booking.status === "COMPLETED") return true;
  return false;
}

function createDraft(quantity = 1) {
  return {
    staffId: "",
    assignedQuantity: Math.max(1, Number(quantity) || 1),
  };
}

function normalizeDraft(draft) {
  return {
    staffId: Number(draft.staffId) || 0,
    assignedQuantity: Math.max(1, Number(draft.assignedQuantity) || 1),
  };
}

function assignmentHasChanges(assignment, draft) {
  return (
    Number(draft.staffId) !== assignment.staffId ||
    Number(draft.assignedQuantity) !== assignment.assignedQuantity
  );
}

export default function BookingPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [newAssignmentDrafts, setNewAssignmentDrafts] = useState({});
  const [editAssignmentDrafts, setEditAssignmentDrafts] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const activeStaff = useMemo(
    () => staff.filter((item) => item.isActive),
    [staff],
  );

  const canDelete = user?.role === "ADMIN";

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [bookingData, staffData] = await Promise.all([getBookings(), getStaff()]);
      setItems(bookingData || []);
      setStaff(staffData || []);
    } catch (err) {
      setError(err.message || "Cannot load bookings.");
    } finally {
      setLoading(false);
    }
  }

  function replaceBooking(updated) {
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  function getStaffOptions(categoryId) {
    return activeStaff.filter((person) => person.categoryIds?.includes(categoryId));
  }

  function getNewDraft(detail) {
    return (
      newAssignmentDrafts[detail.detailId] ||
      createDraft(detail.unassignedQuantity || 1)
    );
  }

  function getEditDraft(assignment) {
    return (
      editAssignmentDrafts[assignment.id] || {
        staffId: assignment.staffId,
        assignedQuantity: assignment.assignedQuantity,
      }
    );
  }

  function setNewDraft(detailId, patch) {
    setNewAssignmentDrafts((current) => ({
      ...current,
      [detailId]: {
        ...getNewDraft({ detailId }),
        ...patch,
      },
    }));
  }

  function setEditDraft(assignmentId, patch, assignment) {
    const seed = assignment
      ? {
          staffId: assignment.staffId,
          assignedQuantity: assignment.assignedQuantity,
        }
      : createDraft(1);

    setEditAssignmentDrafts((current) => ({
      ...current,
      [assignmentId]: {
        ...(current[assignmentId] || seed),
        ...patch,
      },
    }));
  }

  async function handleStatusChange(id, status) {
    try {
      setBusyKey(`status-${id}`);
      setError("");
      const updated = await updateBookingStatus(id, status);
      replaceBooking(updated);
    } catch (err) {
      setError(err.message || "Cannot update booking status.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleCheckInChange(booking, isCheckedIn) {
    try {
      setBusyKey(`checkin-${booking.id}`);
      setError("");
      const updated = await updateBookingCheckIn(booking.id, isCheckedIn);
      replaceBooking(updated);
    } catch (err) {
      setError(err.message || "Cannot update check-in.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleAddAssignment(bookingId, detail) {
    const draft = normalizeDraft(getNewDraft(detail));
    if (!draft.staffId) {
      setError("Choose a staff member before adding an assignment.");
      return;
    }

    try {
      setBusyKey(`create-assignment-${detail.detailId}`);
      setError("");
      const updated = await createBookingDetailStaffAssignment(detail.detailId, draft);
      replaceBooking(updated);
      setNewAssignmentDrafts((current) => ({
        ...current,
        [detail.detailId]: createDraft(
          Math.max(1, detail.unassignedQuantity - draft.assignedQuantity),
        ),
      }));
    } catch (err) {
      setError(err.message || "Cannot add staff assignment.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleUpdateAssignment(detailId, assignment) {
    const draft = normalizeDraft(getEditDraft(assignment));
    if (!draft.staffId) {
      setError("Choose a staff member before saving the assignment.");
      return;
    }

    try {
      setBusyKey(`save-assignment-${assignment.id}`);
      setError("");
      const updated = await updateBookingDetailStaffAssignment(
        detailId,
        assignment.id,
        draft,
      );
      replaceBooking(updated);
      setEditAssignmentDrafts((current) => {
        const next = { ...current };
        delete next[assignment.id];
        return next;
      });
    } catch (err) {
      setError(err.message || "Cannot update staff assignment.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleDeleteAssignment(detailId, assignmentId) {
    if (!window.confirm("Remove this staff assignment?")) return;

    try {
      setBusyKey(`delete-assignment-${assignmentId}`);
      setError("");
      const updated = await deleteBookingDetailStaffAssignment(detailId, assignmentId);
      replaceBooking(updated);
      setEditAssignmentDrafts((current) => {
        const next = { ...current };
        delete next[assignmentId];
        return next;
      });
    } catch (err) {
      setError(err.message || "Cannot delete staff assignment.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleDelete(id, code) {
    if (!window.confirm(`Delete booking ${code}?`)) return;

    try {
      setBusyKey(`delete-${id}`);
      setError("");
      await deleteBooking(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Cannot delete booking.");
    } finally {
      setBusyKey("");
    }
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-stone-900">Bookings</h1>
          <p className="mt-2 max-w-3xl text-sm text-stone-500">
            Split staffing by quantity, keep check-in separate from payment,
            and only complete a booking after it is paid, checked in, and fully
            staffed.
          </p>
        </div>
        <AppButton variant="ghost" onClick={loadData} disabled={loading}>
          Refresh
        </AppButton>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-5">
        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-sm text-stone-500 shadow-sm">
            Loading bookings...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-sm text-stone-500 shadow-sm">
            No bookings yet.
          </div>
        ) : (
          items.map((booking) => {
            const canEditAssignments =
              booking.paymentStatus === "PAID" && booking.status !== "COMPLETED";
            const canToggleCheckIn =
              booking.paymentStatus === "PAID" &&
              (booking.status === "CONFIRMED" || booking.status === "COMPLETED");
            const readyForCompletion =
              booking.paymentStatus === "PAID" &&
              booking.isCheckedIn &&
              booking.isFullyStaffed &&
              booking.status === "CONFIRMED";

            return (
              <article
                key={booking.id}
                className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-stone-900">
                        {booking.bookingCode}
                      </h2>
                      <StatusBadge value={booking.status} />
                      <StatusBadge value={booking.paymentStatus} />
                    </div>

                    <p className="mt-3 text-sm text-stone-600">
                      {booking.fullName} - {booking.phone} - {booking.email}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                      Created at {formatDateTime(booking.createdAt)}
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
                      {(booking.items || []).map((item) => {
                        const matchingStaff = getStaffOptions(item.categoryId);
                        const createDraftState = getNewDraft(item);

                        return (
                          <div
                            key={item.detailId}
                            className="rounded-3xl border border-stone-200 bg-stone-50 p-4"
                          >
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                              <div className="xl:max-w-md">
                                <p className="font-semibold text-stone-900">
                                  {item.serviceName}
                                </p>
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
                                  <p className="mt-3 text-sm text-amber-700">
                                    {item.staffingWarning}
                                  </p>
                                ) : null}
                              </div>

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
                                      const saveDisabled =
                                        !assignmentHasChanges(assignment, draft) ||
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
                                                  {person.fullName} - cap {person.maxConcurrent}
                                                </option>
                                              ))}
                                            </select>

                                            <input
                                              type="number"
                                              min="1"
                                              value={draft.assignedQuantity ?? assignment.assignedQuantity}
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
                                                handleUpdateAssignment(
                                                  item.detailId,
                                                  assignment,
                                                )
                                              }
                                              disabled={saveDisabled}
                                            >
                                              Save
                                            </AppButton>

                                            <AppButton
                                              variant="danger"
                                              onClick={() =>
                                                handleDeleteAssignment(
                                                  item.detailId,
                                                  assignment.id,
                                                )
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
                                            {assignment.staffName} is covering {assignment.assignedQuantity} slot(s). Max concurrent: {assignment.staffMaxConcurrent}.
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
                                        onClick={() => handleAddAssignment(booking.id, item)}
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
                                        : booking.paymentStatus !== "PAID"
                                          ? "Payment must be confirmed before staffing can be edited."
                                          : "Completed bookings cannot be changed."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <aside className="w-full max-w-sm rounded-[24px] border border-stone-200 p-4 lg:w-[360px]">
                    <p className="text-sm text-stone-500">Total</p>
                    <p className="text-2xl font-semibold text-rose-600">
                      {formatCurrency(booking.totalAmount)}
                    </p>

                    <div className="mt-5 space-y-3">
                      <label className="block text-sm font-semibold text-stone-900">
                        Booking status
                      </label>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        disabled={busyKey === `status-${booking.id}`}
                        className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option
                            key={status}
                            value={status}
                            disabled={isStatusDisabled(booking, status)}
                          >
                            {status}
                          </option>
                        ))}
                      </select>

                      <AppButton
                        variant={booking.isCheckedIn ? "ghost" : "secondary"}
                        className="w-full"
                        onClick={() =>
                          handleCheckInChange(booking, !booking.isCheckedIn)
                        }
                        disabled={
                          !canToggleCheckIn || busyKey === `checkin-${booking.id}`
                        }
                      >
                        {booking.isCheckedIn ? "Undo check-in" : "Mark checked in"}
                      </AppButton>

                      <div className="rounded-2xl bg-stone-50 p-4 text-xs text-stone-600">
                        <p>Payment: {booking.paymentStatus}</p>
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
                          onClick={() => handleDelete(booking.id, booking.bookingCode)}
                          disabled={busyKey === `delete-${booking.id}`}
                        >
                          Delete booking
                        </AppButton>
                      ) : null}
                    </div>
                  </aside>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
