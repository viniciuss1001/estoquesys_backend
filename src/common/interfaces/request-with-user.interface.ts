import { Request } from "express";

export interface RequestWithUSer extends Request {
	user: {
		id: string;
		email: string;
		companyId?: string;
		office?: string;
	};
}