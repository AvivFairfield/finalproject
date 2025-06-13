import type { TooltipProps } from "recharts";
import {
	ValueType,
	NameType,
} from "recharts/types/component/DefaultTooltipContent";

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
	active,
	payload,
	label,
}) => {
	if (active && payload && payload.length) {
		return (
			<div
				// Force override with inline styles
				style={{
					backgroundColor: "#1f1f1f",
					color: "white",
					padding: "12px",
					borderRadius: "0.375rem",
					boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
					border: "1px solid #4b5563", // Tailwind's gray-700
				}}
			>
				<p style={{ fontWeight: "600", marginBottom: "8px" }}>
					{label}
				</p>
				{payload.map((entry, index) => (
					<p
						key={index}
						style={{ color: entry.color, fontWeight: "500" }}
					>
						{entry.name}: {entry.value}
					</p>
				))}
			</div>
		);
	}
	return null;
};

export default CustomTooltip;
