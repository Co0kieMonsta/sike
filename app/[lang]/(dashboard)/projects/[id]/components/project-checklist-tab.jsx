"use client";

import { useState, useEffect } from "react";
import { updateProject } from "@/config/projects.config";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Save, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const defaultChecklist = [
  { id: "frenos", category: "Seguridad", label: "Sistema de Frenos (Balatas, Discos)", status: "na", notes: "" },
  { id: "llantas", category: "Seguridad", label: "Estado y Presión de Llantas", status: "na", notes: "" },
  { id: "luces", category: "Seguridad", label: "Luces Exteriores e Interiores", status: "na", notes: "" },
  { id: "aceite", category: "Fluidos", label: "Nivel y Estado del Aceite", status: "na", notes: "" },
  { id: "refrigerante", category: "Fluidos", label: "Líquido Refrigerante", status: "na", notes: "" },
  { id: "bateria", category: "Eléctrico", label: "Estado de la Batería", status: "na", notes: "" },
  { id: "bandas", category: "Mecánico", label: "Bandas y Poleas", status: "na", notes: "" },
];

const ProjectChecklistTab = ({ project, onUpdate }) => {
  const router = useRouter();
  const [checklist, setChecklist] = useState([]);
  const [inspectionDetails, setInspectionDetails] = useState({
    mileage: "",
    fuelLevel: "50",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project?.checklist && project.checklist.length > 0) {
      setChecklist(project.checklist);
    } else {
      setChecklist(defaultChecklist);
    }
    
    if (project?.inspectionDetails) {
      setInspectionDetails(project.inspectionDetails);
    }
  }, [project]);

  const handleUpdateItem = (id, field, value) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveChecklist = async () => {
    setLoading(true);
    try {
      const response = await updateProject(project.id, {
        ...project,
        checklist,
        inspectionDetails,
      });
      if (response.status === "success") {
        toast.success("Checklist guardado exitosamente");
        if (onUpdate) onUpdate();
        router.refresh();
      } else {
        toast.error("Error al guardar checklist");
      }
    } catch (error) {
      toast.error("Error al guardar checklist");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "bien":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "atencion":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text("Reporte de Inspección Vehicular", 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Proyecto: ${project.title || "N/A"}`, 14, 36);
    doc.text(`Cliente: ${project.client || "N/A"}`, 14, 42);
    doc.text(`Vehículo: ${project.carName || "N/A"}`, 14, 48);
    
    // Inspection Details
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text("Datos de Ingreso", 14, 60);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Kilometraje: ${inspectionDetails.mileage || "N/A"} km`, 14, 68);
    doc.text(`Nivel de Combustible: ${inspectionDetails.fuelLevel || "0"}%`, 14, 74);
    if (inspectionDetails.notes) {
      doc.text(`Notas Adicionales:`, 14, 80);
      const splitNotes = doc.splitTextToSize(inspectionDetails.notes, 180);
      doc.text(splitNotes, 14, 86);
    }

    // Checklist Table
    const tableStartY = inspectionDetails.notes ? 86 + (doc.splitTextToSize(inspectionDetails.notes, 180).length * 6) + 10 : 86;
    
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text("Puntos de Inspección", 14, tableStartY - 6);

    const tableData = checklist.map(item => {
      let statusText = "No Revisado";
      if (item.status === "bien") statusText = "Buen Estado";
      if (item.status === "atencion") statusText = "Requiere Atención";
      return [
        item.category,
        item.label,
        statusText,
        item.notes || "-"
      ];
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [['Categoría', 'Punto de Revisión', 'Estado', 'Notas']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text("Firma del Cliente: ___________________________", 14, finalY);
    doc.text("Firma del Mecánico: ________________________", 120, finalY);

    doc.save(`Inspeccion_${project.carName ? project.carName.replace(/\s+/g, "_") : "Vehiculo"}.pdf`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Checklist de Inspección</CardTitle>
          <CardDescription>
            Realiza una revisión general del vehículo para detectar necesidades adicionales o respaldar su estado de ingreso.
          </CardDescription>
        </div>
        <Button variant="outline" onClick={handleGeneratePDF}>
          Generar PDF
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Inspection Details Section */}
        <div className="grid gap-6 md:grid-cols-2 p-4 border rounded-lg bg-muted/20">
          <div className="space-y-2">
            <Label htmlFor="mileage">Kilometraje Actual (km)</Label>
            <Input
              id="mileage"
              type="number"
              placeholder="Ej. 120000"
              value={inspectionDetails.mileage}
              onChange={(e) => setInspectionDetails({ ...inspectionDetails, mileage: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuelLevel">Nivel de Combustible</Label>
            <Select
              value={inspectionDetails.fuelLevel}
              onValueChange={(val) => setInspectionDetails({ ...inspectionDetails, fuelLevel: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Reserva (0%)</SelectItem>
                <SelectItem value="25">1/4 Tanque (25%)</SelectItem>
                <SelectItem value="50">1/2 Tanque (50%)</SelectItem>
                <SelectItem value="75">3/4 Tanque (75%)</SelectItem>
                <SelectItem value="100">Lleno (100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bodyNotes">Notas de Carrocería / Generales</Label>
            <Textarea
              id="bodyNotes"
              placeholder="Ej. Rayón en puerta derecha, falta tapón de llanta..."
              value={inspectionDetails.notes}
              onChange={(e) => setInspectionDetails({ ...inspectionDetails, notes: e.target.value })}
            />
          </div>
        </div>

        {/* Checklist Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Puntos de Revisión</h3>
          {checklist.map((item) => (
            <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{item.category}</p>
                <p className="font-medium mt-1 flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  {item.label}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Select
                  value={item.status}
                  onValueChange={(val) => handleUpdateItem(item.id, "status", val)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bien">En Buen Estado</SelectItem>
                    <SelectItem value="atencion">Requiere Atención</SelectItem>
                    <SelectItem value="na">No Revisado (N/A)</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Notas/Observaciones..."
                  className="w-full sm:w-[250px]"
                  value={item.notes}
                  onChange={(e) => handleUpdateItem(item.id, "notes", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveChecklist} disabled={loading}>
            {loading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>}
            <Save className="mr-2 h-4 w-4" />
            Guardar Inspección
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectChecklistTab;
