// stores/dateStore.ts
import { create } from "zustand";

export type DateRangeOption = "today" | "lastWeek" | "lastMonth" | "custom";

interface DateStore {
	viewMode: DateRangeOption;
	customStartDate?: Date;
	customEndDate?: Date;
	setViewMode: (mode: DateRangeOption) => void;
	setCustomStartDate: (date: Date | undefined) => void;
	setCustomEndDate: (date: Date | undefined) => void;
}

export const useDateStore = create<DateStore>((set, get) => ({
	viewMode: "lastWeek",
	customStartDate: undefined,
	customEndDate: undefined,
	setViewMode: (mode) => set({ viewMode: mode }),
	setCustomStartDate: (date) => set({ customStartDate: date }),
	setCustomEndDate: (date) => set({ customEndDate: date }),

	// 🧠 Optional: expose a getter if you ever need raw value
	getAdjustedEndDate: () => {
		const raw = get().customEndDate;
		if (!raw) return undefined;
		return new Date(new Date(raw).setHours(23, 59, 59, 999));
	},
}));
