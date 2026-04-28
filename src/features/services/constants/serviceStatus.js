// Options shown in admin forms when controlling whether a service appears on customer pages.
export const SERVICE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Show to customers' },
  { value: 'INACTIVE', label: 'Hide from customers' },
];

// Display labels keep badge text short while preserving clear meaning in tables and forms.
export const SERVICE_STATUS_LABELS = {
  ACTIVE: 'Showing',
  INACTIVE: 'Hidden',
};
