import { useEffect, useMemo, useState } from "react";
import {
  createBookingDetailStaffAssignment,
  deleteBooking,
  deleteBookingDetailStaffAssignment,
  getBookings,
  updateBookingCheckIn,
  updateBookingDetailStaffAssignment,
  updateBookingStatus,
} from "../../bookings/api/bookingApi";
import BookingCard from "../../bookings/components/BookingCard";
import { getBookingStatusOptions } from "../../bookings/utils/bookingWorkflow";
import { getStaff } from "../../staff/api/staffApi";
import AppButton from "../../../shared/components/AppButton";
import { useAuth } from "../../../context/AuthContext";

const STATUS_OPTIONS = getBookingStatusOptions();

function isStatusDisabled(booking, status) {
  if (status === booking.status) return false;
  if (booking.status === "CANCELLED") return true;

  switch (status) {
    case "PENDING":
      return (
        booking.paymentStatus === "PAID" ||
        booking.isCheckedIn ||
        booking.status === "COMPLETED"
      );
    case "CONFIRMED":
      return (
        booking.paymentStatus !== "PAID" ||
        booking.status === "COMPLETED"
      );
    case "COMPLETED":
      return (
        booking.paymentStatus !== "PAID" ||
        !booking.isCheckedIn ||
        !booking.isFullyStaffed ||
        !["CONFIRMED", "COMPLETED"].includes(booking.status)
      );
    case "CANCELLED":
      return booking.isCheckedIn || booking.status === "COMPLETED";
    default:
      return false;
  }
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

export default function AdminBookingPage() {
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
          items.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              busyKey={busyKey}
              canDelete={canDelete}
              statusOptions={STATUS_OPTIONS}
              isStatusDisabled={isStatusDisabled}
              getStaffOptions={getStaffOptions}
              getNewDraft={getNewDraft}
              getEditDraft={getEditDraft}
              setNewDraft={setNewDraft}
              setEditDraft={setEditDraft}
              onAddAssignment={handleAddAssignment}
              onUpdateAssignment={handleUpdateAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onStatusChange={handleStatusChange}
              onCheckInChange={handleCheckInChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
