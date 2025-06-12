import { useEffect } from "react";

export function useClickOutside(
	refs: React.RefObject<HTMLElement>[],
	handler: (event: MouseEvent | TouchEvent) => void
) {
	useEffect(() => {
		const listener = (event: MouseEvent | TouchEvent) => {
			const isInsideAny = refs.some(
				(ref) =>
					ref.current && ref.current.contains(event.target as Node)
			);
			if (!isInsideAny) {
				handler(event);
			}
		};

		document.addEventListener("mousedown", listener);
		document.addEventListener("touchstart", listener);
		return () => {
			document.removeEventListener("mousedown", listener);
			document.removeEventListener("touchstart", listener);
		};
	}, [refs, handler]);
}
