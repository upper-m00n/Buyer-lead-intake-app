"use client";
import StatusDropdown from './StatusDropdown';

export default function StatusDropdownClient(props: { buyerId: string; status: string; disabled?: boolean }) {
  return <StatusDropdown {...props} />;
}
