import { Office } from "generated/prisma"

export interface NotifyByUserRoleParams {
	title: string
	message: string
	roles: Office[]
	companyId?: string
}