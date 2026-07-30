"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Car, Fuel, Loader2, Save, X, AlertTriangle } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-hot-toast";

const VALUABLES_OPTIONS = [
  { id: "llanta_repuesto", label: "Llanta de Repuesto" },
  { id: "gata_herramientas", label: "Gata y Herramientas" },
  { id: "radio_panel", label: "Radio / Panel desmontable" },
  { id: "documentos", label: "Documentos del auto" },
];

import { CarDamageMapper } from "./car-damage-mapper";

export function IntakeChecklistModal({ open, onClose, eventData, onSaveSuccess }) {
  const [fuelLevel, setFuelLevel] = useState([50]); // 0 to 100
  const [mileage, setMileage] = useState("");
  const [damages, setDamages] = useState({}); // Now an object
  const [valuables, setValuables] = useState([]);
  const [notes, setNotes] = useState("");
  
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to handle checkbox arrays
  const handleToggle = (id, stateList, setStateList) => {
    if (stateList.includes(id)) {
      setStateList(stateList.filter((item) => item !== id));
    } else {
      setStateList([...stateList, id]);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    const uploadedUrls = [...photos];

    try {
      for (const file of files) {
        const storageRef = ref(storage, `inspections/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
      }
      setPhotos(uploadedUrls);
      toast.success("Fotos subidas correctamente");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error al subir fotos");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const getFuelLabel = (val) => {
    if (val < 15) return "Reserva";
    if (val < 35) return "1/4";
    if (val < 65) return "1/2";
    if (val < 85) return "3/4";
    return "Lleno";
  };

  const handleSave = async () => {
    if (!eventData?.extendedProps?.car_name && !eventData?.extendedProps?.carId) {
      toast.error("Error: No se encontró información del vehículo.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        car_id: eventData?.extendedProps?.carId || null,
        car_name: eventData?.extendedProps?.car_name || null,
        client_id: eventData?.extendedProps?.clientId || null,
        client_name: eventData?.extendedProps?.client_name || null,
        calendar_event_id: eventData.id,
        fuel_level: getFuelLabel(fuelLevel[0]),
        mileage,
        exterior_damage: damages,
        valuables: valuables,
        photos,
        notes,
      };

      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Recepción guardada con éxito");
        if (onSaveSuccess) onSaveSuccess(data.data);
        onClose();
      } else {
        throw new Error(data.message || "Error al guardar");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Car className="w-6 h-6 text-primary" />
            Checklist de Recepción
          </DialogTitle>
          <DialogDescription>
            Documenta el estado del vehículo al momento de ingresar al taller.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          
          {/* Nivel de Combustible & Kilometraje */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
              <div className="flex justify-between items-center">
                <Label className="text-base flex items-center gap-2">
                  <Fuel className="w-4 h-4" /> Nivel de Combustible
                </Label>
                <span className="font-bold text-primary">{getFuelLabel(fuelLevel[0])}</span>
              </div>
              <Slider
                value={fuelLevel}
                onValueChange={setFuelLevel}
                max={100}
                step={25}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>E</span>
                <span>1/4</span>
                <span>1/2</span>
                <span>3/4</span>
                <span>F</span>
              </div>
            </div>

            <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
              <Label className="text-base">Kilometraje Actual</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="Ej. 45000" 
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="text-lg"
                />
                <span className="text-muted-foreground font-medium">km/mi</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2 text-destructive mb-4">
                <AlertTriangle className="w-5 h-5" /> Mapeo de Daños del Vehículo
              </Label>
              <CarDamageMapper value={damages} onChange={setDamages} />
            </div>

            <div className="space-y-3 pt-6 border-t">
              <Label className="text-base flex items-center gap-2">
                Objetos de Valor / Inventario
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {VALUABLES_OPTIONS.map((opt) => (
                  <label key={opt.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <Checkbox
                      checked={valuables.includes(opt.id)}
                      onCheckedChange={() => handleToggle(opt.id, valuables, setValuables)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Fotografías */}
          <div className="space-y-4">
            <Label className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4" /> Fotografías de Recepción
            </Label>
            <div className="flex flex-wrap gap-4">
              {photos.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border shadow-sm">
                  <img src={url} alt="inspection" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <label className="w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors text-muted-foreground hover:text-primary">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Añadir</span>
                  </>
                )}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {/* Notas Adicionales */}
          <div className="space-y-2">
            <Label className="text-base">Notas Adicionales</Label>
            <Textarea 
              placeholder="Escribe si hay algún detalle especial, comportamiento inusual al llegar, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving || isUploading} className="w-full sm:w-auto">
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar Recepción
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
