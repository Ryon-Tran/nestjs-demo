import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // Thêm sản phẩm
  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });
    return {
      message: 'Tạo sản phẩm thành công',
      data: product,
    };
  }

  // Lấy danh sách sản phẩm
  async findAll() {
    const products = await this.prisma.product.findMany();
    return {
      message: 'Danh sách sản phẩm',
      data: products,
    };
  }

  // Lấy chi tiết sản phẩm
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có id: ${id}`);
    }

    return {
      message: 'Chi tiết sản phẩm',
      data: product,
    };
  }

  // Cập nhật sản phẩm
  async update(id: number, updateProductDto: UpdateProductDto) {
    const existProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existProduct) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có id: ${id}`);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return {
      message: 'Cập nhật sản phẩm thành công',
      data: product,
    };
  }

  // Xóa sản phẩm
  async remove(id: number) {
    const existProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existProduct) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có id: ${id}`);
    }

    const product = await this.prisma.product.delete({
      where: { id },
    });

    return {
      message: 'Xóa sản phẩm thành công',
      data: product,
    };
  }
}
