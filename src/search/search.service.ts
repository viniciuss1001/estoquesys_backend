import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SearchService {
	constructor(
		private prisma: PrismaService
	) { }

	async search(companyId: string, query: string) {
		if (!companyId) throw new BadRequestException('Companhia não associada ao usuário.')

		if (!query || query.length < 2) {
			return []
		}

		const results = await Promise.all([
			this.prisma.product.findMany({
				where: {
					name: { contains: query },
					companyId,
				},
				select: {
					id: true,
					name: true,
					category: { select: { name: true } },
				},
			}),

			this.prisma.supplier.findMany({
				where: { name: { contains: query }, companyId },
				select: { id: true, name: true },
			}),

			this.prisma.wareHouse.findMany({
				where: { name: { contains: query }, companyId },
				select: { id: true, name: true },
			}),

			this.prisma.category.findMany({
				where: { name: { contains: query }, companyId },
				select: { id: true, name: true },
			}),

			this.prisma.user.findMany({
				where: { name: { contains: query }, companyId },
				select: { id: true, name: true, email: true },
			}),

			this.prisma.supplierInvoice.findMany({
				where: { title: { contains: query }, companyId },
				select: { id: true, title: true, description: true },
			}),
		])
		const [products, suppliers, warehouses, categories, users, invoices] = results;

		const mapped = [
			...products.map((product) => ({
				id: product.id,
				type: 'product',
				label: product.name,
				sublabel: product.category?.name || 'Produto',
				href: `/products/${product.id}`,
			})),
			...suppliers.map((supplier) => ({
				id: supplier.id,
				type: 'supplier',
				label: supplier.name,
				sublabel: 'Fornecedor',
				href: `/suppliers/${supplier.id}`,
			})),
			...warehouses.map((warehouse) => ({
				id: warehouse.id,
				type: 'warehouse',
				label: warehouse.name,
				sublabel: 'Armazém',
				href: `/warehouses/${warehouse.id}`,
			})),
			...categories.map((category) => ({
				id: category.id,
				type: 'category',
				label: category.name,
				sublabel: 'Categoria',
				href: `/categories/${category.id}`,
			})),
			...users.map((user) => ({
				id: user.id,
				type: 'user',
				label: user.name,
				sublabel: user.email,
				href: `/users/${user.id}`,
			})),
			...invoices.map((invoice) => ({
				id: invoice.id,
				type: 'invoice',
				label: invoice.description,
				sublabel: 'Boleto de fornecedor',
				href: `/supplier-invoice/${invoice.id}`,
			})),
		]

		return mapped
	}
}