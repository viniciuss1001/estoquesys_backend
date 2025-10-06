export class CreateAuditLogDto {
	companyId: string
	userId: string
	action: 'create' | 'update' | 'delete' | 'login' | 'logout'
	entity: string
	entityId: string
	description: string
}