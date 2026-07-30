"use client";

import React, { forwardRef } from "react";
import { SiteLogo } from "@/components/svg";

export const ReceiptPrint = forwardRef(({ project, transaction }, ref) => {
  if (!project || !transaction) return null;

  return (
    <div ref={ref} className="p-8 bg-white text-black w-full" style={{ maxWidth: "148mm", minHeight: "210mm", margin: "0 auto", boxSizing: "border-box" }}>
      {/* A5 size roughly 148 x 210 mm */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-2">
          <SiteLogo className="h-10 w-10 text-black" />
          <h1 className="text-2xl font-bold uppercase tracking-wider">SIKE Auto</h1>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase">Recibo de Pago</h2>
          <p className="text-sm text-gray-600">N° {transaction.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-500">Fecha:</p>
            <p className="font-medium">{new Date(transaction.fecha).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500">Cliente:</p>
            <p className="font-medium">{project.client || "Cliente Mostrador"}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500">Vehículo:</p>
            <p className="font-medium">{project.carName || "N/A"}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500">Método de Pago:</p>
            <p className="font-medium uppercase">{transaction.metodoPago}</p>
          </div>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 font-semibold text-gray-700">Descripción</th>
              <th className="p-3 font-semibold text-gray-700 text-right">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="p-3">{transaction.descripcion}</td>
              <td className="p-3 text-right font-medium">${Number(transaction.monto).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-12">
        <div className="w-1/2 space-y-2 text-sm">
          <div className="flex justify-between border-t border-black pt-2 font-bold text-lg">
            <span>Total Pagado:</span>
            <span>${Number(transaction.monto).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Presupuesto Total:</span>
            <span>${Number(project.budget || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-300 text-center">
        <div className="w-48 border-t-2 border-black mx-auto mb-2"></div>
        <p className="text-sm font-semibold uppercase">Firma de Recibido</p>
        <p className="text-xs text-gray-500 mt-4">Gracias por su preferencia.</p>
        <p className="text-xs text-gray-500">Este documento es un comprobante de pago no válido para crédito fiscal.</p>
      </div>
    </div>
  );
});

ReceiptPrint.displayName = "ReceiptPrint";
