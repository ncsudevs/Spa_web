import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";

export default function DatePicker({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  minDate = "today",
  maxDate,
}) {
  return (
    <Flatpickr
      value={value ? new Date(`${value}T00:00:00`) : null}
      className="field"
      placeholder={placeholder}
      options={{
        altInput: true,
        altFormat: "d/m/Y",
        dateFormat: "Y-m-d",
        locale: Vietnamese,
        minDate,
        maxDate,
        disableMobile: true,
      }}
      onChange={(selectedDates, dateStr) => {
        if (onChange) onChange(dateStr);
      }}
    />
  );
}
