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
			<div className="bg-[#1f1f1f] text-white p-3 rounded-md shadow-lg text-sm border border-gray-700">
				<p className="font-semibold mb-2">{label}</p>
				{payload.map((entry, index) => (
					<p
						key={index}
						style={{ color: entry.color }}
						className="font-medium"
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
