"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCuentas, createCuenta, updateCuenta, deleteCuenta } from "@/config/finanzas.config";
import { toast } from "react-hot-toast";
import { 
  Wallet, 
  CreditCard, 
  DollarSign, 
  Plus,
  Pencil,
  Trash2,
  Building2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CuentasPage = () => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCuenta, setSelectedCuenta] = useState(null);
  const [cuentaToDelete, setCuentaToDelete] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "banco",
    numeroCuenta: "",
    banco: "",
    saldo: "",
    moneda: "USD",
    estado: "activo",
    descripcion: "",
  });

  const fetchCuentas = async () => {
    setLoading(true);
    try {
      const response = await getCuentas();
      if (response.status === "success") {
        setCuentas(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al cargar cuentas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuentas();
  }, []);

  const handleOpenForm = (cuenta = null) => {
    if (cuenta) {
      setSelectedCuenta(cuenta);
      setFormData({
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        numeroCuenta: cuenta.numeroCuenta || "",
        banco: cuenta.banco || "",
        saldo: String(cuenta.saldo),
        moneda: cuenta.moneda,
        estado: cuenta.estado,
        descripcion: cuenta.descripcion || "",
      });
    } else {
      setSelectedCuenta(null);
      setFormData({
        nombre: "",
        tipo: "banco",
        numeroCuenta: "",
        banco: "",
        saldo: "",
        moneda: "USD",
        estado: "activo",
        descripcion: "",
      });
    }
    setFormDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        saldo: parseFloat(formData.saldo) || 0,
      };

      const response = selectedCuenta
        ? await updateCuenta(selectedCuenta.id, data)
        : await createCuenta(data);

      if (response.status === "success") {
        toast.success(selectedCuenta ? "Cuenta actualizada" : "Cuenta creada");
        setFormDialogOpen(false);
        await fetchCuentas();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al guardar cuenta");
    }
  };

  const handleDelete = async () => {
    if (!cuentaToDelete) return;
    try {
      const response = await deleteCuenta(cuentaToDelete.id);
      if (response.status === "success") {
        toast.success("Cuenta eliminada");
        await fetchCuentas();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al eliminar cuenta");
    } finally {
      setDeleteDialogOpen(false);
      setCuentaToDelete(null);
    }
  };

  const totalSaldo = cuentas.reduce((sum, c) => sum + c.saldo, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando cuentas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            Gestión de Cuentas
          </h2>
          <p className="text-muted-foreground">
            Administra tus cuentas bancarias y de efectivo
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          Nueva Cuenta
        </Button>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-primary text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Balance Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            ${totalSaldo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-blue-100 mt-2">
            {cuentas.length} cuenta(s) activa(s)
          </p>
        </CardContent>
      </Card>


      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cuentas.map((cuenta) => (
          <Card key={cuenta.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {cuenta.tipo === "banco" && <Building2 className="h-5 w-5 text-blue-600" />}
                  {cuenta.tipo === "efectivo" && <DollarSign className="h-5 w-5 text-green-600" />}
                  {cuenta.tipo === "tarjeta" && <CreditCard className="h-5 w-5 text-purple-600" />}
                  <CardTitle className="text-lg">{cuenta.nombre}</CardTitle>
                </div>
                <Badge variant="outline" className="capitalize">
                  {cuenta.tipo}
                </Badge>
              </div>
              {cuenta.banco && (
                <p className="text-sm text-muted-foreground">{cuenta.banco}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {cuenta.numeroCuenta && (
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{cuenta.numeroCuenta}</span>
                </div>
              )}
              
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground mb-1">Saldo Actual</p>
                <p className={`text-2xl font-bold flex items-center gap-2 ${
                  cuenta.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {cuenta.saldo >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  ${cuenta.saldo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {cuenta.descripcion && (
                <p className="text-sm text-muted-foreground pt-2 border-t">
                  {cuenta.descripcion}
                </p>
              )}

              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenForm(cuenta)}
                >
                  <Pencil className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCuentaToDelete(cuenta);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Card */}
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleOpenForm()}>
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px]">
            <Plus className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Agregar Nueva Cuenta</p>
            <p className="text-sm text-muted-foreground">
              Click para crear una cuenta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {selectedCuenta ? "Editar Cuenta" : "Nueva Cuenta"}
            </DialogTitle>
            <DialogDescription>
              {selectedCuenta ? "Actualiza la información de la cuenta" : "Completa el formulario para crear una nueva cuenta"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Cuenta</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Banco Principal"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banco">Banco</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saldo">Saldo Inicial</Label>
                  <Input
                    id="saldo"
                    type="number"
                    step="0.01"
                    value={formData.saldo}
                    onChange={(e) => setFormData({ ...formData, saldo: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banco">Banco</Label>
                  <Input
                    id="banco"
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                    placeholder="Nombre del banco"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroCuenta">Número de Cuenta</Label>
                  <Input
                    id="numeroCuenta"
                    value={formData.numeroCuenta}
                    onChange={(e) => setFormData({ ...formData, numeroCuenta: e.target.value })}
                    placeholder="****1234"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción de la cuenta"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedCuenta ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              ¿Eliminar cuenta?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la cuenta{" "}
              <span className="font-semibold">{cuentaToDelete?.nombre}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCuentaToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CuentasPage;

