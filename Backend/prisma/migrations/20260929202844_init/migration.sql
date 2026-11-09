-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "precioAnterior" DOUBLE PRECISION,
    "descuento" TEXT,
    "envioGratis" BOOLEAN NOT NULL DEFAULT false,
    "imagen" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 10,
    "masComprado" BOOLEAN NOT NULL DEFAULT false,
    "ultimoAgregado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);
