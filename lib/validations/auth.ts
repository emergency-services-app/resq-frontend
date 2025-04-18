import { z } from "zod";

export const registrationSchema = z
	.object({
		name: z.string().min(1, { message: "Name is required" }),
		email: z.string().email({ message: "Invalid email address" }),
		phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
		age: z.string().refine((value) => !isNaN(Number(value)), {
			message: "Age must be a valid number",
		}),
		primaryAddress: z.string().min(1, { message: "Primary address is required" }),
		password: z.string().min(6, { message: "Password must be at least 6 characters" }),
		confirmPassword: z.string().min(6, { message: "Confirm Password must be at least 6 characters" }),
		isChecked: z.boolean().refine((value) => value === true, {
			message: "You must agree to the terms and conditions",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export const loginSchema = z.object({
	phoneNumber: z
		.string()
		.min(1, { message: "Phone number is required" })
		.regex(/^[0-9]{10}$/, { message: "Invalid phone number" }),
	password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
