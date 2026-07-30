"use client";

import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, Check, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ZONES_TOP = [
  { id: "top_front_bumper", label: "Defensa Delantera", x: 10, y: 10, w: 80, h: 15, rx: 5 },
  { id: "top_hood", label: "Capó", x: 15, y: 25, w: 70, h: 50, rx: 2 },
  { id: "top_windshield", label: "Parabrisas", x: 15, y: 75, w: 70, h: 25, rx: 4 },
  { id: "top_roof", label: "Techo", x: 15, y: 100, w: 70, h: 60, rx: 2 },
  { id: "top_rear_window", label: "Vidrio Trasero", x: 15, y: 160, w: 70, h: 25, rx: 4 },
  { id: "top_trunk", label: "Cajuela", x: 15, y: 185, w: 70, h: 40, rx: 2 },
  { id: "top_rear_bumper", label: "Defensa Trasera", x: 10, y: 225, w: 80, h: 15, rx: 5 },
];

const ZONES_LEFT = [
  { id: "left_front_bumper", label: "Defensa Delantera Izq.", x: 10, y: 35, w: 10, h: 25, rx: 3 },
  { id: "left_front_fender", label: "Guardafango Del. Izq.", x: 20, y: 25, w: 40, h: 35, rx: 2 },
  { id: "left_front_door", label: "Puerta Delantera Izq.", x: 60, y: 20, w: 50, h: 40, rx: 2 },
  { id: "left_rear_door", label: "Puerta Trasera Izq.", x: 110, y: 20, w: 40, h: 40, rx: 2 },
  { id: "left_rear_quarter", label: "Cuarto Trasero Izq.", x: 150, y: 25, w: 60, h: 35, rx: 2 },
  { id: "left_rear_bumper", label: "Defensa Trasera Izq.", x: 210, y: 35, w: 15, h: 25, rx: 3 },
  { id: "left_front_wheel", label: "Rueda Delantera Izq.", x: 28, y: 45, w: 30, h: 30, rx: 15 },
  { id: "left_rear_wheel", label: "Rueda Trasera Izq.", x: 160, y: 45, w: 30, h: 30, rx: 15 },
];

const ZONES_RIGHT = [
  { id: "right_front_bumper", label: "Defensa Delantera Der.", x: 10, y: 35, w: 10, h: 25, rx: 3 },
  { id: "right_front_fender", label: "Guardafango Del. Der.", x: 20, y: 25, w: 40, h: 35, rx: 2 },
  { id: "right_front_door", label: "Puerta Delantera Der.", x: 60, y: 20, w: 50, h: 40, rx: 2 },
  { id: "right_rear_door", label: "Puerta Trasera Der.", x: 110, y: 20, w: 40, h: 40, rx: 2 },
  { id: "right_rear_quarter", label: "Cuarto Trasero Der.", x: 150, y: 25, w: 60, h: 35, rx: 2 },
  { id: "right_rear_bumper", label: "Defensa Trasera Der.", x: 210, y: 35, w: 15, h: 25, rx: 3 },
  { id: "right_front_wheel", label: "Rueda Delantera Der.", x: 28, y: 45, w: 30, h: 30, rx: 15 },
  { id: "right_rear_wheel", label: "Rueda Trasera Der.", x: 160, y: 45, w: 30, h: 30, rx: 15 },
];

const ALL_ZONES = [...ZONES_TOP, ...ZONES_LEFT, ...ZONES_RIGHT];

const DAMAGE_TYPES = [
  { id: "rayon", label: "Rayón", color: "bg-yellow-500" },
  { id: "abolladura", label: "Abolladura", color: "bg-orange-500" },
  { id: "roto", label: "Roto/Quebrado", color: "bg-red-600" },
  { id: "pintura", label: "Falla de Pintura", color: "bg-purple-500" },
];

