import {
  DashBoard,
  Graph,
  Bank,
  ClipBoard,
  Chart,
  User,
  Application
} from "@/components/svg";
import { FileText } from "lucide-react";

export const menusConfig = {
  mainNav: [

    {
      title: "Finanzas",
      icon: Bank,
      child: [
        {
          title: "Dashboard",
          href: "/financedash",
          icon: Graph,
        },
        {
          title: "Transacciones",
          href: "/transactions",
          icon: DashBoard,
        },
        {
          title: "Cuentas",
          href: "/cuentas",
          icon: Bank,
        },
        {
          title: "Categorías",
          href: "/categorias",
          icon: ClipBoard,
        },
        {
          title: "Reportes",
          href: "/reportes",
          icon: Chart,
        },
      ],
    },
    {
      title: "Usuarios",
      icon: User,
      href: "/users",
    }
  ],
  sidebarNav: {
    classic: [
      {
        isHeader: true,
        title: "Principal",
      },

      {
        title: "Usuarios",
        icon: User,
        href: "/users",
      },
      {
        isHeader: true,
        title: "Módulos Integrados",
      },
      {
        title: "Finanzas",
        icon: Bank,
        href: "/finance", // This is just the parent wrapper in the menu
        isOpen: true,
        isHide: false,
        child: [
          {
            title: "Dashboard",
            href: "/financedash",
            icon: Graph,
          },
          {
            title: "Transacciones",
            href: "/transactions",
            icon: DashBoard,
          },
          {
            title: "Cuentas",
            href: "/cuentas",
            icon: Bank,
          },
          {
            title: "Categorías",
            href: "/categorias",
            icon: ClipBoard,
          },
          {
            title: "Reportes",
            href: "/reportes",
            icon: Chart,
          },
        ],
      },
      {
        title: "Documentos",
        icon: ClipBoard,
        href: "/cotizaciones",
        isOpen: true,
        isHide: false,
        child: [
          {
            title: "Cotizaciones",
            href: "/cotizaciones",
            icon: FileText,
          }
        ]
      }
    ],
  },
};
