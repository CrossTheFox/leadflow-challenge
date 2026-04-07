import { LEAD_STATUSES } from "@/constants";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
	const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
	return new Date(dateString).toLocaleDateString(undefined, options);
}

export function formatStatus(status: string) {
	switch (status) {
		case LEAD_STATUSES.WON:
			return "Won";
		case LEAD_STATUSES.LOST:
			return "Lost";
		case LEAD_STATUSES.NEW:
			return "New";
		case LEAD_STATUSES.IN_PROGRESS:
			return "In Progress";
		case LEAD_STATUSES.CONTACTED:
			return "Contacted";
		case LEAD_STATUSES.QUALIFIED:
			return "Qualified";
		default:
			return status;
	}
}

export function getStatusVariant(status: string) {
	switch (status) {
		case LEAD_STATUSES.WON:
			return "bg-emerald-100 text-emerald-700";
		case LEAD_STATUSES.LOST:
			return "bg-red-100 text-red-700";
		case LEAD_STATUSES.NEW:
			return "bg-blue-100 text-blue-700";
		case LEAD_STATUSES.IN_PROGRESS:
			return "bg-orange-100 text-orange-700";
		case LEAD_STATUSES.CONTACTED:
			return "bg-yellow-100 text-yellow-700";
		case LEAD_STATUSES.QUALIFIED:
			return "bg-green-100 text-green-700";
		default:
			return "bg-slate-100 text-slate-700";
	}
}