export function CarDamageMapper({ value = {}, onChange, readOnly = false }) {
  const [activeZone, setActiveZone] = useState(null);

  const handleToggleDamage = (zoneId, damageTypeId) => {
    if (readOnly) return;
    
    const newValue = { ...value };
    
    if (newValue[zoneId] === damageTypeId) {
      delete newValue[zoneId];
    } else {
      newValue[zoneId] = damageTypeId;
    }
    
    onChange(newValue);
    setActiveZone(null); 
  };

  const handleClearZone = (zoneId) => {
    if (readOnly) return;
    const newValue = { ...value };
    delete newValue[zoneId];
    onChange(newValue);
    setActiveZone(null);
  };

  const getDamageHex = (damageId) => {
    switch (damageId) {
      case "rayon": return "#eab308";
      case "abolladura": return "#f97316";
      case "roto": return "#dc2626";
      case "pintura": return "#a855f7";
      default: return "";
    }
  };

  const renderSVGView = (zones, viewBox, containerWidth, containerHeight, isSideView = false) => {
    const isRight = zones === ZONES_RIGHT;

    return (
      <div className={`relative ${containerWidth} mx-auto`} style={{ height: containerHeight }}>
        <svg viewBox={viewBox} className={`w-full h-full drop-shadow-md absolute inset-0 pointer-events-none ${isRight ? 'scale-x-[-1]' : ''}`}>
          
          {/* BASE CAR LAYER */}
          {isSideView ? (
            <g className="fill-muted/30 stroke-border">
              {/* Body */}
              <path d="M 10 50 C 10 30 30 30 65 25 L 110 25 C 135 25 150 35 160 45 L 210 50 C 225 52 230 55 230 65 L 230 75 L 205 75 A 15 15 0 0 0 175 75 L 75 75 A 15 15 0 0 0 45 75 L 10 75 Z" strokeWidth="1.5" />
              {/* Windows */}
              <path d="M 65 28 L 105 28 L 105 45 L 45 45 Z" className="fill-sky-500/10 stroke-sky-500/20" strokeWidth="1" />
              <path d="M 110 28 L 140 28 L 150 45 L 110 45 Z" className="fill-sky-500/10 stroke-sky-500/20" strokeWidth="1" />
              {/* Wheels */}
              <circle cx="60" cy="75" r="14" className="fill-slate-800" />
              <circle cx="60" cy="75" r="7" className="fill-slate-300" />
              <circle cx="190" cy="75" r="14" className="fill-slate-800" />
              <circle cx="190" cy="75" r="7" className="fill-slate-300" />
              {/* Details (doors, handles) */}
              <path d="M 105 45 L 105 75" strokeWidth="0.5" className="stroke-border/50" />
              <path d="M 60 75 L 60 45" strokeWidth="0.5" className="stroke-border/50" />
              <path d="M 155 48 L 155 75" strokeWidth="0.5" className="stroke-border/50" />
              <rect x="75" y="48" width="6" height="2" rx="1" className="fill-border/50" />
              <rect x="115" y="48" width="6" height="2" rx="1" className="fill-border/50" />
            </g>
          ) : (
            <g className="fill-muted/30 stroke-border">
              {/* Body */}
              <path d="M 15 40 C 15 15 25 10 50 10 C 75 10 85 15 85 40 L 85 210 C 85 235 75 240 50 240 C 25 240 15 235 15 210 Z" strokeWidth="1.5" />
              {/* Windshield */}
              <path d="M 22 75 C 22 65 78 65 78 75 L 75 100 L 25 100 Z" className="fill-sky-500/10 stroke-sky-500/20" strokeWidth="1" />
              {/* Rear Window */}
              <path d="M 25 155 L 75 155 L 78 180 C 78 190 22 190 22 180 Z" className="fill-sky-500/10 stroke-sky-500/20" strokeWidth="1" />
              {/* Roof */}
              <rect x="25" y="100" width="50" height="55" rx="5" className="fill-muted/50 stroke-border/50" strokeWidth="1" />
              {/* Mirrors */}
              <path d="M 15 80 C 5 80 5 95 15 95 Z" className="fill-muted/80 stroke-border" />
              <path d="M 85 80 C 95 80 95 95 85 95 Z" className="fill-muted/80 stroke-border" />
              {/* Lines (Hood, Trunk) */}
              <path d="M 22 75 C 22 65 78 65 78 75" strokeWidth="1" className="stroke-border/50 fill-none" />
              <path d="M 25 35 L 75 35" strokeWidth="1" className="stroke-border/50 fill-none" />
              <path d="M 25 210 L 75 210" strokeWidth="1" className="stroke-border/50 fill-none" />
            </g>
          )}

          {/* OVERLAYS FOR ZONES */}
          {zones.map((zone) => {
            const hasDamage = !!value[zone.id];
            const isWheel = zone.id.includes("wheel");
            
            // Only render overlays if there is damage (or on hover, but hover is handled by the invisible button now)
            if (!hasDamage) return null;

            return (
              <rect
                key={`svg-${zone.id}`}
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                rx={zone.rx}
                ry={zone.rx}
                className="transition-all duration-200"
                style={{
                  fill: getDamageHex(value[zone.id]),
                  stroke: "white",
                  strokeWidth: 2,
                  opacity: 0.85
                }}
              />
            );
          })}
        </svg>

        {/* Interactive HTML Overlays */}
        {zones.map((zone) => {
          const hasDamage = !!value[zone.id];
          const isWheel = zone.id.includes("wheel");
          
          // Calculate percentage coordinates
          const [vbX, vbY, vbW, vbH] = viewBox.split(" ").map(Number);
          const leftPct = (zone.x / vbW) * 100;
          const topPct = (zone.y / vbH) * 100;
          const widthPct = (zone.w / vbW) * 100;
          const heightPct = (zone.h / vbH) * 100;

          return (
            <Popover 
              key={zone.id} 
              open={activeZone === zone.id} 
              onOpenChange={(open) => {
                if (!readOnly) setActiveZone(open ? zone.id : null);
              }}
            >
              <PopoverTrigger asChild>
                <button
                  className={`absolute cursor-pointer transition-all duration-200 hover:bg-black/20 ${readOnly ? "pointer-events-none" : ""}`}
                  style={{
                    left: isRight ? `${100 - leftPct - widthPct}%` : `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                    borderRadius: isWheel ? "50%" : (zone.rx ? `${zone.rx}px` : "0"),
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    boxShadow: activeZone === zone.id ? "inset 0 0 0 2px rgba(0,0,0,0.1)" : "none"
                  }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" side="top" align="center">
                <div className="mb-3 flex justify-between items-center">
                  <h4 className="font-semibold text-sm">{zone.label}</h4>
                  {hasDamage && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleClearZone(zone.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {DAMAGE_TYPES.map(type => (
                    <Button
                      key={type.id}
                      variant={value[zone.id] === type.id ? "default" : "outline"}
                      size="sm"
                      className={`justify-start ${value[zone.id] === type.id ? type.color + " text-white hover:text-white" : ""}`}
                      onClick={() => handleToggleDamage(zone.id, type.id)}
                    >
                      {value[zone.id] === type.id && <Check className="w-3 h-3 mr-2" />}
                      {type.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 items-start w-full">
      {/* Visual Car SVG Views (Tabs) */}
      <Tabs defaultValue="top" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="left">Lateral Izquierdo</TabsTrigger>
          <TabsTrigger value="top">Superior</TabsTrigger>
          <TabsTrigger value="right">Lateral Derecho</TabsTrigger>
        </TabsList>
        
        <div className="border rounded-xl bg-muted/20 p-8 min-h-[350px] flex items-center justify-center">
          <TabsContent value="top" className="mt-0 w-full">
            {renderSVGView(ZONES_TOP, "0 0 100 250", "w-[120px]", "300px")}
          </TabsContent>
          <TabsContent value="left" className="mt-0 w-full">
            {renderSVGView(ZONES_LEFT, "0 0 240 90", "w-full max-w-[400px]", "150px", true)}
          </TabsContent>
          <TabsContent value="right" className="mt-0 w-full">
            {renderSVGView(ZONES_RIGHT, "0 0 240 90", "w-full max-w-[400px]", "150px", true)}
          </TabsContent>
        </div>
      </Tabs>

      {/* Legend and Active Damages List */}
      <div className="space-y-6 w-full bg-background/50 p-4 rounded-lg border">
        <div>
          <h4 className="text-sm font-semibold mb-2 text-default-700 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Leyenda de Daños
          </h4>
          <div className="flex flex-wrap gap-2">
            {DAMAGE_TYPES.map(type => (
              <div key={type.id} className="flex items-center gap-2 text-xs font-medium">
                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                {type.label}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 text-default-700">Daños Registrados</h4>
          {Object.keys(value).length === 0 ? (
            <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md">El vehículo no presenta daños registrados.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(value).map(([zoneId, damageId]) => {
                const zone = ALL_ZONES.find(z => z.id === zoneId);
                const damage = DAMAGE_TYPES.find(d => d.id === damageId);
                
                if (!zone || !damage) return null;
                
                return (
                  <div key={zoneId} className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border text-sm">
                    <span className="font-medium truncate mr-2">{zone.label}</span>
                    <Badge variant="outline" className={`${damage.color} text-white border-none shrink-0`}>
                      {damage.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
