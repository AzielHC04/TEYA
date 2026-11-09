import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Patch, 
  Param, 
  Body, 
  UseInterceptors, 
  UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductosService } from './productos.service';
import { CloudinaryService } from './cloudinary.service';

@Controller('productos')
export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    let urlImagen = body.imagen || 'assets/Producto.jpg';

    if (file) {
      const resCloudinary = await this.cloudinaryService.uploadImage(file);
      urlImagen = (resCloudinary as any).secure_url;
    }

    const productoData = {
      nombre: body.nombre,
      categoria: body.categoria,
      descripcion: body.descripcion || '',
      precio: parseFloat(body.precio),
      precioAnterior: body.precioAnterior ? parseFloat(body.precioAnterior) : null,
      descuento: body.descuento || null,
      envioGratis: body.envioGratis === 'true' || body.envioGratis === true,
      imagen: urlImagen,
      stock: parseInt(body.stock, 10),
      masComprado: body.masComprado === 'true' || body.masComprado === true,
      ultimoAgregado: body.ultimoAgregado === 'true' || body.ultimoAgregado === true,
    };

    return this.productosService.create(productoData);
  }

  // PUT /productos/:id -> Actualizar producto
  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    let updateData: any = {
      nombre: body.nombre,
      categoria: body.categoria,
      descripcion: body.descripcion,
      precio: parseFloat(body.precio),
      precioAnterior: body.precioAnterior ? parseFloat(body.precioAnterior) : null,
      descuento: body.descuento || null,
      envioGratis: body.envioGratis === 'true' || body.envioGratis === true,
      stock: parseInt(body.stock, 10),
      masComprado: body.masComprado === 'true' || body.masComprado === true,
      ultimoAgregado: body.ultimoAgregado === 'true' || body.ultimoAgregado === true,
    };

    if (file) {
      const resCloudinary = await this.cloudinaryService.uploadImage(file);
      updateData.imagen = (resCloudinary as any).secure_url;
    } else if (body.imagen) {
      updateData.imagen = body.imagen;
    }

    return this.productosService.update(id, updateData);
  }

  // DELETE /productos/:id -> Eliminar producto
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productosService.delete(id);
  }

  @Patch(':id/comprar')
  comprar(
    @Param('id') id: string,
    @Body('cantidad') cantidad: number = 1,
  ) {
    return this.productosService.procesarCompra(id, cantidad);
  }
}