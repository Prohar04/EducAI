"use client";
import React, { PropsWithChildren } from "react";
import { Button } from "./button";
import { useFormStatus } from "react-dom";

const SubmitButton = ({
	children,
	disabled,
	className,
}: PropsWithChildren<{ disabled?: boolean; className?: string }>) => {
	const { pending } = useFormStatus();
	const isDisabled = pending || disabled;

	return (
		<Button
			type='submit'
			aria-disabled={isDisabled}
			disabled={isDisabled}
			className={className ?? "w-full mt-2"}
		>
			{pending ? "Submitting..." : children}
		</Button>
	);
};

export default SubmitButton;
