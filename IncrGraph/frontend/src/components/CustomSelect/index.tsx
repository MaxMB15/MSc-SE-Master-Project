import React, { useState, useEffect, useRef } from "react";
import "./CustomSelect.css";

export interface SelectOption {
	value: string;
	label: string;
	style: React.CSSProperties;
}

interface CustomSelectProps {
	id: string;
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;
    className?: string;
	label?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
	id,
	options,
	value,
	onChange,
    className = "",
	label,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef<HTMLDivElement>(null);
	const optionsRef = useRef<HTMLUListElement>(null);

	const handleSelect = (optionValue: string) => {
		onChange(optionValue);
		setIsOpen(false);
	};

	const handleOutsideClick = (event: MouseEvent) => {
		if (
			selectRef.current &&
			!selectRef.current.contains(event.target as Node)
		) {
			setIsOpen(false);
		}
	};

	const adjustDropdownPosition = () => {
		if (optionsRef.current) {
			const rect = optionsRef.current.getBoundingClientRect();
			if (rect.bottom > window.innerHeight - 20) {
				optionsRef.current.style.top = `-${rect.height}px`;
			} else {
				optionsRef.current.style.top = "100%";
			}
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleOutsideClick);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, []);

	useEffect(() => {
		adjustDropdownPosition();
	}, [isOpen]);

	return (
		<div className={`custom-select-container ${className}`} ref={selectRef}>
			{label !== undefined && (
				<label htmlFor={id} className="custom-select-label">
					{label}
				</label>
			)}

			<div
				id={id}
				className="custom-select"
				onClick={() => setIsOpen(!isOpen)}
			>
				{options.find((option) => option.value === value)?.label ||
					"Select"}
			</div>
			{isOpen && (
				<ul className="custom-select-options" ref={optionsRef}>
					{options.map((option) => (
						<li
							key={option.value}
							className="custom-select-option"
							onClick={() => handleSelect(option.value)}
						>
							<span
								className={`custom-select-color`}
								style={option.style}
							/>
							{option.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default CustomSelect;
